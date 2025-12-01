import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  // Permitimos textos largos (Prisma ya usa TEXT si se cambió el schema)
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
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
