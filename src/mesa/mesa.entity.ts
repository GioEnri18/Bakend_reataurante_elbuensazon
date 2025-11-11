import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

@Entity('mesas')
export class Mesa {
  @PrimaryColumn()
  @IsNumber()
  @Min(1, { message: 'El número de mesa debe ser mayor a 0' })
  numero: number;

  @Column()
  @IsNotEmpty({ message: 'La capacidad es requerida' })
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(1, { message: 'La capacidad debe ser mayor a 0' })
  capacidad: number;

  @Column()
  @IsNotEmpty({ message: 'La ubicación es requerida' })
  @IsString({ message: 'La ubicación debe ser un texto' })
  ubicacion: string;

  @Column({ default: true })
  activa: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany('Reserva', 'mesa')
  reservas: any[];
}