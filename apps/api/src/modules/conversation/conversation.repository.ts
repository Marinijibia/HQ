import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Conversation, ChatMessage } from '@prisma/client';

function toValidUuid(id: string): string {
  if (!id) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (uuidRegex.test(id)) {
    return id;
  }
  const roleMap: Record<string, string> = {
    'exec-ceo': '00000000-0000-0000-0000-000000000001',
    'exec-cto': '00000000-0000-0000-0000-000000000002',
    'exec-cmo': '00000000-0000-0000-0000-000000000003',
    'exec-cfo': '00000000-0000-0000-0000-000000000004',
    'exec-cro': '00000000-0000-0000-0000-000000000005',
    'exec-coo': '00000000-0000-0000-0000-000000000006',
  };
  return roleMap[id] || '00000000-0000-0000-0000-000000000000';
}

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<(Conversation & { messages: ChatMessage[] }) | null> {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        mission: true,
      },
    });
  }

  async findByCompanyId(
    companyId: string,
    filters?: { isPinned?: boolean; isArchived?: boolean; search?: string },
  ): Promise<Conversation[]> {
    const where: {
      companyId: string;
      isPinned?: boolean;
      isArchived?: boolean;
      title?: { contains: string; mode: 'insensitive' };
    } = { companyId: toValidUuid(companyId) };

    if (filters) {
      if (filters.isPinned !== undefined) {
        where.isPinned = filters.isPinned;
      }
      if (filters.isArchived !== undefined) {
        where.isArchived = filters.isArchived;
      }
      if (filters.search) {
        where.title = {
          contains: filters.search,
          mode: 'insensitive',
        };
      }
    }
    return this.prisma.conversation.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(data: {
    companyId: string;
    title?: string;
    missionId?: string;
  }): Promise<Conversation> {
    return this.prisma.conversation.create({
      data: {
        ...data,
        companyId: toValidUuid(data.companyId),
        missionId: data.missionId ? toValidUuid(data.missionId) : undefined,
      },
    });
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Conversation> {
    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: string;
    content: string;
  }): Promise<ChatMessage> {
    const sanitizedSenderId = toValidUuid(data.senderId);

    return this.prisma.$transaction(async (tx) => {
      const msg = await tx.chatMessage.create({
        data: {
          ...data,
          senderId: sanitizedSenderId,
        },
      });
      // Touch conversation to update its updatedAt timestamp
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });
      return msg;
    });
  }
}
