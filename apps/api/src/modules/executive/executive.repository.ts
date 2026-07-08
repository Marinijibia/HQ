import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Executive } from '@prisma/client';

@Injectable()
export class ExecutiveRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Executive | null> {
    return this.prisma.executive.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findByRoleKey(roleKey: string): Promise<Executive | null> {
    return this.prisma.executive.findUnique({
      where: { roleKey, deletedAt: null },
    });
  }

  async findAll(): Promise<Executive[]> {
    return this.prisma.executive.findMany({
      where: { deletedAt: null },
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
