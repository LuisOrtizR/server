import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],   // 👈 Agregar
  providers: [AppService],        // 👈 Agregar
})
export class AppModule {}
