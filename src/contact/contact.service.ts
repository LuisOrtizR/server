// src/contact/contact.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from '../common/dto/create-contact.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  private adminEmails = [
    'laortiz937@soy.sena.edu.co', // Cambia este por tu Outlook o Yahoo para pruebas
  ];

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createContact(dto: CreateContactDto) {
    let contact;
    try {
      contact = await this.prisma.contact.create({
        data: { ...dto, isRead: false },
      });
    } catch (error) {
      console.error('Error guardando contacto en la BD', error);
      throw new InternalServerErrorException('No se pudo guardar el contacto');
    }

    await this.notifyAdmins(contact);
    return contact;
  }

  findAll() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contacto no encontrado');
    return contact;
  }

  async delete(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.contact.delete({ where: { id } });
    } catch (error) {
      console.error('Error eliminando contacto', { id, error });
      throw new InternalServerErrorException('No se pudo eliminar el contacto');
    }
  }

  private async notifyAdmins(contact: CreateContactDto & { id: string }) {
    for (const email of this.adminEmails) {
      try {
        await this.mailService.sendMail({
          to: email,
          subject: '📬 Nuevo mensaje de contacto recibido',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333;">¡Nuevo mensaje de contacto!</h2>
              <p style="font-size: 16px; color: #555;">Se ha recibido un nuevo mensaje en tu portafolio.</p>
              <div style="background-color: #fff; border: 1px solid #eee; border-radius: 6px; padding: 15px; margin: 15px 0;">
                <p><strong>Nombre:</strong> ${contact.name}</p>
                <p><strong>Email:</strong> ${contact.email}</p>
                <p><strong>Mensaje:</strong></p>
                <p style="background-color: #f0f0f0; padding: 10px; border-radius: 4px;">${contact.message}</p>
              </div>
            </div>
          `,
        });
      } catch (error) {
        console.error(`❌ Error enviando notificación a ${email}`, error);
      }
    }
  }
}
