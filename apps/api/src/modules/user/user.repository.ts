import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findDefaultCompany() {
    return this.prisma.company.findFirst({
      where: { deletedAt: null },
    });
  }

  async create(data: {
    id: string;
    email: string;
    name?: string;
    companyId: string;
    role: any;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        companyId: data.companyId,
        role: data.role,
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
