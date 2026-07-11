import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async findByCompanyId(
    companyId: string,
    filters?: {
      read?: boolean;
      priority?: string;
      category?: string;
      isPinned?: boolean;
      isArchived?: boolean;
      search?: string;
    },
  ): Promise<Notification[]> {
    const where: {
      companyId: string;
      read?: boolean;
      priority?: string;
      category?: string;
      isPinned?: boolean;
      isArchived?: boolean;
      OR?: Array<
        | { title: { contains: string; mode: 'insensitive' } }
        | { message: { contains: string; mode: 'insensitive' } }
      >;
    } = { companyId };

    if (filters) {
      if (filters.read !== undefined) {
        where.read = filters.read;
      }
      if (filters.priority) {
        where.priority = filters.priority;
      }
      if (filters.category) {
        where.category = filters.category;
      }
      if (filters.isPinned !== undefined) {
        where.isPinned = filters.isPinned;
      }
      if (filters.isArchived !== undefined) {
        where.isArchived = filters.isArchived;
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { message: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(data: {
    title: string;
    message: string;
    companyId: string;
    priority?: string;
    category?: string;
    senderId?: string;
    senderType?: string;
    actionUrl?: string;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data,
    });
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async markAllRead(companyId: string): Promise<{ count: number }> {
    return this.prisma.notification.updateMany({
      where: { companyId, read: false },
      data: { read: true },
    });
  }
}
