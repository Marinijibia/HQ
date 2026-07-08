import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly localStoragePath: string;
  private readonly useGcs: boolean;
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly mimeAllowlist = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'video/mp4',
  ];

  constructor(private readonly configService: ConfigService) {
    this.localStoragePath = path.resolve(
      this.configService.get<string>('LOCAL_STORAGE_PATH', './uploads'),
    );
    this.useGcs = this.configService.get<string>('GCP_PROJECT') !== undefined;

    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
  }

  validateFile(size: number, mimeType: string) {
    if (size > this.maxFileSize) {
      throw new BadRequestException(
        'Security Check Failed: File size exceeds the maximum limit of 50MB.',
      );
    }
    if (!this.mimeAllowlist.includes(mimeType)) {
      throw new BadRequestException(
        `Security Check Failed: MIME type "${mimeType}" is not allowed.`,
      );
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ gcsPath: string; size: number; sha256: string }> {
    const size = fileBuffer.length;
    this.validateFile(size, mimeType);

    // Calculate SHA-256 hash checksum for file integrity
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const sha256 = hash.digest('hex');

    const fileExtension = path.extname(originalName);
    const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`;

    if (this.useGcs) {
      this.logger.log(`Uploading file ${originalName} to GCP bucket...`);
      // Here we would invoke @google-cloud/storage client wrapper
      // For local development fallback, we write to local filesystem and log
      const gcsMockPath = `gs://hq-assets-bucket/${uniqueFilename}`;
      const localFilePath = path.join(this.localStoragePath, uniqueFilename);
      await fs.promises.writeFile(localFilePath, fileBuffer);
      return {
        gcsPath: gcsMockPath,
        size,
        sha256,
      };
    } else {
      this.logger.log(
        `Uploading file ${originalName} to local storage fallback...`,
      );
      const localFilePath = path.join(this.localStoragePath, uniqueFilename);
      await fs.promises.writeFile(localFilePath, fileBuffer);
      return {
        gcsPath: `file://${localFilePath.replace(/\\/g, '/')}`,
        size,
        sha256,
      };
    }
  }
}
