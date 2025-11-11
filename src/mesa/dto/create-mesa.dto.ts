import { IsNotEmpty, IsNumber, IsString, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateMesaDto {
  @IsNumber()
  @Min(1, { message: 'El número de mesa debe ser mayor a 0' })
  numero: number;

  @IsNotEmpty({ message: 'La capacidad es requerida' })
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(1, { message: 'La capacidad debe ser mayor a 0' })
  capacidad: number;

  @IsNotEmpty({ message: 'La ubicación es requerida' })
  @IsString({ message: 'La ubicación debe ser un texto' })
  ubicacion: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}