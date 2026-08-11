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
    if (!id || typeof id !== 'string') return null;
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
    if (!firebaseUid || typeof firebaseUid !== 'string') return null;
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
    if (!email || typeof email !== 'string') return null;
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: {
        company: true,
        team: true,
      },
    });
  }

  async findDefaultCompany(): Promise<Company | null> {
    try {
      return await this.prisma.company.findFirst({
        where: { deletedAt: null },
      });
    } catch (e) {
      try {
        const rows: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT id, name, slug FROM companies WHERE deleted_at IS NULL LIMIT 1
        `);
        if (rows && rows.length > 0) {
          return rows[0] as Company;
        }
      } catch {}
      return null;
    }
  }

  async createDefaultCompany(): Promise<Company> {
    try {
      return await this.prisma.company.create({
        data: {
          name: 'HQ Organization',
          slug: `hq-org-${Date.now()}`,
        },
      });
    } catch (e) {
      const companyId = `company_${Date.now()}`;
      const slug = `hq-org-${Date.now()}`;
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO companies (id, name, slug, created_at, updated_at)
        VALUES ('${companyId}', 'HQ Organization', '${slug}', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `);
      return {
        id: companyId,
        name: 'HQ Organization',
        slug,
        logoUrl: null,
        slogan: null,
        primaryColor: null,
        secondaryColor: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
        parentId: null,
        level: 'BUSINESS_UNIT' as any,
      };
    }
  }

  async create(data: {
    id: string;
    firebaseUid?: string;
    email: string;
    name?: string;
    displayName?: string;
    photoUrl?: string;
    emailVerified?: boolean;
    passwordHash?: string;
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

    try {
      return await this.prisma.user.create({
        data: {
          id: data.id,
          firebaseUid: data.firebaseUid || data.id,
          email: data.email,
          name: data.name || data.displayName || (data.email ? data.email.split('@')[0] : 'Member'),
          displayName: data.displayName || data.name,
          photoUrl: data.photoUrl,
          emailVerified: data.emailVerified ?? false,
          ...(data.passwordHash && { passwordHash: data.passwordHash }),
          companyId: data.companyId,
          role: assignedRole,
          lastLoginAt: new Date(),
        },
        include: {
          company: true,
          team: true,
        },
      });
    } catch (e) {
      const name = data.name || data.displayName || (data.email ? data.email.split('@')[0] : 'Member');
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO users (id, firebase_uid, email, name, display_name, role, company_id, email_verified, created_at, updated_at)
        VALUES ('${data.id}', '${data.firebaseUid || data.id}', '${data.email}', '${name}', '${name}', '${assignedRole}', '${data.companyId}', true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET role = '${assignedRole}', name = '${name}'
      `).catch(() => {});

      return {
        id: data.id,
        firebaseUid: data.firebaseUid || data.id,
        email: data.email,
        name,
        displayName: name,
        photoUrl: data.photoUrl || null,
        role: assignedRole,
        companyId: data.companyId,
        teamId: null,
        emailVerified: true,
        passwordHash: data.passwordHash || null,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      };
    }
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
