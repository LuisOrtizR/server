import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  techStack!: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  image?: string; // Imagen principal

  @IsOptional()
  @IsArray()
  gallery?: string[]; // Varias imágenes
}
