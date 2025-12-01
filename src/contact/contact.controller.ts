import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from '../common/dto/create-contact.dto';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  getAllContacts() {
    return this.contactService.findAll();
  }

  @Get(':id')
  getContact(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Post()
  async createContact(@Body() dto: CreateContactDto) {
    try {
      const contact = await this.contactService.createContact(dto);
      return {
        success: true,
        message: 'Contacto enviado y guardado correctamente',
        data: contact,
      };
    } catch (error: any) {
      console.error('❌ Error en createContact:', error?.message);
      throw new HttpException(
        {
          success: false,
          message: 'Error procesando el contacto',
          error: error?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  deleteContact(@Param('id') id: string) {
    return this.contactService.delete(id);
  }
}
