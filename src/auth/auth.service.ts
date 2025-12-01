import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { addMinutes, isBefore } from 'date-fns';
import { MailServiceApp } from '../mail/mail.service';

@Injectable()
export class AuthService {
  

constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
  private mailService: MailServiceApp,
) {}


  // LOGIN
  async login(email: string, password: string) {
    const admins = await this.prisma.admin.findMany();

    const admin = admins.find(a => {
      // Aseguramos que emails sea un array de strings
      const emails: string[] = Array.isArray(a.emails)
        ? (a.emails as unknown[]).filter((e): e is string => typeof e === 'string')
        : [];

      return emails.map(e => e.toLowerCase()).includes(email.toLowerCase());
    });

    if (!admin) throw new NotFoundException('Correo no registrado');

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) throw new ForbiddenException('Credenciales inválidas');

    const payload = { sub: admin.id, email };

    return {
      access_token: this.jwtService.sign(payload),
      expiresIn: process.env.JWT_EXPIRES_IN || 3600,
    };
  }

  // OLVIDASTE CONTRASEÑA
  async forgotPassword(email: string) {
    const admins = await this.prisma.admin.findMany();

    const admin = admins.find(a => {
      const emails: string[] = Array.isArray(a.emails)
        ? (a.emails as unknown[]).filter((e): e is string => typeof e === 'string')
        : [];

      return emails.map(e => e.toLowerCase()).includes(email.toLowerCase());
    });

    if (!admin) throw new ForbiddenException('No autorizado para recuperar contraseña');

    const token = randomBytes(32).toString('hex');
    const expiresAt = addMinutes(new Date(), 60);

    await this.prisma.passwordReset.create({
      data: {
        adminId: admin.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.mailService.sendMail(
  email,
  'Recuperar contraseña - Portfolio',
  `<p>Haz clic <a href="${resetUrl}">aquí</a>. Expira en 60 minutos.</p>`,
);

    return { ok: true };
  }

  // RESET PASSWORD
  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!record || record.used) {
      throw new ForbiddenException('Token inválido o ya utilizado');
    }

    if (isBefore(record.expiresAt, new Date())) {
      throw new ForbiddenException('Token expirado');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.admin.update({
      where: { id: record.adminId },
      data: { password: hashed },
    });

    await this.prisma.passwordReset.update({
      where: { id: record.id },
      data: { used: true },
    });

    return { ok: true };
  }
}
