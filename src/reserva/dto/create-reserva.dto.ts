import { IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';
import { EstadoReserva } from '../reserva.entity';

export class CreateReservaDto {
  @IsNotEmpty({ message: 'La fecha y hora son requeridas' })
  @IsDateString({}, { message: 'Debe ser una fecha válida' })
  fecha_hora: string;

  @IsNotEmpty({ message: 'El número de personas es requerido' })
  @IsNumber({}, { message: 'El número de personas debe ser un número' })
  @Min(1, { message: 'Debe ser al menos 1 persona' })
  numero_personas: number;

  @IsOptional()
  @IsEnum(EstadoReserva, { message: 'Estado de reserva inválido' })
  estado?: EstadoReserva;

  @IsOptional()
  observaciones?: string;

  @IsNotEmpty({ message: 'El número de mesa es requerido' })
  @IsNumber()
  mesa_numero: number;

  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  cliente_id: number;
}