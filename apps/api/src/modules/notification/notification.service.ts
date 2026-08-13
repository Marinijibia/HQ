import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationRepository } from './notification.repository';
import { ExecutiveRepository } from '../executive/executive.repository';
import { PrismaService } from '../database/prisma.service';
import { Notification } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly executiveRepository: ExecutiveRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getNotifications(
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
    let notifs = await this.notificationRepository.findByCompanyId(companyId, filters);

    if (notifs.length === 0 && (!filters || Object.keys(filters).length === 0)) {
      // Auto-seed initial welcome notifications for workspace
      await this.createNotification({
        title: 'Executive Boardroom Initialized',
        message: 'Your multi-tenant executive workspace is fully active with 5 Core Active Directors.',
        companyId,
        priority: 'HIGH',
        category: 'EXECUTIVE',
        actionUrl: '/boardroom',
      }).catch(() => null);

      await this.createNotification({
        title: '5 Core Directors Standing By',
        message: 'Asad (CEO), Teema (Ops), Legal, Resource Director, and Mr. Intelligence are online.',
        companyId,
        priority: 'MEDIUM',
        category: 'SYSTEM',
        actionUrl: '/ceo-chat',
      }).catch(() => null);

      await this.createNotification({
        title: 'Marketplace Suite Available',
        message: 'Explore specialized department packs and executive suites in the Marketplace.',
        companyId,
        priority: 'LOW',
        category: 'MISSION',
        actionUrl: '/marketplace',
      }).catch(() => null);

      notifs = await this.notificationRepository.findByCompanyId(companyId, filters);
    }

    return notifs;
  }

  async createNotification(data: {
    title: string;
    message: string;
    companyId: string;
    priority?: string;
    category?: string;
    senderId?: string;
    senderType?: string;
    actionUrl?: string;
  }): Promise<Notification> {
    // If sender key is passed, let's find the executive and map details
    let senderId = data.senderId;
    let senderType = data.senderType || 'SYSTEM';

    if (!senderId && data.category === 'SECURITY') {
      const exec =
        await this.executiveRepository.findByRoleKey('security_director');
      if (exec) {
        senderId = exec.id;
        senderType = 'EXECUTIVE';
      }
    } else if (!senderId && data.category === 'BILLING') {
      const exec =
        await this.executiveRepository.findByRoleKey('finance_director');
      if (exec) {
        senderId = exec.id;
        senderType = 'EXECUTIVE';
      }
    } else if (!senderId && data.category === 'EXECUTIVE') {
      const exec = await this.executiveRepository.findByRoleKey('ceo');
      if (exec) {
        senderId = exec.id;
        senderType = 'EXECUTIVE';
      }
    }

    return this.notificationRepository.create({
      ...data,
      senderId,
      senderType,
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    const notif = await this.notificationRepository.findById(id);
    if (!notif) throw new NotFoundException('Notification not found');
    return this.notificationRepository.update(id, { read: true });
  }

  async markAsUnread(id: string): Promise<Notification> {
    const notif = await this.notificationRepository.findById(id);
    if (!notif) throw new NotFoundException('Notification not found');
    return this.notificationRepository.update(id, { read: false });
  }

  async togglePin(id: string): Promise<Notification> {
    const notif = await this.notificationRepository.findById(id);
    if (!notif) throw new NotFoundException('Notification not found');
    return this.notificationRepository.update(id, {
      isPinned: !notif.isPinned,
    });
  }

  async toggleArchive(id: string): Promise<Notification> {
    const notif = await this.notificationRepository.findById(id);
    if (!notif) throw new NotFoundException('Notification not found');
    return this.notificationRepository.update(id, {
      isArchived: !notif.isArchived,
    });
  }

  async bulkMarkRead(companyId: string): Promise<{ count: number }> {
    return this.notificationRepository.markAllRead(companyId);
  }

  async deleteNotification(id: string): Promise<Notification> {
    const notif = await this.notificationRepository.findById(id);
    if (!notif) throw new NotFoundException('Notification not found');
    return this.notificationRepository.delete(id);
  }

  @OnEvent('notification.created')
  async handleNotificationCreated(payload: {
    title: string;
    message: string;
    companyId?: string;
    priority?: string;
    category?: string;
    senderId?: string;
    senderType?: string;
    actionUrl?: string;
  }) {
    let companyId = payload.companyId;
    if (!companyId) {
      const firstCompany = await this.prisma.company.findFirst();
      if (!firstCompany) return;
      companyId = firstCompany.id;
    }

    await this.createNotification({
      title: payload.title,
      message: payload.message,
      companyId,
      priority: payload.priority || 'MEDIUM',
      category: payload.category || 'SYSTEM',
      senderId: payload.senderId,
      senderType: payload.senderType || 'SYSTEM',
      actionUrl: payload.actionUrl,
    });
  }

  @OnEvent('mission.*')
  async handleMissionEvent(payload: {
    missionId: string;
    status: string;
    actorId?: string;
  }) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: payload.missionId },
    });
    if (!mission) return;

    const status = payload.status.toLowerCase();
    let title = 'Mission Update';
    let message = `Mission "${mission.objective}" changed status to ${payload.status}.`;
    let priority = 'MEDIUM';
    const category = 'MISSION';
    let roleKey = 'ceo';
    const actionUrl = `/missions/${mission.id}`;

    if (status === 'started' || status === 'executing') {
      title = 'Mission Executing';
      message = `Strategic Campaign "${mission.objective}" is now running parallelized task queues.`;
      roleKey = 'ceo';
      priority = 'MEDIUM';
    } else if (status === 'paused') {
      title = 'Mission Paused';
      message = `Campaign "${mission.objective}" has been paused. Awaiting CEO or Owner verification.`;
      roleKey = 'strategy_director';
      priority = 'HIGH';
    } else if (status === 'completed') {
      title = 'Mission Completed';
      message = `All task outlines and copy briefs for "${mission.objective}" are ready.`;
      roleKey = 'software_engineering_director';
      priority = 'HIGH';
    } else if (status === 'failed') {
      title = 'Mission Exception';
      message = `Campaign "${mission.objective}" failed compliance or safety audits. Check conflict log.`;
      roleKey = 'security_director';
      priority = 'CRITICAL';
    }

    const exec = await this.executiveRepository.findByRoleKey(roleKey);
    const senderId = exec ? exec.id : undefined;

    await this.createNotification({
      title,
      message,
      companyId: mission.companyId,
      priority,
      category,
      senderId,
      senderType: 'EXECUTIVE',
      actionUrl,
    });
  }
}
