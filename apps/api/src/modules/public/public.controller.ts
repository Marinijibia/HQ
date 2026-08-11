import { Controller, Post, Body } from '@nestjs/common';
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
  async submitContact(@Body() dto: ContactDto) {
    return this.publicService.submitContact(dto);
  }

  @Post('demo-request')
  @ApiOperation({ summary: 'Schedule a VIP Executive Boardroom Demo' })
  async submitDemoRequest(@Body() dto: DemoRequestDto) {
    return this.publicService.submitDemoRequest(dto);
  }

  @Post('careers/apply')
  @ApiOperation({ summary: 'Submit job application for open career position' })
  async submitCareerApplication(@Body() dto: CareerApplyDto) {
    return this.publicService.submitCareerApplication(dto);
  }

  @Post('security-request')
  @ApiOperation({ summary: 'Request SOC2 Compliance Report or Security Package' })
  async submitSecurityRequest(@Body() dto: SecurityRequestDto) {
    return this.publicService.submitSecurityRequest(dto);
  }
}
