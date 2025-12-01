// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import 'dotenv/config';

@Injectable()
export class MailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY no está definido en el .env');
    }
    sgMail.setApiKey(apiKey);
  }

  async sendMail({
    to,
    subject,
    text,
    html,
  }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    const from = process.env.MAIL_FROM;
    if (!from) {
      throw new Error('MAIL_FROM no está definido en el .env');
    }

    const msg = {
      from,
      to,
      subject,
      text: text ?? '',
      html: html ?? '',
    };

    try {
      const [response] = await sgMail.send(msg);
      console.log('📩 SendGrid STATUS:', response.statusCode);
      console.log('📩 SendGrid HEADERS:', response.headers);
      return response;
    } catch (err: any) {
      console.error('❌ Error enviando email con SendGrid:');
      console.error(err.response?.body || err);
      throw new InternalServerErrorException('No se pudo enviar el email');
    }
  }
}
