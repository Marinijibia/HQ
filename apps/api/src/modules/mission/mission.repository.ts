import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Mission, MissionStatus, TaskStatus } from '@prisma/client';

@Injectable()
export class MissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Mission | null> {
    return this.prisma.mission.findUnique({
      where: { id, deletedAt: null },
      include: {
        tasks: {
          include: {
            executive: {
              include: { department: true },
            },
          },
        },
      },
    });
  }

  async findByCompanyId(companyId: string): Promise<Mission[]> {
    return this.prisma.mission.findMany({
      where: { companyId, deletedAt: null },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    objective: string;
    companyId: string;
    status?: MissionStatus;
    deadline?: Date;
    createdBy?: string;
  }): Promise<Mission> {
    return this.prisma.mission.create({
      data,
    });
  }

  async update(id: string, data: Partial<Mission>): Promise<Mission> {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
    });

    if (mission?.isLegalHold && data.deletedAt) {
      throw new BadRequestException(
        'Action blocked: Mission is currently under Legal Hold.',
      );
    }

    return this.prisma.mission.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<Mission> {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
    });

    if (!mission) {
      throw new BadRequestException('Mission not found');
    }

    if (mission.isLegalHold) {
      throw new BadRequestException(
        'Action blocked: Mission is currently under Legal Hold.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Set soft delete flags on dependent tasks first
      await tx.missionTask.updateMany({
        where: { missionId: id },
        data: { deletedAt: new Date() },
      });

      return tx.mission.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy,
        },
      });
    });
  }

  async createTasks(
    missionId: string,
    tasks: any[],
    companyId?: string,
  ): Promise<void> {
    if (!Array.isArray(tasks) || tasks.length === 0) return;

    // Scope executive lookup to the mission's organization
    const execs = await this.prisma.executive.findMany({
      where: companyId
        ? { deletedAt: null, department: { companyId } }
        : { deletedAt: null },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const t of tasks) {
        let status: TaskStatus = TaskStatus.PENDING;
        const rawStatus = (t.status || '').toUpperCase();
        if (rawStatus === 'RUNNING' || rawStatus === 'IN_PROGRESS')
          status = TaskStatus.RUNNING;
        else if (rawStatus === 'COMPLETED' || rawStatus === 'DONE')
          status = TaskStatus.COMPLETED;
        else if (rawStatus === 'ERROR' || rawStatus === 'FAILED')
          status = TaskStatus.FAILED;

        // Safely match director
        const directorStr = String(
          t.assignedDirector || t.director || t.role || '',
        ).toLowerCase();
        const match = execs.find(
          (e) =>
            directorStr &&
            (e.roleKey.toLowerCase() === directorStr ||
              e.title.toLowerCase().includes(directorStr) ||
              e.name.toLowerCase().includes(directorStr) ||
              directorStr.includes(e.roleKey.toLowerCase()) ||
              directorStr.includes(e.name.toLowerCase())),
        );

        await tx.missionTask.create({
          data: {
            name: t.title || t.name || 'Autonomous Task Step',
            description: t.description || '',
            status,
            missionId,
            executiveId: match ? match.id : execs[0]?.id || null,
          },
        });
      }
    });
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    missionId?: string,
  ): Promise<any> {
    if (missionId) {
      const task = await this.prisma.missionTask.findFirst({
        where: { id: taskId, missionId },
      });
      if (!task) {
        throw new NotFoundException(
          `Task with ID "${taskId}" not found in mission "${missionId}"`,
        );
      }
    }

    const updated = await this.prisma.missionTask.update({
      where: { id: taskId },
      data: { status },
      include: {
        mission: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (updated.mission && updated.mission.tasks.length > 0) {
      const allDone = updated.mission.tasks.every(
        (t) => t.status === TaskStatus.COMPLETED,
      );
      if (allDone && updated.mission.status !== MissionStatus.DELIVERED) {
        await this.prisma.mission.update({
          where: { id: updated.mission.id },
          data: { status: MissionStatus.DELIVERED },
        });
      }
    }

    return updated;
  }
}
