import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from '../common/dto/create-contact.dto';

@Controller('contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  getAllContacts() {
    return this.contactService.findAll();
  }

  @Post()
  createContact(@Body() dto: CreateContactDto) {
    return this.contactService.createContact(dto);
  }
}
