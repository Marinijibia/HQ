import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Conversation, ChatMessage } from '@prisma/client';

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Conversation | null> {
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
    } = { companyId };
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
      data,
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
    return this.prisma.$transaction(async (tx) => {
      const msg = await tx.chatMessage.create({
        data,
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
