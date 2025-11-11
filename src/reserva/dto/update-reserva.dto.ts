import { IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';
import { EstadoReserva } from '../reserva.entity';

export class UpdateReservaDto {
  @IsOptional()
  @IsDateString({}, { message: 'Debe ser una fecha válida' })
  fecha_hora?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El número de personas debe ser un número' })
  @Min(1, { message: 'Debe ser al menos 1 persona' })
  numero_personas?: number;

  @IsOptional()
  @IsEnum(EstadoReserva, { message: 'Estado de reserva inválido' })
  estado?: EstadoReserva;

  @IsOptional()
  observaciones?: string;

  @IsOptional()
  @IsNumber()
  mesa_numero?: number;

  @IsOptional()
  @IsNumber()
  cliente_id?: number;
}