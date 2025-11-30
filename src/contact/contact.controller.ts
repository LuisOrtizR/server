import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from '../common/dto/create-contact.dto';

@Controller('contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  getAllContacts() {
    return this.contactService.findAll();
  }

  @Get(':id')
  getContact(@Param('id') id: string) {
    return this.contactService.findOne(id); // id como string
  }

  @Post()
  createContact(@Body() dto: CreateContactDto) {
    return this.contactService.createContact(dto);
  }

  @Delete(':id')
  deleteContact(@Param('id') id: string) {
    return this.contactService.delete(id); // id como string
  }
}
