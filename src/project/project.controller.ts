import { 
  Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UploadedFiles, UseInterceptors 
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from '../common/dto/create-project.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { Express } from 'express';

const PROJECT_UPLOAD_PATH = './uploads/projects';

// Asegura que la carpeta exista
if (!existsSync(PROJECT_UPLOAD_PATH)) mkdirSync(PROJECT_UPLOAD_PATH, { recursive: true });

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getAllProjects() {
    return this.projectService.findAll();
  }

  @Get(':id')
  getProject(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: PROJECT_UPLOAD_PATH,
        filename: (_, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.fieldname}${extname(file.originalname)}`);
        },
      }),
    })
  )
  createProject(@Body() dto: CreateProjectDto, @UploadedFiles() files?: Express.Multer.File[]) {
    if (files) {
      files.forEach(file => {
        if (file.fieldname === 'image') dto.image = file.filename;
        if (file.fieldname === 'gallery') {
          dto.gallery = dto.gallery || [];
          dto.gallery.push(file.filename);
        }
      });
    }
    return this.projectService.create(dto);
  }

  @Put(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: PROJECT_UPLOAD_PATH,
        filename: (_, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}-${file.fieldname}${extname(file.originalname)}`);
        },
      }),
    })
  )
  updateProject(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateProjectDto>, @UploadedFiles() files?: Express.Multer.File[]) {
    if (files) {
      files.forEach(file => {
        if (file.fieldname === 'image') dto.image = file.filename;
        if (file.fieldname === 'gallery') {
          dto.gallery = dto.gallery || [];
          dto.gallery.push(file.filename);
        }
      });
    }
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  deleteProject(@Param('id', ParseIntPipe) id: number) {
    return this.projectService.delete(id);
  }
}
