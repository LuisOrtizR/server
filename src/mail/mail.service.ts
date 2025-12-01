import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
const sgMail = require('@sendgrid/mail');

@Injectable()
export class MailServiceApp {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendMail(to: string, subject: string, html: string) {
    const msg = {
      to,
      from: process.env.SENDGRID_EMAIL_FROM,
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      return { message: 'Correo enviado exitosamente' };
    } catch (error: any) {
  console.error('Error al enviar correo:', error.response?.body || error);
      throw new HttpException(
        'Error al enviar el correo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
