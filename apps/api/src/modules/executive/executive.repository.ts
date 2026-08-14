import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Executive } from '@prisma/client';

@Injectable()
export class ExecutiveRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, companyId?: string) {
    return this.prisma.executive.findFirst({
      where: companyId
        ? { id, deletedAt: null, department: { companyId } }
        : { id, deletedAt: null },
      include: { department: true },
    });
  }

  async findByRoleKey(roleKey: string, companyId?: string) {
    return this.prisma.executive.findFirst({
      where: companyId
        ? { roleKey, deletedAt: null, department: { companyId } }
        : { roleKey, deletedAt: null },
      include: { department: true },
    });
  }

  async findAll(companyId?: string) {
    return this.prisma.executive.findMany({
      where: companyId
        ? { department: { companyId }, deletedAt: null }
        : { deletedAt: null },
      include: { department: true },
    });
  }

  async create(data: {
    name: string;
    roleKey: string;
    title: string;
    departmentId: string;
    biography?: string;
    systemPrompt?: string;
    avatarUrl?: string;
  }): Promise<Executive> {
    return this.prisma.executive.create({
      data,
    });
  }
}
