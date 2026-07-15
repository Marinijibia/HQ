import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Executive } from '@prisma/client';

@Injectable()
export class ExecutiveRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.executive.findUnique({
      where: { id, deletedAt: null },
      include: { department: true },
    });
  }

  async findByRoleKey(roleKey: string) {
    return this.prisma.executive.findUnique({
      where: { roleKey, deletedAt: null },
      include: { department: true },
    });
  }

  async findAll() {
    return this.prisma.executive.findMany({
      where: { deletedAt: null },
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
