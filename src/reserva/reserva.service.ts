import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reserva, EstadoReserva } from './reserva.entity';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { MesaService } from '../mesa/mesa.service';
import { ClienteService } from '../cliente/cliente.service';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private reservaRepository: Repository<Reserva>,
    private mesaService: MesaService,
    private clienteService: ClienteService,
  ) {}

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const fechaReserva = new Date(createReservaDto.fecha_hora);
    
    // Validar que la fecha no sea en el pasado
    if (fechaReserva <= new Date()) {
      throw new BadRequestException('La fecha de reserva debe ser futura');
    }

    // Validar horarios laborales
    await this.validarHorarioLaboral(fechaReserva);

    // Verificar que la mesa existe y obtener sus datos
    const mesa = await this.mesaService.findOne(createReservaDto.mesa_numero);
    
    // Validar capacidad de la mesa
    if (createReservaDto.numero_personas > mesa.capacidad) {
      throw new BadRequestException(
        `La mesa ${mesa.numero} tiene capacidad para ${mesa.capacidad} personas, pero solicitas ${createReservaDto.numero_personas}`,
      );
    }

    // Verificar que el cliente existe
    await this.clienteService.findOne(createReservaDto.cliente_id);

    // Verificar disponibilidad de mesa en ese horario
    await this.validarDisponibilidadMesa(
      createReservaDto.mesa_numero,
      fechaReserva,
    );

    const reserva = this.reservaRepository.create({
      ...createReservaDto,
      fecha_hora: fechaReserva,
    });

    const reservaGuardada = await this.reservaRepository.save(reserva);

    // Si se crea una reserva confirmada, agregar puntos al cliente
    if (reservaGuardada.estado === EstadoReserva.CONFIRMADA) {
      const cliente = await this.clienteService.findOne(reservaGuardada.cliente_id);
      cliente.puntos = (cliente.puntos || 0) + 100;
      await this.clienteService.update(cliente.id, { puntos: cliente.puntos });
    }

    return reservaGuardada;
  }

  async findAll(): Promise<Reserva[]> {
    return this.reservaRepository.find({
      relations: ['mesa', 'cliente'],
      order: { fecha_hora: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: ['mesa', 'cliente'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return reserva;
  }

  async update(id: number, updateReservaDto: UpdateReservaDto): Promise<Reserva> {
    const reserva = await this.findOne(id);

    // Si se está cancelando la reserva
    if (updateReservaDto.estado === EstadoReserva.CANCELADA) {
      reserva.estado = EstadoReserva.CANCELADA;
      return this.reservaRepository.save(reserva);
    }

    // Si se está confirmando la reserva, agregar puntos al cliente
    if (updateReservaDto.estado === EstadoReserva.CONFIRMADA && reserva.estado !== EstadoReserva.CONFIRMADA) {
      const cliente = await this.clienteService.findOne(reserva.cliente_id);
      // Agregar 100 puntos por cada reserva confirmada
      cliente.puntos = (cliente.puntos || 0) + 100;
      await this.clienteService.update(cliente.id, { puntos: cliente.puntos });
    }

    // Si se está completando la reserva, agregar puntos al cliente
    if (updateReservaDto.estado === EstadoReserva.COMPLETADA && reserva.estado !== EstadoReserva.COMPLETADA) {
      const cliente = await this.clienteService.findOne(reserva.cliente_id);
      // Agregar 10 puntos por cada reserva completada
      cliente.puntos = (cliente.puntos || 0) + 10;
      await this.clienteService.update(cliente.id, { puntos: cliente.puntos });
    }

    // Si se cambia la fecha/hora, validar nuevamente
    if (updateReservaDto.fecha_hora) {
      const fechaReserva = new Date(updateReservaDto.fecha_hora);
      
      if (fechaReserva <= new Date()) {
        throw new BadRequestException('La fecha de reserva debe ser futura');
      }

      await this.validarHorarioLaboral(fechaReserva);
      
      // Si cambia la mesa o la fecha, validar disponibilidad
      const mesaNumero = updateReservaDto.mesa_numero || reserva.mesa_numero;
      await this.validarDisponibilidadMesa(mesaNumero, fechaReserva, id);
      
      updateReservaDto.fecha_hora = fechaReserva.toISOString();
    }

    // Si cambia la mesa, validar capacidad
    if (updateReservaDto.mesa_numero && updateReservaDto.mesa_numero !== reserva.mesa_numero) {
      const mesa = await this.mesaService.findOne(updateReservaDto.mesa_numero);
      const numeroPersonas = updateReservaDto.numero_personas || reserva.numero_personas;
      
      if (numeroPersonas > mesa.capacidad) {
        throw new BadRequestException(
          `La mesa ${mesa.numero} tiene capacidad para ${mesa.capacidad} personas`,
        );
      }
    }

    Object.assign(reserva, updateReservaDto);
    return this.reservaRepository.save(reserva);
  }

  async cancel(id: number): Promise<Reserva> {
    const reserva = await this.findOne(id);
    
    if (reserva.estado === EstadoReserva.CANCELADA) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    if (reserva.estado === EstadoReserva.COMPLETADA) {
      throw new BadRequestException('No se puede cancelar una reserva completada');
    }

    reserva.estado = EstadoReserva.CANCELADA;
    return this.reservaRepository.save(reserva);
  }

  async remove(id: number): Promise<void> {
    const reserva = await this.findOne(id);
    await this.reservaRepository.remove(reserva);
  }

  // Consultas especiales
  async findReservasDelDia(fecha?: string): Promise<Reserva[]> {
    const fechaBusqueda = fecha ? new Date(fecha) : new Date();
    const inicioDelDia = new Date(fechaBusqueda);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fechaBusqueda);
    finDelDia.setHours(23, 59, 59, 999);

    return this.reservaRepository.find({
      where: {
        fecha_hora: Between(inicioDelDia, finDelDia),
      },
      relations: ['mesa', 'cliente'],
      order: { fecha_hora: 'ASC' },
    });
  }

  async findDisponibilidadMesas(fecha: string, hora: string, personas?: number): Promise<any[]> {
    const fechaHora = new Date(`${fecha}T${hora}`);
    
    // Obtener todas las mesas activas
    let mesas = await this.mesaService.findActive();
    
    // Filtrar por capacidad si se especifica el número de personas
    if (personas) {
      mesas = mesas.filter(mesa => mesa.capacidad >= personas);
    }
    
    const disponibilidad = await Promise.all(
      mesas.map(async (mesa) => {
        const reservaExistente = await this.reservaRepository.findOne({
          where: {
            mesa_numero: mesa.numero,
            fecha_hora: fechaHora,
            estado: 'confirmada' as any,
          },
        });

        return {
          mesa: mesa,
          disponible: !reservaExistente,
          reservaExistente: reservaExistente || null,
        };
      }),
    );

    return disponibilidad;
  }

  // Métodos privados de validación
  private async validarHorarioLaboral(fecha: Date): Promise<void> {
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const horaCompleta = hora + minutos / 60;

    // Horario laboral de 8:00 AM a 10:00 PM (configurable)
    const horaInicio = 8; // 8:00 AM
    const horaFin = 22; // 10:00 PM

    if (horaCompleta < horaInicio || horaCompleta > horaFin) {
      throw new BadRequestException(
        `Las reservas solo están disponibles de ${horaInicio}:00 AM a ${horaFin}:00 PM`,
      );
    }

    // Validar que no sea domingo (día 0)
    const diaSemana = fecha.getDay();
    if (diaSemana === 0) {
      throw new BadRequestException('No se aceptan reservas los domingos');
    }
  }

  private async validarDisponibilidadMesa(
    mesaNumero: number,
    fechaHora: Date,
    reservaIdExcluir?: number,
  ): Promise<void> {
    // Crear ventana de tiempo de 2 horas para evitar solapamientos
    const inicioVentana = new Date(fechaHora.getTime() - 60 * 60 * 1000); // 1 hora antes
    const finVentana = new Date(fechaHora.getTime() + 60 * 60 * 1000); // 1 hora después

    const query = this.reservaRepository
      .createQueryBuilder('reserva')
      .where('reserva.mesa_numero = :mesaNumero', { mesaNumero })
      .andWhere('reserva.fecha_hora BETWEEN :inicio AND :fin', {
        inicio: inicioVentana,
        fin: finVentana,
      })
      .andWhere('reserva.estado != :estadoCancelada', {
        estadoCancelada: EstadoReserva.CANCELADA,
      });

    if (reservaIdExcluir) {
      query.andWhere('reserva.id != :reservaId', { reservaId: reservaIdExcluir });
    }

    const reservaExistente = await query.getOne();

    if (reservaExistente) {
      throw new ConflictException(
        `La mesa ${mesaNumero} ya está reservada en ese horario`,
      );
    }
  }
}