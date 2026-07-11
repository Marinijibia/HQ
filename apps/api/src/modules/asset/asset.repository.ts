import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Asset, AssetVersion, DataClassification } from '@prisma/client';

@Injectable()
export class AssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Asset | null> {
    return this.prisma.asset.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
        },
      },
    });
  }

  async findByCompanyId(
    companyId: string,
    filters?: {
      search?: string;
      classification?: DataClassification;
      category?: string; // e.g. "image", "pdf", "docx", "video", "data"
      missionId?: string;
    },
  ): Promise<Asset[]> {
    const where: {
      companyId: string;
      deletedAt: null;
      classification?: DataClassification;
      missionId?: string;
      filename?: { contains: string; mode: 'insensitive' };
      mimeType?: string | { in: string[] };
    } = { companyId, deletedAt: null };

    if (filters) {
      if (filters.classification) {
        where.classification = filters.classification;
      }
      if (filters.missionId) {
        where.missionId = filters.missionId;
      }
      if (filters.search) {
        where.filename = {
          contains: filters.search,
          mode: 'insensitive',
        };
      }
      if (filters.category) {
        const cat = filters.category.toLowerCase();
        if (cat === 'pdf') {
          where.mimeType = 'application/pdf';
        } else if (cat === 'image') {
          where.mimeType = {
            in: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
          };
        } else if (cat === 'video') {
          where.mimeType = 'video/mp4';
        } else if (cat === 'data') {
          where.mimeType = {
            in: [
              'text/csv',
              'application/json',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
          };
        } else if (cat === 'document') {
          where.mimeType = {
            in: [
              'application/pdf',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'text/plain',
              'text/markdown',
            ],
          };
        }
      }
    }

    return this.prisma.asset.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(data: {
    filename: string;
    description?: string;
    fileSize: number;
    mimeType: string;
    sha256: string;
    gcsPath: string;
    classification?: DataClassification;
    companyId: string;
    missionId?: string;
  }): Promise<Asset> {
    return this.prisma.$transaction(async (tx) => {
      const asset = await tx.asset.create({
        data: {
          filename: data.filename,
          description: data.description,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          sha256: data.sha256,
          gcsPath: data.gcsPath,
          classification:
            data.classification || DataClassification.CONFIDENTIAL,
          companyId: data.companyId,
          missionId: data.missionId,
        },
      });

      // Create first version
      await tx.assetVersion.create({
        data: {
          version: 1,
          filename: data.filename,
          fileSize: data.fileSize,
          sha256: data.sha256,
          gcsPath: data.gcsPath,
          changeSummary: 'Initial upload',
          assetId: asset.id,
        },
      });

      return asset;
    });
  }

  async createVersion(
    assetId: string,
    data: {
      filename: string;
      fileSize: number;
      sha256: string;
      gcsPath: string;
      changeSummary?: string;
    },
  ): Promise<AssetVersion> {
    return this.prisma.$transaction(async (tx) => {
      // Find latest version number
      const latest = await tx.assetVersion.findFirst({
        where: { assetId },
        orderBy: { version: 'desc' },
      });

      const nextVersion = (latest?.version || 0) + 1;

      const ver = await tx.assetVersion.create({
        data: {
          version: nextVersion,
          filename: data.filename,
          fileSize: data.fileSize,
          sha256: data.sha256,
          gcsPath: data.gcsPath,
          changeSummary: data.changeSummary || `Version ${nextVersion} update`,
          assetId,
        },
      });

      // Update parent asset head details
      await tx.asset.update({
        where: { id: assetId },
        data: {
          filename: data.filename,
          fileSize: data.fileSize,
          sha256: data.sha256,
          gcsPath: data.gcsPath,
          updatedAt: new Date(),
        },
      });

      return ver;
    });
  }

  async update(id: string, data: Partial<Asset>): Promise<Asset> {
    return this.prisma.asset.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Asset> {
    // Soft delete
    return this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
