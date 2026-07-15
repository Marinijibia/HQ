import { Injectable, BadRequestException } from '@nestjs/common';
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
              include: { department: true }
            }
          }
        }
      },
    });
  }

  async findByCompanyId(companyId: string): Promise<Mission[]> {
    return this.prisma.mission.findMany({
      where: { companyId, deletedAt: null },
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

  async createTasks(missionId: string, tasks: any[]): Promise<void> {
    const execs = await this.prisma.executive.findMany();

    await this.prisma.$transaction(async (tx) => {
      // Loop over tasks and create them
      for (const t of tasks) {
        let status: TaskStatus = TaskStatus.PENDING;
        if (t.status === 'Running') status = TaskStatus.RUNNING;
        else if (t.status === 'Completed') status = TaskStatus.COMPLETED;
        else if (t.status === 'Error') status = TaskStatus.FAILED;

        // Try to match assignedDirector to an executive
        const match = execs.find(
          (e) =>
            e.roleKey.toLowerCase() === t.assignedDirector.toLowerCase() ||
            e.title.toLowerCase().includes(t.assignedDirector.toLowerCase()) ||
            e.name.toLowerCase().includes(t.assignedDirector.toLowerCase()),
        );

        await tx.missionTask.create({
          data: {
            name: t.title,
            description: t.description || '',
            status,
            missionId,
            executiveId: match ? match.id : null,
          },
        });
      }
    });
  }
}
