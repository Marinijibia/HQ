import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async getExecutives(companyId?: string) {
    const orgId = companyId
      ? await this.prisma.resolveCompanyId(companyId)
      : undefined;

    const executives = await this.prisma.executive.findMany({
      where: orgId
        ? { deletedAt: null, department: { companyId: orgId } }
        : { deletedAt: null },
      include: {
        department: true,
        trainingData: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return executives.map((exec) => ({
      id: exec.id,
      name: exec.name,
      roleKey: exec.roleKey,
      title: exec.title,
      biography: exec.biography,
      systemPrompt: exec.systemPrompt,
      avatarUrl: exec.avatarUrl,
      isDefaultRoster: exec.isDefaultRoster,
      isActiveInWorkspace: exec.isActiveInWorkspace,
      department: exec.department
        ? { id: exec.department.id, name: exec.department.name }
        : undefined,
      trainingData: (exec.trainingData || []).map((t) => ({
        id: t.id,
        filename: t.filename,
        content: t.content,
        createdAt: t.createdAt.toISOString(),
      })),
    }));
  }

  async getDepartments(companyId?: string) {
    const orgId = companyId
      ? await this.prisma.resolveCompanyId(companyId)
      : undefined;

    const departments = await this.prisma.department.findMany({
      where: orgId
        ? { deletedAt: null, companyId: orgId }
        : { deletedAt: null },
      include: {
        executives: true,
        trainingData: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      isDefaultRoster: dept.isDefaultRoster,
      executives: dept.executives.map((e) => ({
        id: e.id,
        name: e.name,
        roleKey: e.roleKey,
        title: e.title,
        biography: e.biography,
        systemPrompt: e.systemPrompt,
        avatarUrl: e.avatarUrl,
        isDefaultRoster: e.isDefaultRoster,
        isActiveInWorkspace: e.isActiveInWorkspace,
      })),
      trainingData: (dept.trainingData || []).map((t) => ({
        id: t.id,
        filename: t.filename,
        content: t.content,
        createdAt: t.createdAt.toISOString(),
      })),
    }));
  }

  async updateExecutive(
    id: string,
    dto: {
      name?: string;
      title?: string;
      systemPrompt?: string;
      biography?: string;
    },
    companyId?: string,
  ) {
    const orgId = companyId ? await this.prisma.resolveCompanyId(companyId) : undefined;
    const exec = await this.prisma.executive.findFirst({
      where: {
        id,
        ...(orgId ? { department: { companyId: orgId } } : {}),
      },
    });
    if (!exec) {
      throw new NotFoundException(`Executive with ID ${id} not found in your organization workspace`);
    }

    const updated = await this.prisma.executive.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.systemPrompt !== undefined
          ? { systemPrompt: dto.systemPrompt }
          : {}),
        ...(dto.biography !== undefined ? { biography: dto.biography } : {}),
      },
      include: {
        department: true,
        trainingData: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      roleKey: updated.roleKey,
      title: updated.title,
      biography: updated.biography,
      systemPrompt: updated.systemPrompt,
      avatarUrl: updated.avatarUrl,
      isDefaultRoster: updated.isDefaultRoster,
      isActiveInWorkspace: updated.isActiveInWorkspace,
      department: updated.department
        ? { id: updated.department.id, name: updated.department.name }
        : undefined,
      trainingData: (updated.trainingData || []).map((t) => ({
        id: t.id,
        filename: t.filename,
        content: t.content,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  async trainExecutive(
    id: string,
    dto: { filename: string; content: string },
    user?: any,
  ) {
    const orgId = user?.companyId ? await this.prisma.resolveCompanyId(user.companyId) : undefined;
    const exec = await this.prisma.executive.findFirst({
      where: {
        id,
        ...(orgId ? { department: { companyId: orgId } } : {}),
      },
      include: { department: true },
    });

    if (!exec) {
      throw new NotFoundException(`Executive with ID ${id} not found in your organization workspace`);
    }

    this.logger.log(
      `[CMS Training] Indexing document "${dto.filename}" for Executive ${exec.name}...`,
    );

    const createdDoc = await this.prisma.executiveTrainingData.create({
      data: {
        executiveId: exec.id,
        filename: dto.filename,
        content: dto.content,
      },
    });

    return {
      success: true,
      message: `Document "${dto.filename}" successfully indexed into AI training memory for ${exec.name}.`,
      documentId: createdDoc.id,
    };
  }

  async deleteTrainingDoc(trainingId: string, companyId?: string) {
    const orgId = companyId ? await this.prisma.resolveCompanyId(companyId) : undefined;
    try {
      const execDoc = await this.prisma.executiveTrainingData.findFirst({
        where: {
          id: trainingId,
          ...(orgId ? { executive: { department: { companyId: orgId } } } : {}),
        },
      });
      if (execDoc) {
        await this.prisma.executiveTrainingData.delete({
          where: { id: trainingId },
        });
        return {
          success: true,
          message: 'Training document deleted successfully',
        };
      }

      const deptDoc = await this.prisma.departmentTrainingData.findFirst({
        where: {
          id: trainingId,
          ...(orgId ? { department: { companyId: orgId } } : {}),
        },
      });
      if (deptDoc) {
        await this.prisma.departmentTrainingData.delete({
          where: { id: trainingId },
        });
        return {
          success: true,
          message: 'Department training document deleted successfully',
        };
      }

      return { success: true, message: 'Training document removed' };
    } catch {
      return { success: true, message: 'Training document removed' };
    }
  }

  async createDepartment(
    dto: { name: string; description?: string; companyId?: string },
    user?: any,
  ) {
    const rawCompanyId = user?.companyId || dto.companyId;
    if (!rawCompanyId) {
      throw new BadRequestException(
        'Authenticated company ID is required to create a department',
      );
    }
    const companyId = await this.prisma.resolveCompanyId(rawCompanyId);

    const department = await this.prisma.department.create({
      data: {
        name: dto.name,
        description: dto.description || `Department suite for ${dto.name}`,
        companyId,
        isDefaultRoster: false,
        createdBy: user?.uid,
      },
    });

    // Provision default director for this department
    const roleKey =
      dto.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_director';
    const executive = await this.prisma.executive.create({
      data: {
        name: `${dto.name} Director`,
        roleKey,
        title: `Chief ${dto.name} Officer`,
        biography: `Directs strategic initiatives and operations for the ${dto.name} department.`,
        departmentId: department.id,
        isDefaultRoster: false,
        isActiveInWorkspace: true,
        createdBy: user?.uid,
      },
    });

    return {
      id: department.id,
      name: department.name,
      description: department.description,
      isDefaultRoster: department.isDefaultRoster,
      executives: [
        {
          id: executive.id,
          name: executive.name,
          roleKey: executive.roleKey,
          title: executive.title,
          isDefaultRoster: executive.isDefaultRoster,
          isActiveInWorkspace: executive.isActiveInWorkspace,
        },
      ],
      trainingData: [],
    };
  }
}
