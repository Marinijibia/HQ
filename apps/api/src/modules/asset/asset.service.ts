import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AssetRepository } from './asset.repository';
import { Asset, AssetVersion, DataClassification } from '@prisma/client';

@Injectable()
export class AssetService {
  constructor(private readonly assetRepository: AssetRepository) {}

  async getAssets(
    companyId: string,
    filters?: {
      search?: string;
      classification?: DataClassification;
      category?: string;
      missionId?: string;
    },
  ): Promise<Asset[]> {
    return this.assetRepository.findByCompanyId(companyId, filters);
  }

  async getAsset(id: string): Promise<Asset & { versions: AssetVersion[] }> {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset as Asset & { versions: AssetVersion[] };
  }

  async createAsset(data: {
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
    return this.assetRepository.create(data);
  }

  async addVersion(
    id: string,
    data: {
      filename: string;
      fileSize: number;
      sha256: string;
      gcsPath: string;
      changeSummary?: string;
    },
  ): Promise<AssetVersion> {
    const asset = await this.getAsset(id);
    if (asset.isLegalHold) {
      throw new BadRequestException(
        'Modification Blocked: Asset is currently locked under regulatory Legal Hold.',
      );
    }
    return this.assetRepository.createVersion(id, data);
  }

  async rollback(id: string, versionId: string): Promise<Asset> {
    const asset = await this.getAsset(id);
    if (asset.isLegalHold) {
      throw new BadRequestException(
        'Modification Blocked: Asset is currently locked under regulatory Legal Hold.',
      );
    }

    // Find the specific version in asset versions list
    const targetVersion = asset.versions.find((v) => v.id === versionId);
    if (!targetVersion) {
      throw new NotFoundException('Target version not found');
    }

    // Create a new head version record
    await this.assetRepository.createVersion(id, {
      filename: targetVersion.filename,
      fileSize: targetVersion.fileSize,
      sha256: targetVersion.sha256,
      gcsPath: targetVersion.gcsPath,
      changeSummary: `Rollback to Version ${targetVersion.version}`,
    });

    return this.getAsset(id);
  }

  async deleteAsset(id: string): Promise<Asset> {
    const asset = await this.getAsset(id);
    if (asset.isLegalHold) {
      throw new BadRequestException(
        'Modification Blocked: Asset is currently locked under regulatory Legal Hold.',
      );
    }
    return this.assetRepository.delete(id);
  }

  async toggleLegalHold(id: string): Promise<Asset> {
    const asset = await this.getAsset(id);
    return this.assetRepository.update(id, {
      isLegalHold: !asset.isLegalHold,
    });
  }
}
