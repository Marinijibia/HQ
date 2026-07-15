import { Module, Global } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';

@Global()
@Module({
  controllers: [UserController],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
