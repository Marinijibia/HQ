import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class PublishListingDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  listingType?: 'EXECUTIVE' | 'DEPARTMENT';

  @IsString()
  @IsOptional()
  roleKey?: string;

  @IsString()
  @IsOptional()
  departmentKey?: string;
}

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getListings(category?: string, priceFilter?: 'free' | 'paid') {
    const whereClause: any = { isPublished: true };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (priceFilter === 'free') {
      whereClause.price = 0;
    } else if (priceFilter === 'paid') {
      whereClause.price = { gt: 0 };
    }

    return this.prisma.marketplaceListing.findMany({
      where: whereClause,
      orderBy: { downloadsCount: 'desc' },
    });
  }

  async getListingById(id: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id },
    });
    if (!listing) {
      throw new NotFoundException('Marketplace listing not found');
    }
    return listing;
  }

  async installListing(companyId: string, listingId: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      throw new NotFoundException('Marketplace listing not found');
    }

    // Record installation
    const installation = await this.prisma.marketplaceInstallation.upsert({
      where: {
        companyId_listingId: { companyId, listingId },
      },
      update: { installedAt: new Date() },
      create: {
        companyId,
        listingId,
      },
    });

    // Increment downloads count
    await this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { downloadsCount: { increment: 1 } },
    });

    // Activate in executive roster if roleKey or departmentKey provided
    if (listing.roleKey) {
      await this.prisma.executive.updateMany({
        where: { roleKey: listing.roleKey },
        data: { isActiveInWorkspace: true },
      });
    }

    if (listing.departmentKey) {
      let deptName = 'Technology';
      if (listing.departmentKey === 'sales_marketing')
        deptName = 'Sales & Marketing';
      if (listing.departmentKey === 'finance') deptName = 'Finance';

      const dept = await this.prisma.department.findFirst({
        where: { name: { contains: deptName, mode: 'insensitive' } },
      });

      if (dept) {
        await this.prisma.executive.updateMany({
          where: { departmentId: dept.id },
          data: { isActiveInWorkspace: true },
        });
      }
    }

    return {
      success: true,
      message: `Successfully installed "${listing.title}" into your workspace roster.`,
      installation,
    };
  }

  async publishListing(dto: PublishListingDto) {
    if (!dto.title || !dto.description) {
      throw new BadRequestException('Title and description are required');
    }

    return this.prisma.marketplaceListing.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price || 0,
        currency: dto.currency || 'USD',
        category: dto.category || 'General',
        tags: dto.tags || ['custom', 'ai-executive'],
        listingType: dto.listingType || 'EXECUTIVE',
        roleKey: dto.roleKey,
        departmentKey: dto.departmentKey,
        isPublished: true,
      },
    });
  }
}
