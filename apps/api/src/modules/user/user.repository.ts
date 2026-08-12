import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { User, Company, Team, UserRole } from '@prisma/client';

export type UserWithRelations = User & {
  company?: Company | null;
  team?: Team | null;
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserWithRelations | null> {
    if (!id || typeof id !== 'string') return null;
    try {
      return await this.prisma.user.findFirst({
        where: {
          OR: [{ id }, { firebaseUid: id }],
          deletedAt: null,
        },
        include: {
          company: true,
          team: true,
        },
      });
    } catch {
      try {
        const rows: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT * FROM users WHERE (id = '${id}' OR firebase_uid = '${id}') AND deleted_at IS NULL LIMIT 1
        `);
        if (rows && rows.length > 0) {
          const u = rows[0];
          return {
            id: u.id,
            email: u.email,
            name: u.name || u.display_name || u.email.split('@')[0],
            displayName: u.display_name || u.name,
            photoUrl: u.photo_url || null,
            role: (u.role || 'MEMBER') as UserRole,
            companyId: u.company_id,
            teamId: u.team_id || null,
            firebaseUid: u.firebase_uid || u.id,
            emailVerified: u.email_verified ?? true,
            passwordHash: u.password_hash || null,
            lastLoginAt: u.last_login_at || new Date(),
            createdAt: u.created_at || new Date(),
            updatedAt: u.updated_at || new Date(),
            deletedAt: null,
            createdBy: null,
            updatedBy: null,
            deletedBy: null,
          } as UserWithRelations;
        }
      } catch {}
      return null;
    }
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserWithRelations | null> {
    return this.findById(firebaseUid);
  }

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    if (!email || typeof email !== 'string') return null;
    try {
      return await this.prisma.user.findFirst({
        where: { email: email.toLowerCase().trim(), deletedAt: null },
        include: {
          company: true,
          team: true,
        },
      });
    } catch {
      try {
        const cleanEmail = email.toLowerCase().trim();
        const rows: any[] = await this.prisma.$queryRawUnsafe(`
          SELECT * FROM users WHERE LOWER(email) = '${cleanEmail}' AND deleted_at IS NULL LIMIT 1
        `);
        if (rows && rows.length > 0) {
          const u = rows[0];
          return {
            id: u.id,
            email: u.email,
            name: u.name || u.display_name || u.email.split('@')[0],
            displayName: u.display_name || u.name,
            photoUrl: u.photo_url || null,
            role: (u.role || 'MEMBER') as UserRole,
            companyId: u.company_id,
            teamId: u.team_id || null,
            firebaseUid: u.firebase_uid || u.id,
            emailVerified: u.email_verified ?? true,
            passwordHash: u.password_hash || null,
            lastLoginAt: u.last_login_at || new Date(),
            createdAt: u.created_at || new Date(),
            updatedAt: u.updated_at || new Date(),
            deletedAt: null,
            createdBy: null,
            updatedBy: null,
            deletedBy: null,
          } as UserWithRelations;
        }
      } catch {}
      return null;
    }
  }

  async createIsolatedUserWorkspace(
    userId: string,
    email: string,
    role = 'ORGANIZATION_OWNER',
  ): Promise<UserWithRelations> {
    const rawName = email ? email.split('@')[0] : 'User';
    const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const companyName = `${cleanName}'s Organization`;
    const companySlug = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCompany = await this.prisma.company.create({
      data: {
        name: companyName,
        slug: companySlug,
        primaryColor: '#0A84FF',
      },
    });

    return await this.prisma.user.create({
      data: {
        id: userId,
        email: email.toLowerCase().trim(),
        name: cleanName,
        displayName: cleanName,
        companyId: newCompany.id,
        role: role as UserRole,
      },
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
    } catch {
      try {
        const rows: any[] = (await this.prisma.$queryRawUnsafe(`
          SELECT id, name, slug FROM companies WHERE deleted_at IS NULL LIMIT 1
        `)) as any[];
        if (rows && rows.length > 0) {
          return rows[0] as Company;
        }
      } catch {}
      return null;
    }
  }

  async createDefaultCompany(): Promise<Company> {
    const existing = await this.findDefaultCompany();
    if (existing) return existing;

    const id = `c-default-${Date.now()}`;
    const slug = `hq-default-${Date.now()}`;
    try {
      return await this.prisma.company.create({
        data: {
          id,
          name: 'HQ Default Corporation',
          slug,
        },
      });
    } catch {
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO companies (id, name, slug, created_at, updated_at)
        VALUES ('${id}', 'HQ Default Corporation', '${slug}', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `).catch(() => {});

      return {
        id,
        name: 'HQ Default Corporation',
        slug,
        logoUrl: null,
        slogan: null,
        primaryColor: null,
        secondaryColor: null,
        level: 'BUSINESS_UNIT',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      } as Company;
    }
  }

  async createUser(data: {
    id: string;
    email: string;
    displayName?: string;
    name?: string;
    photoUrl?: string;
    companyId: string;
    role?: 'OWNER' | 'ADMIN' | 'MEMBER';
    firebaseUid?: string;
    emailVerified?: boolean;
    passwordHash?: string;
  }): Promise<UserWithRelations> {
    const assignedRole = (data.role || 'MEMBER') as UserRole;
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
    } catch {
      const name = data.name || data.displayName || (data.email ? data.email.split('@')[0] : 'Member');
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO users (id, firebase_uid, email, name, display_name, role, company_id, email_verified, password_hash, created_at, updated_at)
        VALUES ('${data.id}', '${data.firebaseUid || data.id}', '${data.email}', '${name}', '${name}', '${assignedRole}', '${data.companyId}', true, '${data.passwordHash || ''}', NOW(), NOW())
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
      } as UserWithRelations;
    }
  }

  async create(data: {
    id: string;
    email: string;
    displayName?: string;
    name?: string;
    photoUrl?: string;
    companyId: string;
    role?: 'OWNER' | 'ADMIN' | 'MEMBER';
    firebaseUid?: string;
    emailVerified?: boolean;
    passwordHash?: string;
  }): Promise<UserWithRelations> {
    return this.createUser(data);
  }

  async update(
    id: string,
    data: {
      name?: string;
      displayName?: string;
      photoUrl?: string;
      role?: 'OWNER' | 'ADMIN' | 'MEMBER';
      companyId?: string;
      teamId?: string;
      passwordHash?: string;
      lastLoginAt?: Date;
      emailVerified?: boolean;
    },
  ): Promise<User | null> {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.displayName !== undefined) updateData.displayName = data.displayName;
      if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
      if (data.role !== undefined) updateData.role = data.role as UserRole;
      if (data.companyId !== undefined) updateData.companyId = data.companyId;
      if (data.teamId !== undefined) updateData.teamId = data.teamId;
      if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
      if (data.lastLoginAt !== undefined) updateData.lastLoginAt = data.lastLoginAt;
      if (data.emailVerified !== undefined) updateData.emailVerified = data.emailVerified;

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch {
      const sets: string[] = [];
      if (data.name) sets.push(`name = '${data.name}'`);
      if (data.displayName) sets.push(`display_name = '${data.displayName}'`);
      if (data.role) sets.push(`role = '${data.role}'`);
      if (data.companyId) sets.push(`company_id = '${data.companyId}'`);
      if (data.passwordHash) sets.push(`password_hash = '${data.passwordHash}'`);
      if (data.lastLoginAt) sets.push(`last_login_at = NOW()`);
      sets.push(`updated_at = NOW()`);

      if (sets.length > 0) {
        await this.prisma.$executeRawUnsafe(`
          UPDATE users SET ${sets.join(', ')} WHERE id = '${id}'
        `).catch(() => {});
      }
      return this.findById(id);
    }
  }

  async updateUserRole(id: string, role: 'OWNER' | 'ADMIN' | 'MEMBER'): Promise<User | null> {
    return this.update(id, { role });
  }

  async softDelete(id: string, deletedBy?: string): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          ...(deletedBy && { deletedBy }),
        },
      });
    } catch {
      await this.prisma.$executeRawUnsafe(`
        UPDATE users SET deleted_at = NOW() WHERE id = '${id}'
      `).catch(() => {});
      return this.findById(id);
    }
  }
}
