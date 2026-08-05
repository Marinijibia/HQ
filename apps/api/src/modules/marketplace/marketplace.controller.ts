import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService, PublishListingDto } from './marketplace.service';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

export class InstallListingDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

@ApiTags('Marketplace')
@UseGuards(AuthGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('listings')
  @ApiOperation({ summary: 'Browse Marketplace listings' })
  async getListings(
    @Query('category') category?: string,
    @Query('priceFilter') priceFilter?: 'free' | 'paid',
  ) {
    return this.marketplaceService.getListings(category, priceFilter);
  }

  @Get('listings/:id')
  @ApiOperation({ summary: 'Get Marketplace listing details' })
  async getListingById(@Param('id') id: string) {
    return this.marketplaceService.getListingById(id);
  }

  @Post('listings/:id/install')
  @ApiOperation({ summary: 'Install a Marketplace listing into workspace' })
  async installListing(
    @Param('id') id: string,
    @Body() dto: InstallListingDto,
  ) {
    return this.marketplaceService.installListing(dto.companyId, id);
  }

  @Post('publish')
  @ApiOperation({ summary: 'Publish new Executive or Department to Marketplace' })
  async publishListing(@Body() dto: PublishListingDto) {
    return this.marketplaceService.publishListing(dto);
  }
}
