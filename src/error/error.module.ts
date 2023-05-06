import { Module } from '@nestjs/common';
import { ErrorFilter } from './error.filter';

@Module({
  providers: [ErrorFilter],
  exports: [ErrorFilter],
})
export class ErrorModule {}
