import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRepository } from './user.repository';
import { AuthGuard } from '../auth/auth.guard';
import { IsString, IsOptional } from 'class-validator';
import * as types from '../../common/interfaces/request.interface';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile details' })
  async findMe(@Req() req: types.AuthenticatedRequest) {
    const user = await this.userRepository.findById(req.user.uid);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }
    return user;
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current authenticated user profile details',
  })
  async updateMe(
    @Req() req: types.AuthenticatedRequest,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userRepository.update(req.user.uid, updateDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Soft delete current authenticated user account' })
  async removeMe(@Req() req: types.AuthenticatedRequest) {
    return this.userRepository.softDelete(req.user.uid, req.user.uid);
  }
}
