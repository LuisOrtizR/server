// send-test-email.ts
import 'dotenv/config'; // <--- carga automáticamente tu .env
import { MailService } from './src/mail/mail.service';

(async () => {
  const mailService = new MailService();

  try {
    const result = await mailService.sendMail({
      to: 'luisangel930115@gmail.com',
      subject: 'Prueba SendGrid',
      text: '¡Este es un email de prueba desde SendGrid!',
      html: '<p>¡Este es un <strong>email de prueba</strong> desde SendGrid!</p>',
    });

    console.log('Email enviado:', result);
  } catch (err) {
    console.error('Error enviando email:', err);
  }
})();
