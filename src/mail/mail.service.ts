// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

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

    if (!to || !subject || (!text && !html)) {
      throw new Error('Debes proporcionar "to", "subject" y al menos "text" o "html"');
    }

    const msg = {
      from,
      to,
      subject,
      text: text ?? '',
      html: html ?? '',
    };

    try {
      const result = await sgMail.send(msg);
      return result;
    } catch (err) {
      console.error('Error enviando email con SendGrid:', err);
      throw new InternalServerErrorException('No se pudo enviar el email');
    }
  }
}
