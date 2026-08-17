import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConversationRepository } from './conversation.repository';
import { ExecutiveRepository } from '../executive/executive.repository';
import { AiService } from '../ai/ai.service';
import { Conversation, ChatMessage, MissionStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly executiveRepository: ExecutiveRepository,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createConversation(
    companyId: string,
    userId: string,
    title: string,
  ): Promise<Conversation> {
    const conv = await this.conversationRepository.create({
      companyId,
      title,
    });

    this.eventEmitter.emit('notification.created', {
      title: '💬 New Boardroom Discussion Initiated',
      message: `Boardroom discussion started: "${title}"`,
      companyId,
      category: 'EXECUTIVE',
      priority: 'MEDIUM',
      actionUrl: `/discussions/${conv.id}`,
    });

    return conv;
  }

  async startDiscussion(
    userId: string,
    companyId: string,
    objective: string,
    keys?: string[],
  ): Promise<Conversation> {
    return this.createConversation(companyId, userId, objective);
  }

  async getConversations(
    companyId: string,
    filters?:
      { isPinned?: boolean; isArchived?: boolean; search?: string } | boolean,
  ): Promise<Conversation[]> {
    if (typeof filters === 'boolean') {
      return this.conversationRepository.findByCompanyId(companyId, {
        isArchived: filters,
      });
    }
    return this.conversationRepository.findByCompanyId(companyId, filters);
  }

  async getConversation(
    id: string,
    companyId?: string,
  ): Promise<Conversation & { messages: ChatMessage[] }> {
    const conv = await this.conversationRepository.findById(id, companyId);
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }

  async saveMessage(
    conversationId: string,
    senderId: string,
    senderType: string,
    content: string,
  ): Promise<ChatMessage> {
    const conv = await this.conversationRepository.findById(conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');

    return this.conversationRepository.createMessage({
      conversationId,
      senderId,
      senderType,
      content,
    });
  }

  async submitMessage(
    conversationId: string,
    senderId: string,
    senderType: string,
    content: string,
  ): Promise<ChatMessage[]> {
    const conv = await this.conversationRepository.findById(conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');

    // Fetch real company name for prompts — never hardcode
    let companyName = 'your organization';
    try {
      const company = await this.prisma.company.findUnique({
        where: { id: conv.companyId },
      });
      if (company?.name) companyName = company.name;
    } catch {
      // Non-fatal — fallback to generic
    }

    // 1. Save user message
    await this.conversationRepository.createMessage({
      conversationId,
      senderId,
      senderType,
      content,
    });

    // 2. Fetch REAL active executives for this org — no fake fallback names or UUIDs
    const rawExecutives = await this.prisma.executive.findMany({
      where: {
        isActiveInWorkspace: true,
        department: { companyId: conv.companyId },
      },
      include: { department: true },
      take: 4, // Cap at 4 responding executives per message for cost/speed
      orderBy: { createdAt: 'asc' },
    });

    if (rawExecutives.length === 0) {
      this.logger.warn(
        `[ConversationService] No active executives found for company ${conv.companyId}. ` +
          `Cannot generate boardroom deliberation.`,
      );
      // Save a system notice — no fake executive responses
      const systemMsg = await this.conversationRepository.createMessage({
        conversationId,
        senderId: conv.companyId,
        senderType: 'SYSTEM',
        content:
          'No active executives are installed in your workspace yet. Visit the Marketplace to install your C-Suite team.',
      });
      return [systemMsg];
    }

    const savedReplies: ChatMessage[] = [];

    // 3. Generate a real AI response for each active executive
    for (const executive of rawExecutives) {
      const executiveReply = await this.generateExecutiveAIResponse(
        executive.name,
        executive.title,
        executive.systemPrompt || null,
        companyName,
        conv.title || 'this strategic session',
        content,
        conv.companyId,
      );

      const msg = await this.conversationRepository.createMessage({
        conversationId,
        senderId: executive.id,
        senderType: 'EXECUTIVE',
        content: executiveReply,
      });

      savedReplies.push(msg);
    }

    // 4. Notify
    const firstExec = rawExecutives[0];
    this.eventEmitter.emit('notification.created', {
      title: `${firstExec.name} Replied`,
      message: `Executive board responded to: "${conv.title}"`,
      companyId: conv.companyId,
      category: 'EXECUTIVE',
      priority: 'MEDIUM',
      actionUrl: `/discussions/${conversationId}`,
    });

    return savedReplies;
  }

  async convertToMission(conversationId: string, userId: string): Promise<any> {
    const conv = await this.getConversation(conversationId);

    const mission = await this.prisma.mission.create({
      data: {
        objective: conv.title || 'Executive Objective',
        companyId: conv.companyId,
        createdBy: userId,
        status: MissionStatus.EXECUTING,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { missionId: mission.id },
    });

    this.eventEmitter.emit('notification.created', {
      title: '🚀 Discussion Converted to Mission',
      message: `Autonomous Mission launched for: "${conv.title}"`,
      companyId: conv.companyId,
      category: 'EXECUTIVE',
      priority: 'HIGH',
      actionUrl: `/missions/${mission.id}`,
    });

    return mission;
  }

  /**
   * Generates an AI response for an executive using the full AiService provider chain.
   * Uses Vertex AI as primary → Gemini → OpenAI → Anthropic → graceful degradation.
   * Never uses hardcoded fake responses.
   */
  private async generateExecutiveAIResponse(
    executiveName: string,
    executiveTitle: string,
    executiveSystemPrompt: string | null,
    companyName: string,
    threadTitle: string,
    userMessage: string,
    companyId?: string,
  ): Promise<string> {
    const systemPrompt =
      executiveSystemPrompt ||
      `You are ${executiveName}, ${executiveTitle} of ${companyName}. ` +
        `Apply your domain expertise to provide authoritative, precise, and actionable executive analysis. ` +
        `Maintain a professional, confident executive tone. Avoid generic boilerplate.`;

    const prompt =
      `You are ${executiveName}, ${executiveTitle} at ${companyName}.\n` +
      `Discussion thread: "${threadTitle}"\n` +
      `The owner says: "${userMessage}"\n\n` +
      `Provide your expert executive response. Be specific, authoritative, and directly relevant to the directive. ` +
      `Structure your response with a clear heading, 2-3 concise action points, and a closing directive.`;

    try {
      const result = await this.aiService.executePrompt({
        prompt,
        systemPrompt,
        temperature: 0.4,
        maxTokens: 512,
        companyId,
        category: 'CONVERSATION',
      });

      if (result.text && result.text.trim().length > 20) {
        this.logger.log(
          `[ConversationService] ${executiveName} response generated via ${result.provider}`,
        );
        return result.text.trim();
      }
    } catch (err) {
      this.logger.warn(
        `[ConversationService] AI generation notice for ${executiveName}: ${err}`,
      );
    }

    // Graceful degradation — no fake content, just a professional unavailable notice
    return (
      `### ${executiveName} — ${executiveTitle}\n\n` +
      `I have received your directive regarding: "${userMessage.substring(0, 100)}"\n\n` +
      `My AI analysis engine is currently initializing. Please resend your message in a moment for a full executive response.`
    );
  }

  async togglePin(id: string): Promise<Conversation> {
    const conv = await this.getConversation(id);
    return this.conversationRepository.update(id, {
      isPinned: !conv.isPinned,
    });
  }

  async toggleArchive(id: string): Promise<Conversation> {
    const conv = await this.getConversation(id);
    return this.conversationRepository.update(id, {
      isArchived: !conv.isArchived,
    });
  }

  async deleteConversation(id: string, companyId?: string): Promise<Conversation> {
    return this.conversationRepository.delete(id, companyId);
  }
}
