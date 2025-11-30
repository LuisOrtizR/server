import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
