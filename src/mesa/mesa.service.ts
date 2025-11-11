import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa } from './mesa.entity';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';

@Injectable()
export class MesaService {
  constructor(
    @InjectRepository(Mesa)
    private mesaRepository: Repository<Mesa>,
  ) {}

  async create(createMesaDto: CreateMesaDto): Promise<Mesa> {
    // Verificar si ya existe una mesa con ese número
    const existingMesa = await this.mesaRepository.findOne({
      where: { numero: createMesaDto.numero },
    });

    if (existingMesa) {
      throw new ConflictException(`Ya existe una mesa con el número ${createMesaDto.numero}`);
    }

    const mesa = this.mesaRepository.create(createMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async findAll(): Promise<Mesa[]> {
    return this.mesaRepository.find({
      relations: ['reservas'],
      order: { numero: 'ASC' },
    });
  }

  async findActive(): Promise<Mesa[]> {
    return this.mesaRepository.find({
      where: { activa: true },
      relations: ['reservas'],
      order: { numero: 'ASC' },
    });
  }

  async findOne(numero: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { numero },
      relations: ['reservas'],
    });

    if (!mesa) {
      throw new NotFoundException(`Mesa con número ${numero} no encontrada`);
    }

    return mesa;
  }

  async update(numero: number, updateMesaDto: UpdateMesaDto): Promise<Mesa> {
    const mesa = await this.findOne(numero);

    // Si se quiere cambiar el número de mesa, verificar que no exista
    if (updateMesaDto.numero && updateMesaDto.numero !== numero) {
      const existingMesa = await this.mesaRepository.findOne({
        where: { numero: updateMesaDto.numero },
      });

      if (existingMesa) {
        throw new ConflictException(`Ya existe una mesa con el número ${updateMesaDto.numero}`);
      }
    }

    Object.assign(mesa, updateMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async remove(numero: number): Promise<void> {
    const mesa = await this.findOne(numero);
    
    // Verificar si tiene reservas activas
    const reservasActivas = mesa.reservas?.filter(
      reserva => reserva.estado !== 'cancelada' && new Date(reserva.fecha_hora) >= new Date()
    );

    if (reservasActivas && reservasActivas.length > 0) {
      throw new ConflictException('No se puede eliminar una mesa con reservas activas');
    }

    await this.mesaRepository.remove(mesa);
  }

  async findByCapacity(capacidadMinima: number): Promise<Mesa[]> {
    return this.mesaRepository.find({
      where: {
        capacidad: capacidadMinima,
        activa: true,
      },
      order: { numero: 'ASC' },
    });
  }
}