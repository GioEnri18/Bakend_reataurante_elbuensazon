import { IsNotEmpty, IsNumber, IsString, Min, IsOptional, IsBoolean } from 'class-validator';

export class UpdateMesaDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'El número de mesa debe ser mayor a 0' })
  numero?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(1, { message: 'La capacidad debe ser mayor a 0' })
  capacidad?: number;

  @IsOptional()
  @IsString({ message: 'La ubicación debe ser un texto' })
  ubicacion?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}