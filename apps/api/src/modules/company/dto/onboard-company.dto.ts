import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AiExecutiveAssignmentDto {
  @ApiProperty({ example: 'ceo' })
  @IsString()
  @IsNotEmpty()
  roleKey!: string;

  @ApiProperty({ example: 'Chief Executive Officer' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Elena Rostova' })
  @IsString()
  @IsOptional()
  customName?: string;

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsOptional()
  departmentName?: string;
}

export class OnboardCompanyDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  orgName!: string;

  @ApiProperty({ example: 'Building autonomous AI systems for finance' })
  @IsString()
  @IsOptional()
  slogan?: string;

  @ApiProperty({ example: 'acme-corp' })
  @IsString()
  @IsNotEmpty()
  orgSlug!: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiProperty({ example: '1-10' })
  @IsString()
  @IsOptional()
  companySize?: string;

  @ApiProperty({ example: 'Selling to other businesses' })
  @IsString()
  @IsOptional()
  customerType?: string;

  @ApiProperty({ example: 'Enterprise AI operating system' })
  @IsString()
  @IsOptional()
  businessDesc?: string;

  @ApiProperty({ example: ['Scale Monthly Sales', 'Automate Operational Tasks'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goals?: string[];

  @ApiProperty({ example: ['Executive Leadership', 'Sales & Marketing', 'Engineering'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  departments?: string[];

  @ApiProperty({ type: [AiExecutiveAssignmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiExecutiveAssignmentDto)
  @IsOptional()
  aiExecs?: AiExecutiveAssignmentDto[];

  @ApiProperty({ example: 'AGGRESSIVE_GROWTH' })
  @IsString()
  @IsOptional()
  aiStyle?: string;

  @ApiProperty({ example: '#0A84FF' })
  @IsString()
  @IsOptional()
  brandColor?: string;

  @ApiProperty({ example: 'Founder & CEO' })
  @IsString()
  @IsOptional()
  userTitle?: string;

  @ApiProperty({ example: 'Alex Mercer' })
  @IsString()
  @IsOptional()
  userDisplayName?: string;

  @ApiProperty({ example: 'Visionary & Strategic' })
  @IsString()
  @IsOptional()
  voicePersona?: string;

  @ApiProperty({ example: 'https://netify.ng' })
  @IsString()
  @IsOptional()
  website?: string;
}
