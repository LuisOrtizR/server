import { Module } from '@nestjs/common';
import { MailServiceApp } from './mail.service';

@Module({
  providers: [MailServiceApp],
  exports: [MailServiceApp],
})
export class MailModule {}
