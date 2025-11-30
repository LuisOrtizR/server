import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { AboutMeModule } from './aboutme/about-me.module';

@Module({
  imports: [
    PrismaModule,
    ProjectModule,
    ContactModule,
    AuthModule,
    AboutMeModule,
  ],
})
export class AppModule {}
