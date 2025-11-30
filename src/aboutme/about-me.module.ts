import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AboutMeService } from './about-me.service';
import { AboutMeController } from './about-me.controller';

@Module({
  imports: [PrismaModule],
  providers: [AboutMeService],
  controllers: [AboutMeController],
})
export class AboutMeModule {}
