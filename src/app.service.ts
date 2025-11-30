import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
  return `
    <h1>🚀 Bienvenido a mi Portafolio</h1>
    <p>API funcionando correctamente en Railway</p>
  `;
}

}
