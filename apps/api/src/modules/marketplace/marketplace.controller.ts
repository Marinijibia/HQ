import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MarketplaceService, PublishListingDto } from './marketplace.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, UserRole } from '../auth/roles.decorator';
import * as types from '../../common/interfaces/request.interface';

@ApiTags('Marketplace')
@ApiBearerAuth()
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
  @UseGuards(RolesGuard)
  @Roles(
    UserRole.SUPER_ADMINISTRATOR,
    UserRole.ORGANIZATION_OWNER,
    UserRole.ADMINISTRATOR,
  )
  @ApiOperation({ summary: 'Install a Marketplace listing into workspace' })
  async installListing(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.marketplaceService.installListing(req.user.companyId, id);
  }

  @Post('publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMINISTRATOR, UserRole.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Publish new Executive or Department to Marketplace (Admin Only)',
  })
  async publishListing(@Body() dto: PublishListingDto) {
    return this.marketplaceService.publishListing(dto);
  }
}
