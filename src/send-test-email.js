"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mail_service_1 = require("./mail/mail.service");
(async () => {
    const mailService = new mail_service_1.MailService();
    try {
        const result = await mailService.sendMail({
            to: 'laortiz937@soy.sena.edu.co',
            subject: 'Prueba SendGrid',
            text: '¡Este es un email de prueba desde SendGrid!',
            html: '<p>¡Este es un <strong>email de prueba</strong> desde SendGrid!</p>',
        });
        console.log('Email enviado:', result);
    }
    catch (err) {
        console.error('Error enviando email:', err);
    }
})();
//# sourceMappingURL=send-test-email.js.map