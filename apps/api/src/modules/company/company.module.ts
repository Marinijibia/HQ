import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';

@Module({
  controllers: [CompanyController],
  providers: [CompanyRepository],
  exports: [CompanyRepository],
})
export class CompanyModule {}
