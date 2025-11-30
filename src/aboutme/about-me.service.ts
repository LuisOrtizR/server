import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAboutMeDto, UpdateAboutMeDto } from './dto/create-aboutme.dto';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AboutMeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener la información de AboutMe más reciente
   */
  async get() {
    return this.prisma.aboutMe.findFirst({
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Crear nueva entrada
   */
  private async create(data: CreateAboutMeDto) {
    return this.prisma.aboutMe.create({ data });
  }

  /**
   * Actualizar la entrada existente
   */
  async update(id: number, data: UpdateAboutMeDto) {
    const about = await this.prisma.aboutMe.findUnique({ where: { id } });
    if (!about) throw new NotFoundException('Entrada AboutMe no encontrada');

    // Eliminar imágenes antiguas si se reemplazan
    if (data.images && Array.isArray(about.images)) {
      (about.images as (string | null)[])
        .filter((img): img is string => typeof img === 'string')
        .forEach((img) => {
          const pathImg = join(process.cwd(), 'uploads', 'aboutme', img);
          if (existsSync(pathImg)) unlinkSync(pathImg);
        });
    }

    // Eliminar CV antiguo si se reemplaza
    if (data.cv && about.cv && typeof about.cv === 'string') {
      const pathCv = join(process.cwd(), 'uploads', 'aboutme', about.cv);
      if (existsSync(pathCv)) unlinkSync(pathCv);
    }

    return this.prisma.aboutMe.update({ where: { id }, data });
  }

  /**
   * Upsert: crea si no existe, actualiza si ya hay
   * Además asegura que solo haya un registro en la tabla
   */
  async upsert(data: CreateAboutMeDto) {
    const existing = await this.prisma.aboutMe.findFirst();
    if (existing) {
      // Actualiza el registro existente
      return this.update(existing.id, data);
    } else {
      // Limpia cualquier registro viejo por seguridad
      await this.prisma.aboutMe.deleteMany();
      return this.create(data);
    }
  }

  /**
   * Eliminar por completo AboutMe
   */
  async removeAll() {
    const all = await this.prisma.aboutMe.findMany();
    for (const about of all) {
      // Eliminar imágenes
      if (about.images && Array.isArray(about.images)) {
        (about.images as (string | null)[])
          .filter((img): img is string => typeof img === 'string')
          .forEach((img) => {
            const pathImg = join(process.cwd(), 'uploads', 'aboutme', img);
            if (existsSync(pathImg)) unlinkSync(pathImg);
          });
      }
      // Eliminar CV
      if (about.cv && typeof about.cv === 'string') {
        const pathCv = join(process.cwd(), 'uploads', 'aboutme', about.cv);
        if (existsSync(pathCv)) unlinkSync(pathCv);
      }
    }
    await this.prisma.aboutMe.deleteMany();
    return { message: 'Todos los registros AboutMe eliminados' };
  }
}
