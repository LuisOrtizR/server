import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateContactDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  starred?: boolean;
}