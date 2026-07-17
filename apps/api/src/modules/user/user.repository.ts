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
    const userCount = await this.prisma.user.count({
      where: { deletedAt: null },
    });

    let assignedRole = data.role;
    if (userCount === 0) {
      assignedRole = 'SUPER_ADMINISTRATOR';
    } else {
      // Check if email was pre-invited in database
      const invitedUser = await this.prisma.user.findFirst({
        where: { email: data.email, deletedAt: null },
      });
      if (invitedUser) {
        assignedRole = invitedUser.role;
        // Delete the placeholder invited record so we can create it with Firebase UID
        await this.prisma.user.delete({
          where: { id: invitedUser.id },
        });
      } else {
        // Direct registrations default to regular member, not admin/staff
        assignedRole = 'MEMBER';
      }
    }

    return this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        companyId: data.companyId,
        role: assignedRole,
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
