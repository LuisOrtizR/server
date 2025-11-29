import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';

@Module({
  imports: [PrismaModule],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
