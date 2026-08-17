import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Conversation, ChatMessage } from '@prisma/client';

function toValidUuid(id?: string): string {
  if (!id) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (uuidRegex.test(id)) {
    return id;
  }
  return '00000000-0000-0000-0000-000000000000';
}

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    companyIdInput?: string,
  ): Promise<(Conversation & { messages: ChatMessage[] }) | null> {
    if (companyIdInput) {
      const companyId = await this.prisma.resolveCompanyId(companyIdInput);
      return this.prisma.conversation.findFirst({
        where: { id, companyId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
          },
          mission: true,
        },
      });
    }

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
    companyIdInput: string,
    filters?: { isPinned?: boolean; isArchived?: boolean; search?: string },
  ): Promise<Conversation[]> {
    const companyId = await this.prisma.resolveCompanyId(companyIdInput);

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
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(data: {
    companyId: string;
    title?: string;
    missionId?: string;
  }): Promise<Conversation> {
    const companyId = await this.prisma.resolveCompanyId(data.companyId);

    return this.prisma.conversation.create({
      data: {
        ...data,
        companyId,
        missionId:
          data.missionId &&
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            data.missionId,
          )
            ? data.missionId
            : undefined,
      },
    });
  }

  async update(id: string, data: Partial<Conversation>): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, companyId?: string): Promise<Conversation> {
    if (companyId) {
      const resolvedCompanyId = await this.prisma.resolveCompanyId(companyId);
      const conv = await this.prisma.conversation.findFirst({
        where: { id, companyId: resolvedCompanyId },
      });
      if (!conv) {
        throw new NotFoundException(
          `Conversation with ID "${id}" not found in workspace`,
        );
      }
    }
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
          conversationId: data.conversationId,
          senderId: sanitizedSenderId,
          senderType: data.senderType || 'USER',
          content: data.content,
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
