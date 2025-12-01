import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from '../common/dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  // Nuevo: Obtener todos los contactos
  @Get()
  findAll() {
    return this.contactService.findAll();
  }

  // Nuevo: Actualizar contacto (solo usado para marcar leído/no leído)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ isRead: boolean }>) {
    return this.contactService.update(id, body);
  }

  // Nuevo: Eliminar un contacto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
