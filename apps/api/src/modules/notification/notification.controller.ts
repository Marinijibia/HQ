import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';
import * as types from '../../common/interfaces/request.interface';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications / inbox alerts for company' })
  async findAll(
    @Req() req: types.AuthenticatedRequest,
    @Query('read') read?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('isPinned') isPinned?: string,
    @Query('isArchived') isArchived?: string,
    @Query('search') search?: string,
  ) {
    const filters: {
      read?: boolean;
      priority?: string;
      category?: string;
      isPinned?: boolean;
      isArchived?: boolean;
      search?: string;
    } = {};

    if (read !== undefined) filters.read = read === 'true';
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (isPinned !== undefined) filters.isPinned = isPinned === 'true';
    if (isArchived !== undefined) filters.isArchived = isArchived === 'true';
    if (search) filters.search = search;

    return this.notificationService.getNotifications(
      req.user.companyId,
      filters,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark alert as read' })
  async markRead(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(id, req.user.companyId);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark alert as unread' })
  async markUnread(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsUnread(id, req.user.companyId);
  }

  @Post(':id/pin')
  @ApiOperation({ summary: 'Toggle pinned state' })
  async togglePin(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notificationService.togglePin(id, req.user.companyId);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Toggle archived state' })
  async toggleArchive(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notificationService.toggleArchive(id, req.user.companyId);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all active alerts as read' })
  async markAllRead(@Req() req: types.AuthenticatedRequest) {
    return this.notificationService.bulkMarkRead(req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dismiss/Delete notification' })
  async remove(
    @Req() req: types.AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.notificationService.deleteNotification(id, req.user.companyId);
  }
}
