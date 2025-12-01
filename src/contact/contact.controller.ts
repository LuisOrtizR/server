import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from '../common/dto/create-contact.dto';
import { UpdateContactDto } from '../common/dto/update-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  findAll(
    @Query('isRead') isRead?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      search: search || undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    };
    return this.contactService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.update(id, updateContactDto);
  }

  @Patch('bulk/mark-read')
  @HttpCode(HttpStatus.OK)
  bulkMarkAsRead(@Body('ids') ids: string[]) {
    return this.contactService.bulkUpdate(ids, { isRead: true });
  }

  @Delete('bulk')
  @HttpCode(HttpStatus.OK)
  bulkDelete(@Body('ids') ids: string[]) {
    return this.contactService.bulkDelete(ids);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }

  @Get('stats/summary')
  getStats() {
    return this.contactService.getStats();
  }
}
