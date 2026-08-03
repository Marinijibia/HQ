import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { CompanyService } from './company.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [CompanyController],
  providers: [CompanyRepository, CompanyService],
  exports: [CompanyRepository, CompanyService],
})
export class CompanyModule {}
