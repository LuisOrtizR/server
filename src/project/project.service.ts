import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from '../common/dto/create-project.dto';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  create(data: CreateProjectDto) {
    return this.prisma.project.create({ data });
  }

  async update(id: number, data: Partial<CreateProjectDto>) {
    const project = await this.findOne(id);

    // Imagen principal
    if (data.image && project.image) {
      const imgPath = join(process.cwd(), 'uploads', project.image);
      if (existsSync(imgPath)) unlinkSync(imgPath);
    }

    // Galería
    if (data.gallery && Array.isArray(project.gallery)) {
      for (const img of project.gallery) {
        if (typeof img === 'string') {
          const imgPath = join(process.cwd(), 'uploads', img);
          if (existsSync(imgPath)) unlinkSync(imgPath);
        }
      }
    }

    return this.prisma.project.update({ where: { id }, data });
  }

  async delete(id: number) {
    const project = await this.findOne(id);

    if (project.image) {
      const imgPath = join(process.cwd(), 'uploads', project.image);
      if (existsSync(imgPath)) unlinkSync(imgPath);
    }

    if (Array.isArray(project.gallery)) {
      for (const img of project.gallery) {
        if (typeof img === 'string') {
          const imgPath = join(process.cwd(), 'uploads', img);
          if (existsSync(imgPath)) unlinkSync(imgPath);
        }
      }
    }

    return this.prisma.project.delete({ where: { id } });
  }
}
