import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAboutMeDto, UpdateAboutMeDto } from './dto/create-aboutme.dto';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AboutMeService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const data = await this.prisma.aboutMe.findFirst({
      orderBy: { id: 'desc' },
    });

    if (!data) return null;

    const BASE =
      process.env.BACKEND_PUBLIC_URL || (await this.getBaseUrl());

    const images = Array.isArray(data.images)
      ? data.images
          .filter((img): img is string => typeof img === 'string')
          .map((img) => `${BASE}/uploads/aboutme/${img}`)
      : [];

    const cv =
      data.cv && typeof data.cv === 'string'
        ? `${BASE}/uploads/aboutme/${data.cv}`
        : null;

    return {
      ...data,
      images,
      cv,
    };
  }

  private async getBaseUrl() {
    const host =
      process.env.HOST || 'server-production-8a52.up.railway.app';
    return `https://${host}`;
  }

  private async create(data: CreateAboutMeDto) {
    return this.prisma.aboutMe.create({ data });
  }

  async update(id: number, data: UpdateAboutMeDto) {
    const about = await this.prisma.aboutMe.findUnique({ where: { id } });
    if (!about)
      throw new NotFoundException('Entrada AboutMe no encontrada');

    if (data.images && Array.isArray(about.images)) {
      about.images
        .filter((img): img is string => typeof img === 'string')
        .forEach((img) => {
          const pathImg = join(process.cwd(), 'uploads', 'aboutme', img);
          if (existsSync(pathImg)) unlinkSync(pathImg);
        });
    }

    if (data.cv && about.cv && typeof about.cv === 'string') {
      const pathCv = join(process.cwd(), 'uploads', 'aboutme', about.cv);
      if (existsSync(pathCv)) unlinkSync(pathCv);
    }

    return this.prisma.aboutMe.update({ where: { id }, data });
  }

  async upsert(data: CreateAboutMeDto) {
    const existing = await this.prisma.aboutMe.findFirst();
    if (existing) return this.update(existing.id, data);

    await this.prisma.aboutMe.deleteMany();
    return this.create(data);
  }

  async removeAll() {
    const all = await this.prisma.aboutMe.findMany();

    for (const about of all) {
      if (Array.isArray(about.images)) {
        about.images
          .filter((img): img is string => typeof img === 'string')
          .forEach((img) => {
            const pathImg = join(process.cwd(), 'uploads', 'aboutme', img);
            if (existsSync(pathImg)) unlinkSync(pathImg);
          });
      }
      if (about.cv && typeof about.cv === 'string') {
        const pathCv = join(process.cwd(), 'uploads', 'aboutme', about.cv);
        if (existsSync(pathCv)) unlinkSync(pathCv);
      }
    }

    await this.prisma.aboutMe.deleteMany();
    return { message: 'Todos los registros AboutMe eliminados' };
  }
}
