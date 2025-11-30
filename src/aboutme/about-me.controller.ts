import { Controller, Get, Post, Body, UseInterceptors, UploadedFiles, Delete } from '@nestjs/common';
import { AboutMeService } from './about-me.service';
import { CreateAboutMeDto } from './dto/create-aboutme.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';

@Controller('about-me')
export class AboutMeController {
  constructor(private readonly aboutMeService: AboutMeService) {}

  @Get()
  getAbout() {
    return this.aboutMeService.get();
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cv', maxCount: 1 },
        { name: 'images', maxCount: 10 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/aboutme',
          filename: (_, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const prefix = file.fieldname === 'cv' ? 'cv' : 'img';
            cb(null, `${uniqueSuffix}-${prefix}${extname(file.originalname)}`);
          },
        }),
      },
    ),
  )
  async createOrUpdateAbout(
    @Body() dto: CreateAboutMeDto,
    @UploadedFiles() files?: { cv?: Express.Multer.File[]; images?: Express.Multer.File[] },
  ) {
    if (files?.cv?.length) dto.cv = files.cv[0].filename;
    if (files?.images?.length) dto.images = files.images.map(f => f.filename);

    return this.aboutMeService.upsert(dto);
  }

  @Delete()
  async removeAll() {
    return this.aboutMeService.removeAll();
  }
}
