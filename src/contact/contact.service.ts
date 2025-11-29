import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from '../common/dto/create-contact.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async createContact(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({ data: dto });

    // Enviar correo (opcional)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_USER,
        subject: `Nuevo mensaje de ${dto.name}`,
        text: dto.message,
        html: `<p>${dto.message}</p>`,
      });
    } catch (e) {
      console.error('Error sending email', e);
    }

    return contact;
  }

  findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
