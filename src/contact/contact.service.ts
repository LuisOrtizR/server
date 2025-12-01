import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateContactDto } from '../common/dto/create-contact.dto';
import { UpdateContactDto } from '../common/dto/update-contact.dto';
import { PrismaService } from '../prisma/prisma.service';
import sgMail from '@sendgrid/mail';

interface ContactFilters {
  isRead?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      console.warn('⚠️  SENDGRID_API_KEY no configurada');
    }
  }

  /**
   * Crear nuevo contacto y enviar notificación por email
   */
  async create(createContactDto: CreateContactDto) {
    try {
      const contact = await this.prisma.contact.create({
        data: createContactDto,
      });

      // Enviar email de forma asíncrona sin bloquear la respuesta
      this.sendNotificationEmail(createContactDto).catch((err) =>
        console.error('❌ Error al enviar correo:', err),
      );

      return {
        message: 'Contacto enviado exitosamente',
        contact,
      };
    } catch (error) {
      console.error('Error al crear contacto:', error);
      throw new HttpException(
        'Error al procesar el contacto',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtener todos los contactos con filtros y paginación
   */
  async findAll(filters: ContactFilters = {}) {
    const { isRead, search, page = 1, limit = 10 } = filters;

    // Construir condiciones WHERE
    const where: any = {};

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Ejecutar queries en paralelo para mejor performance
    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un contacto por ID y auto-marcar como leído
   */
  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
    }

    // Auto-marcar como leído al abrir (si no lo está ya)
    if (!contact.isRead) {
      await this.prisma.contact.update({
        where: { id },
        data: { isRead: true },
      });
      contact.isRead = true;
    }

    return contact;
  }

  /**
   * Actualizar un contacto (isRead, starred, etc.)
   */
  async update(id: string, updateContactDto: UpdateContactDto) {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: updateContactDto,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
      }
      throw new HttpException(
        'Error al actualizar contacto',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Actualizar múltiples contactos a la vez (bulk update)
   */
  async bulkUpdate(ids: string[], data: Partial<UpdateContactDto>) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un ID');
    }

    try {
      const result = await this.prisma.contact.updateMany({
        where: { id: { in: ids } },
        data,
      });

      return {
        message: `${result.count} contacto(s) actualizado(s)`,
        count: result.count,
      };
    } catch (error) {
      console.error('Error en bulkUpdate:', error);
      throw new HttpException(
        'Error al actualizar contactos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Eliminar múltiples contactos (bulk delete)
   */
  async bulkDelete(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un ID');
    }

    try {
      const result = await this.prisma.contact.deleteMany({
        where: { id: { in: ids } },
      });

      return {
        message: `${result.count} contacto(s) eliminado(s)`,
        count: result.count,
      };
    } catch (error) {
      console.error('Error en bulkDelete:', error);
      throw new HttpException(
        'Error al eliminar contactos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Eliminar un contacto individual
   */
  async remove(id: string) {
    try {
      await this.prisma.contact.delete({ where: { id } });
      return { message: 'Contacto eliminado exitosamente' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Contacto con ID ${id} no encontrado`);
      }
      throw new HttpException(
        'Error al eliminar contacto',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Obtener estadísticas de contactos (total, leídos, no leídos)
   */
  async getStats() {
    try {
      const [total, unread, read] = await Promise.all([
        this.prisma.contact.count(),
        this.prisma.contact.count({ where: { isRead: false } }),
        this.prisma.contact.count({ where: { isRead: true } }),
      ]);

      return {
        total,
        unread,
        read,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new HttpException(
        'Error al obtener estadísticas',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Enviar notificación por email (privado)
   */
  private async sendNotificationEmail(dto: CreateContactDto) {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️  Email no enviado: SENDGRID_API_KEY no configurada');
      return;
    }

    const msg = {
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      from: process.env.MAIL_FROM || 'noreply@example.com',
      subject: `📧 Nuevo mensaje de ${dto.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #e8eaed;
              border-top: none;
            }
            .info-box {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #1890ff;
            }
            .info-item {
              margin: 10px 0;
            }
            .info-label {
              font-weight: 600;
              color: #5f6368;
              display: inline-block;
              min-width: 80px;
            }
            .message-box {
              background: white;
              padding: 20px;
              border: 1px solid #e8eaed;
              border-radius: 8px;
              margin: 20px 0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #5f6368;
              font-size: 12px;
              border-top: 1px solid #e8eaed;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #1890ff;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 10px 0;
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📧 Nuevo Mensaje de Contacto</h1>
          </div>
          
          <div class="content">
            <div class="info-box">
              <div class="info-item">
                <span class="info-label">Nombre:</span>
                <span>${dto.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email:</span>
                <a href="mailto:${dto.email}" style="color: #1890ff; text-decoration: none;">
                  ${dto.email}
                </a>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha:</span>
                <span>${new Date().toLocaleString('es-ES', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}</span>
              </div>
            </div>

            <h3 style="color: #202124; margin-top: 30px;">Mensaje:</h3>
            <div class="message-box">
              ${dto.message}
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${dto.email}" class="button">
                ✉️ Responder por Email
              </a>
            </div>
          </div>

          <div class="footer">
            <p>Este es un mensaje automático del sistema de contacto.</p>
            <p>© ${new Date().getFullYear()} - Sistema de Gestión de Contactos</p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Correo enviado correctamente a:', msg.to);
    } catch (error: any) {
      console.error('❌ Error al enviar correo:', {
        message: error.message,
        response: error.response?.body,
      });
      // No lanzar error para no bloquear la creación del contacto
    }
  }
}