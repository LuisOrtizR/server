import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <h1>🚀 Bienvenido a mi Portafolio API</h1>
      <p>API funcionando correctamente en Railway</p>
      <h3>📌 Rutas disponibles:</h3>
      <ul>
        <li><a href="/about-me" target="_blank">📄 About Me (GET)</a></li>
        <li><a href="/projects" target="_blank">🗂️ Projects (GET)</a></li>
        <li><a href="/contacts" target="_blank">📬 Contacts (GET)</a></li>
        <li><a href="/auth/login" target="_blank">🔐 Auth Login (POST)</a></li>
        <li><a href="/auth/forgot-password" target="_blank">🔑 Forgot Password (POST)</a></li>
        <li><a href="/auth/reset-password" target="_blank">♻️ Reset Password (POST)</a></li>
      </ul>
      <p style="margin-top:20px;">📎 Archivos públicos:</p>
      <ul>
        <li><a href="/uploads/aboutme/" target="_blank">🖼️ AboutMe Uploads</a></li>
        <li><a href="/uploads/projects/" target="_blank">📁 Project Uploads</a></li>
      </ul>
      <p>🌐 Dominio actual: <b>${process.env.FRONTEND_URL || 'No definido'}</b></p>
    `;
  }
}
