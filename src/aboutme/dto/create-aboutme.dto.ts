import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateAboutMeDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  cv?: string;
}

export class UpdateAboutMeDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  cv?: string;
}
