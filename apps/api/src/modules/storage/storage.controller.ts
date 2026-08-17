import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../database/prisma.service';
import * as types from '../../common/interfaces/request.interface';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Secure upload file to cloud bucket' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB hard limit
      },
    }),
  )
  async uploadFile(
    @Req() req: types.AuthenticatedRequest,
    @UploadedFile()
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const companyId = req.user.companyId;

    // 1. Fetch active subscription plan code
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });
    const planCode = subscription?.plan?.code?.toLowerCase() || 'free';

    // 2. Count current storage consumed by active assets
    const totalUsedBytes = await this.prisma.asset.aggregate({
      where: { companyId, deletedAt: null },
      _sum: { fileSize: true },
    });
    const usedBytes = totalUsedBytes._sum.fileSize || 0;

    // 3. Define threshold limits
    // Free: 1 GB, Growth: 10 GB, Enterprise: Unlimited
    let limitBytes = 1 * 1024 * 1024 * 1024;
    if (planCode === 'growth' || planCode === 'team') {
      limitBytes = 10 * 1024 * 1024 * 1024;
    } else if (planCode === 'enterprise') {
      limitBytes = Infinity;
    }

    const fileSize = file.buffer.length;
    if (usedBytes + fileSize > limitBytes) {
      const allowedStr = planCode === 'free' ? '1 GB' : '10 GB';
      throw new BadRequestException(
        `Storage quota exceeded: Your active subscription plan "${planCode.toUpperCase()}" permits a maximum of ${allowedStr} storage capacity. Please delete unused assets or upgrade.`,
      );
    }

    const result = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return {
      message: 'File uploaded successfully',
      filename: file.originalname,
      mimetype: file.mimetype,
      ...result,
    };
  }
}
