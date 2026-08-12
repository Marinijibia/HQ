import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Company, CompanyLevel } from '@prisma/client';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findBySlug(slug: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { slug, deletedAt: null },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    level?: CompanyLevel;
    parentId?: string;
  }): Promise<Company> {
    return this.prisma.company.create({
      data: {
        name: data.name,
        slug: data.slug,
        level: data.level,
        parentId: data.parentId,
      },
    });
  }

  async update(id: string, data: Partial<Company>): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, deletedBy: string): Promise<Company> {
    return this.prisma.company.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
