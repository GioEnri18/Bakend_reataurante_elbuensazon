import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional, Min } from 'class-validator';

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada',
}

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: 'La fecha y hora son requeridas' })
  @IsDateString({}, { message: 'Debe ser una fecha válida' })
  fecha_hora: Date;

  @Column()
  @IsNotEmpty({ message: 'El número de personas es requerido' })
  @IsNumber({}, { message: 'El número de personas debe ser un número' })
  @Min(1, { message: 'Debe ser al menos 1 persona' })
  numero_personas: number;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.PENDIENTE,
  })
  @IsEnum(EstadoReserva, { message: 'Estado de reserva inválido' })
  estado: EstadoReserva;

  @Column({ nullable: true })
  @IsOptional()
  observaciones?: string;

  @Column()
  @IsNotEmpty({ message: 'El número de mesa es requerido' })
  @IsNumber()
  mesa_numero: number;

  @Column()
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  cliente_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne('Mesa', 'reservas', { eager: true })
  @JoinColumn({ name: 'mesa_numero' })
  mesa: any;

  @ManyToOne('Cliente', 'reservas', { eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: any;
}