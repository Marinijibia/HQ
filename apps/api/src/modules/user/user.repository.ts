import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Company, Team } from '@prisma/client';

export type UserWithRelations = User & {
  company?: Company | null;
  team?: Team | null;
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id }, { firebaseUid: id }],
        deletedAt: null,
      },
      include: {
        company: true,
        team: true,
      },
    });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ firebaseUid }, { id: firebaseUid }],
        deletedAt: null,
      },
      include: {
        company: true,
        team: true,
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        company: true,
        team: true,
      },
    });
  }

  async findDefaultCompany(): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { deletedAt: null },
    });
  }

  async create(data: {
    id: string;
    firebaseUid?: string;
    email: string;
    name?: string;
    displayName?: string;
    photoUrl?: string;
    emailVerified?: boolean;
    companyId: string;
    role: any;
  }): Promise<UserWithRelations> {
    const userCount = await this.prisma.user.count({
      where: { deletedAt: null },
    });

    let assignedRole = data.role;
    if (userCount === 0) {
      assignedRole = 'SUPER_ADMINISTRATOR';
    } else {
      const invitedUser = await this.prisma.user.findFirst({
        where: { email: data.email, deletedAt: null },
      });
      if (invitedUser) {
        assignedRole = invitedUser.role;
        await this.prisma.user.delete({
          where: { id: invitedUser.id },
        });
      } else {
        assignedRole = data.role || 'MEMBER';
      }
    }

    return this.prisma.user.create({
      data: {
        id: data.id,
        firebaseUid: data.firebaseUid || data.id,
        email: data.email,
        name: data.name || data.displayName || (data.email ? data.email.split('@')[0] : 'Member'),
        displayName: data.displayName || data.name,
        photoUrl: data.photoUrl,
        emailVerified: data.emailVerified ?? false,
        companyId: data.companyId,
        role: assignedRole,
        lastLoginAt: new Date(),
      },
      include: {
        company: true,
        team: true,
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<UserWithRelations> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        company: true,
        team: true,
      },
    });
  }

  async updateLastLogin(id: string): Promise<UserWithRelations> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      include: {
        company: true,
        team: true,
      },
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<UserWithRelations> {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
      include: {
        company: true,
        team: true,
      },
    });
  }
}
