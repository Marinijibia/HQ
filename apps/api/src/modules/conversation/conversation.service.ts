import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import { ExecutiveRepository } from '../executive/executive.repository';
import { PrismaService } from '../database/prisma.service';
import {
  Conversation,
  ChatMessage,
  Mission,
  MissionStatus,
  TaskStatus,
} from '@prisma/client';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly executiveRepository: ExecutiveRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getConversations(
    companyId: string,
    filters?: { isPinned?: boolean; isArchived?: boolean; search?: string },
  ): Promise<Conversation[]> {
    return this.conversationRepository.findByCompanyId(companyId, filters);
  }

  async getConversation(id: string): Promise<Conversation> {
    const conv = await this.conversationRepository.findById(id);
    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }
    return conv;
  }

  async startDiscussion(
    userId: string,
    companyId: string,
    objective: string,
    specialistKeys?: string[],
  ): Promise<Conversation> {
    // 1. Determine specialists if not provided
    let keys = specialistKeys;
    if (!keys || keys.length === 0) {
      keys = [];
      const lowerObj = objective.toLowerCase();
      if (
        lowerObj.includes('profit') ||
        lowerObj.includes('money') ||
        lowerObj.includes('billing') ||
        lowerObj.includes('revenue') ||
        lowerObj.includes('finance') ||
        lowerObj.includes('stripe')
      ) {
        keys.push('finance_director');
      }
      if (
        lowerObj.includes('code') ||
        lowerObj.includes('lint') ||
        lowerObj.includes('workspace') ||
        lowerObj.includes('compile') ||
        lowerObj.includes('bug')
      ) {
        keys.push('software_engineering_director');
      }
      if (
        lowerObj.includes('ai') ||
        lowerObj.includes('ml') ||
        lowerObj.includes('model') ||
        lowerObj.includes('prompt') ||
        lowerObj.includes('embeddings')
      ) {
        keys.push('ai_ml_director');
      }
      if (
        lowerObj.includes('security') ||
        lowerObj.includes('firewall') ||
        lowerObj.includes('auth') ||
        lowerObj.includes('token') ||
        lowerObj.includes('keys')
      ) {
        keys.push('security_director');
      }
      if (keys.length === 0) {
        keys.push('strategy_director');
      }
    }

    // Include ceo by default as participant if not present, but she delegates
    // Create the conversation
    const title =
      objective.length > 50 ? objective.substring(0, 47) + '...' : objective;
    const conversation = await this.conversationRepository.create({
      companyId,
      title,
    });

    // 2. Save User objective message
    await this.conversationRepository.createMessage({
      conversationId: conversation.id,
      senderId: userId,
      senderType: 'USER',
      content: objective,
    });

    // Fetch the specialists from db
    const activeSpecialists = [];
    for (const key of keys) {
      const exec = await this.executiveRepository.findByRoleKey(key);
      if (exec) activeSpecialists.push(exec);
    }

    const ceo = await this.executiveRepository.findByRoleKey('ceo');
    const ceoId = ceo ? ceo.id : '00000000-0000-0000-0000-000000000000';

    // 3. Spawn CEO welcome & delegation message
    const specialistNames = activeSpecialists.map((s) => s.name).join(' and ');
    const delegationText =
      activeSpecialists.length > 0
        ? `Owner, I have received your request. I am convening Alistair (Strategy) and ${specialistNames} to evaluate our options. We are running real-time simulations to formulate an outline.`
        : `Owner, I have received your request. I will analyze these strategic targets and compile our operational blueprint shortly.`;

    await this.conversationRepository.createMessage({
      conversationId: conversation.id,
      senderId: ceoId,
      senderType: 'EXECUTIVE',
      content: delegationText,
    });

    // 4. Spawn Specialist initial responses
    for (const spec of activeSpecialists) {
      let specReply = `Reviewing objective parameters. Let's outline dependencies and establish our key deliverables.`;
      if (spec.roleKey === 'finance_director') {
        specReply = `From Alistair and Alistair's finance parameters, we must evaluate credit rates, Stripe gateway hooks, and budget overheads for this outreach campaign.`;
      } else if (spec.roleKey === 'software_engineering_director') {
        specReply = `Evaluating compiler configurations. We will audit any yarn workspace dependencies and check type compliance against schema files.`;
      } else if (spec.roleKey === 'ai_ml_director') {
        specReply = `Establishing context retrieval parameters. Let's compile embeddings for vector storage indexing to ensure semantic query accuracy.`;
      } else if (spec.roleKey === 'security_director') {
        specReply = `Checking security tokens and auth guards. I recommend rotating webhook signature keys to protect endpoint logs.`;
      } else if (spec.roleKey === 'strategy_director') {
        specReply = `Analyzing game-theoretic positioning. Let's prioritize scalable corporate outreach corridors and B2B logistic targets.`;
      }

      await this.conversationRepository.createMessage({
        conversationId: conversation.id,
        senderId: spec.id,
        senderType: 'EXECUTIVE',
        content: specReply,
      });
    }

    return this.getConversation(conversation.id);
  }

  async submitMessage(
    conversationId: string,
    senderId: string,
    senderType: string,
    content: string,
  ): Promise<ChatMessage[]> {
    // 1. Save user message
    await this.conversationRepository.createMessage({
      conversationId,
      senderId,
      senderType,
      content,
    });

    // 2. Trigger automated board responses
    const conv = await this.conversationRepository.findById(conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');

    const ceo = await this.executiveRepository.findByRoleKey('ceo');
    const strategy =
      await this.executiveRepository.findByRoleKey('strategy_director');

    const replies = [];

    // Simulate CEO Response
    if (ceo) {
      replies.push({
        senderId: ceo.id,
        senderType: 'EXECUTIVE',
        content: `Owner, I am syncing with our strategy and operations teams. Alistair, please analyze this proposal regarding "${content}".`,
      });
    }

    // Simulate Strategy Response
    if (strategy) {
      replies.push({
        senderId: strategy.id,
        senderType: 'EXECUTIVE',
        content: `I've analyzed the query: "${content}". Strategically, we should run a cost-benefit calculation to prevent budget overflow. Let's draft a blueprint.`,
      });
    }

    const savedReplies = [];
    for (const reply of replies) {
      const msg = await this.conversationRepository.createMessage({
        conversationId,
        senderId: reply.senderId,
        senderType: reply.senderType,
        content: reply.content,
      });
      savedReplies.push(msg);
    }

    return savedReplies;
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

  async convertToMission(
    conversationId: string,
    userId: string,
  ): Promise<Mission> {
    const conv = await this.conversationRepository.findById(conversationId);
    if (!conv) {
      throw new NotFoundException('Conversation not found');
    }

    // Create a new Mission
    const objective = conv.title || 'Mission derived from Discussion';

    return this.prisma.$transaction(async (tx) => {
      const mission = await tx.mission.create({
        data: {
          objective,
          companyId: conv.companyId,
          status: MissionStatus.PLANNING,
          createdBy: userId,
        },
      });

      // Update Conversation link
      await tx.conversation.update({
        where: { id: conversationId },
        data: { missionId: mission.id },
      });

      // Create a few default tasks
      await tx.missionTask.create({
        data: {
          name: 'Draft Strategic Outreach Plan',
          description: `Analyze context from discussion: ${objective}`,
          status: TaskStatus.PENDING,
          missionId: mission.id,
        },
      });

      await tx.missionTask.create({
        data: {
          name: 'Verify Technical Implementation Feasibility',
          description:
            'Ensure system requirements align with development targets.',
          status: TaskStatus.PENDING,
          missionId: mission.id,
        },
      });

      return mission;
    });
  }
}
