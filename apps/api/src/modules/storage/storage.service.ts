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
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'video/mp4',
    'video/webm',
  ];

  private static readonly MIME_TO_EXTENSIONS: Record<string, string[]> = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg', '.jpeg'],
    'image/svg+xml': ['.svg'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
    'application/msword': ['.doc'],
    'text/plain': ['.txt'],
    'text/markdown': ['.md'],
    'text/csv': ['.csv'],
    'application/json': ['.json'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
  };

  private static readonly DANGEROUS_EXTENSIONS = new Set([
    '.exe',
    '.bat',
    '.cmd',
    '.sh',
    '.php',
    '.phtml',
    '.jsp',
    '.asp',
    '.aspx',
    '.py',
    '.js',
    '.ts',
    '.html',
    '.htm',
    '.vbs',
    '.scr',
    '.ps1',
    '.jar',
    '.dll',
    '.so',
    '.com',
    '.msi',
  ]);

  constructor(private readonly configService: ConfigService) {
    this.localStoragePath = path.resolve(
      this.configService.get<string>('LOCAL_STORAGE_PATH', './uploads'),
    );
    this.useGcs = this.configService.get<string>('GCP_PROJECT') !== undefined;

    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
  }

  validateFile(size: number, mimeType: string, originalName?: string) {
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

    if (originalName) {
      const ext = path.extname(originalName).toLowerCase();
      if (!ext || StorageService.DANGEROUS_EXTENSIONS.has(ext)) {
        throw new BadRequestException(
          `Security Check Failed: File extension "${ext}" is not permitted.`,
        );
      }

      const allowedExts = StorageService.MIME_TO_EXTENSIONS[mimeType];
      if (allowedExts && !allowedExts.includes(ext)) {
        throw new BadRequestException(
          `Security Check Failed: Extension "${ext}" does not match declared MIME type "${mimeType}".`,
        );
      }
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ gcsPath: string; size: number; sha256: string }> {
    const size = fileBuffer.length;
    this.validateFile(size, mimeType, originalName);

    // Calculate SHA-256 hash checksum for file integrity
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    const sha256 = hash.digest('hex');

    const fileExtension = path.extname(originalName).toLowerCase();
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

  async getFile(gcsPath: string): Promise<{ buffer: Buffer }> {
    let filePath = gcsPath || '';
    if (filePath.startsWith('file://')) {
      filePath = filePath.replace('file://', '');
      if (process.platform === 'win32' && filePath.startsWith('/') && filePath.charAt(2) === ':') {
        filePath = filePath.slice(1);
      }
    } else if (filePath.startsWith('gs://')) {
      const filename = path.basename(filePath);
      filePath = path.join(this.localStoragePath, filename);
    }

    const storageRoot = path.resolve(this.localStoragePath);
    const resolvedTarget = path.resolve(filePath);

    // Strictly enforce that local file reads are constrained inside the storage vault root
    if (resolvedTarget.startsWith(storageRoot) && fs.existsSync(resolvedTarget)) {
      const buffer = await fs.promises.readFile(resolvedTarget);
      return { buffer };
    }

    // Fallback: search strictly by basename within storage vault
    const basename = path.basename(filePath);
    const fallbackPath = path.resolve(this.localStoragePath, basename);
    if (fallbackPath.startsWith(storageRoot) && fs.existsSync(fallbackPath)) {
      const buffer = await fs.promises.readFile(fallbackPath);
      return { buffer };
    }

    throw new BadRequestException('File content not found in storage vault.');
  }
}
