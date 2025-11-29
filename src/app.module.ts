import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [PrismaModule, ProjectModule, ContactModule],
})
export class AppModule {}
