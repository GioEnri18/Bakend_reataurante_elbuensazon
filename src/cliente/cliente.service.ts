import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    // Verificar si ya existe un cliente con ese email
    const existingCliente = await this.clienteRepository.findOne({
      where: { email: createClienteDto.email },
    });

    if (existingCliente) {
      throw new ConflictException(`Ya existe un cliente con el email ${createClienteDto.email}`);
    }

    const cliente = this.clienteRepository.create(createClienteDto);
    return this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      relations: ['reservas'],
      order: { nombre: 'ASC' },
    });
  }

  async findActive(): Promise<Cliente[]> {
    return this.clienteRepository.find({
      where: { activo: true },
      relations: ['reservas'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['reservas', 'reservas.mesa'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  async findByEmail(email: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { email },
      relations: ['reservas', 'reservas.mesa'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con email ${email} no encontrado`);
    }

    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);

    // Si se quiere cambiar el email, verificar que no exista
    if (updateClienteDto.email && updateClienteDto.email !== cliente.email) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { email: updateClienteDto.email },
      });

      if (existingCliente) {
        throw new ConflictException(`Ya existe un cliente con el email ${updateClienteDto.email}`);
      }
    }

    Object.assign(cliente, updateClienteDto);
    return this.clienteRepository.save(cliente);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    
    // Verificar si tiene reservas activas
    const reservasActivas = cliente.reservas?.filter(
      reserva => reserva.estado !== 'cancelada' && new Date(reserva.fecha_hora) >= new Date()
    );

    if (reservasActivas && reservasActivas.length > 0) {
      throw new ConflictException('No se puede eliminar un cliente con reservas activas');
    }

    await this.clienteRepository.remove(cliente);
  }

  async getHistorialReservas(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['reservas', 'reservas.mesa'],
      order: {
        reservas: {
          fecha_hora: 'DESC',
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  async searchByName(nombre: string): Promise<Cliente[]> {
    return this.clienteRepository
      .createQueryBuilder('cliente')
      .where('cliente.nombre LIKE :nombre OR cliente.apellido LIKE :nombre', {
        nombre: `%${nombre}%`,
      })
      .andWhere('cliente.activo = :activo', { activo: true })
      .leftJoinAndSelect('cliente.reservas', 'reservas')
      .leftJoinAndSelect('reservas.mesa', 'mesa')
      .orderBy('cliente.nombre', 'ASC')
      .getMany();
  }
}