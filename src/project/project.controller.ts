import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from '../common/dto/create-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get()
  getAllProjects() {
    return this.projectService.findAll();
  }

  @Post()
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }
}
