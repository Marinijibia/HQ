import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  PublicService,
  ContactDto,
  DemoRequestDto,
  CareerApplyDto,
  SecurityRequestDto,
} from './public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('contact')
  @ApiOperation({ summary: 'Submit public website contact form query' })
  async submitContact(@Req() req: any, @Body() dto: ContactDto) {
    return this.publicService.submitContact(dto, req.ip);
  }

  @Post('demo-request')
  @ApiOperation({ summary: 'Schedule a VIP Executive Boardroom Demo' })
  async submitDemoRequest(@Req() req: any, @Body() dto: DemoRequestDto) {
    return this.publicService.submitDemoRequest(dto, req.ip);
  }

  @Post('careers/apply')
  @ApiOperation({ summary: 'Submit job application for open career position' })
  async submitCareerApplication(@Req() req: any, @Body() dto: CareerApplyDto) {
    return this.publicService.submitCareerApplication(dto, req.ip);
  }

  @Post('security-request')
  @ApiOperation({
    summary: 'Request SOC2 Compliance Report or Security Package',
  })
  async submitSecurityRequest(@Req() req: any, @Body() dto: SecurityRequestDto) {
    return this.publicService.submitSecurityRequest(dto, req.ip);
  }
}
