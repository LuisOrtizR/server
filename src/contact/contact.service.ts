    import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
    import { CreateContactDto } from '../common/dto/create-contact.dto';
    import { PrismaService } from '../prisma/prisma.service';

    const sgMail = require('@sendgrid/mail');

    @Injectable()
    export class ContactService {
      constructor(private readonly prisma: PrismaService) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      }

      async create(createContactDto: CreateContactDto) {
        try {
          const contact = await this.prisma.contact.create({
            data: createContactDto,
          });

          await this.sendNotificationEmail(createContactDto);

          return {
            message: 'Contacto enviado exitosamente',
            contact,
          };
        } catch (error) {
          console.error('Error al crear contacto:', error);
          throw new HttpException('Error en el servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

      private async sendNotificationEmail(dto: CreateContactDto) {
        const msg = {
          to: process.env.ADMIN_EMAIL,
          from: process.env.MAIL_FROM,
          subject: `Nuevo mensaje de ${dto.name}`,
          html: `
            <h2>Nuevo mensaje de contacto</h2>
            <p><strong>Nombre:</strong> ${dto.name}</p>
            <p><strong>Email:</strong> ${dto.email}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${dto.message}</p>
          `,
        };

        try {
          await sgMail.send(msg);
          console.log('Correo enviado correctamente');
        } catch (error: any) {
      console.error('Error al enviar correo:', error.response?.body || error);
          throw new HttpException('Error al enviar correo', HttpStatus.BAD_REQUEST);
        }
      }
    }
