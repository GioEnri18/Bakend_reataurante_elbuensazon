import { Controller, Get, Query } from '@nestjs/common';
import { ReservaService } from '../reserva/reserva.service';
import { ClienteService } from '../cliente/cliente.service';
import { MesaService } from '../mesa/mesa.service';

@Controller('consultas')
export class ConsultasController {
  constructor(
    private readonly reservaService: ReservaService,
    private readonly clienteService: ClienteService,
    private readonly mesaService: MesaService,
  ) {}

  @Get('disponibilidad-mesas')
  async consultarDisponibilidad(
    @Query('fecha') fecha: string,
    @Query('hora') hora: string,
    @Query('personas') personas?: string,
  ) {
    if (!fecha || !hora) {
      return {
        error: 'Debe proporcionar fecha y hora',
        ejemplo: '/consultas/disponibilidad-mesas?fecha=2024-12-01&hora=19:00&personas=4',
      };
    }

    const numPersonas = personas ? parseInt(personas) : undefined;
    const disponibilidad = await this.reservaService.findDisponibilidadMesas(fecha, hora, numPersonas);
    
    // Transformar los datos para incluir los detalles de las mesas
    const mesasDisponibles = disponibilidad
      .filter(m => m.disponible)
      .map(m => ({
        numero: m.mesa.numero,
        capacidad: m.mesa.capacidad,
        ubicacion: m.mesa.ubicacion,
      }));

    const mesasOcupadas = disponibilidad
      .filter(m => !m.disponible)
      .map(m => ({
        numero: m.mesa.numero,
        capacidad: m.mesa.capacidad,
        ubicacion: m.mesa.ubicacion,
      }));
    
    return {
      fecha,
      hora,
      personas: numPersonas,
      mesas_disponibles: mesasDisponibles,
      mesas_ocupadas: mesasOcupadas,
      total_mesas: disponibilidad.length,
    };
  }

  @Get('reservas-dia')
  async reservasDelDia(@Query('fecha') fecha?: string) {
    const reservas = await this.reservaService.findReservasDelDia(fecha);
    
    return {
      fecha: fecha || new Date().toISOString().split('T')[0],
      total_reservas: reservas.length,
      reservas_por_estado: {
        pendientes: reservas.filter(r => r.estado === 'pendiente').length,
        confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
        canceladas: reservas.filter(r => r.estado === 'cancelada').length,
        completadas: reservas.filter(r => r.estado === 'completada').length,
      },
      reservas,
    };
  }

  @Get('historial-cliente')
  async historialCliente(@Query('cliente_id') clienteId: string) {
    if (!clienteId) {
      return {
        error: 'Debe proporcionar el ID del cliente',
        ejemplo: '/consultas/historial-cliente?cliente_id=1',
      };
    }

    const cliente = await this.clienteService.getHistorialReservas(Number(clienteId));
    
    return {
      cliente: {
        id: cliente.id,
        nombre: `${cliente.nombre} ${cliente.apellido}`,
        email: cliente.email,
        telefono: cliente.telefono,
      },
      estadisticas: {
        total_reservas: cliente.reservas.length,
        reservas_pendientes: cliente.reservas.filter(r => r.estado === 'pendiente').length,
        reservas_confirmadas: cliente.reservas.filter(r => r.estado === 'confirmada').length,
        reservas_canceladas: cliente.reservas.filter(r => r.estado === 'cancelada').length,
        reservas_completadas: cliente.reservas.filter(r => r.estado === 'completada').length,
      },
      historial: cliente.reservas,
    };
  }

  @Get('resumen-ocupacion')
  async resumenOcupacion(@Query('fecha') fecha?: string) {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    const reservas = await this.reservaService.findReservasDelDia(fechaConsulta);
    const mesas = await this.mesaService.findActive();

    const ocupacionPorHora = {};

    // Inicializar horarios laborales (8 AM - 10 PM)
    for (let hora = 8; hora <= 22; hora++) {
      ocupacionPorHora[`${hora}:00`] = {
        mesas_ocupadas: 0,
        mesas_disponibles: mesas.length,
        reservas: [],
        detalles_mesas: mesas.map(mesa => ({
          numero: mesa.numero,
          capacidad: mesa.capacidad,
          ubicacion: mesa.ubicacion,
        })),
      };
    }

    // Calcular ocupación por hora
    reservas.forEach(reserva => {
      if (reserva.estado !== 'cancelada') {
        const hora = new Date(reserva.fecha_hora).getHours();
        const horaStr = `${hora}:00`;

        if (ocupacionPorHora[horaStr]) {
          ocupacionPorHora[horaStr].mesas_ocupadas++;
          ocupacionPorHora[horaStr].mesas_disponibles--;
          ocupacionPorHora[horaStr].reservas.push({
            id: reserva.id,
            mesa: reserva.mesa.numero,
            cliente: `${reserva.cliente.nombre} ${reserva.cliente.apellido}`,
            personas: reserva.numero_personas,
          });
        }
      }
    });

    return {
      fecha: fechaConsulta,
      total_mesas: mesas.length,
      ocupacion_por_hora: ocupacionPorHora,
    };
  }

  @Get('mesas-populares')
  async mesasPopulares(@Query('dias') dias: string = '30') {
    const diasAtras = parseInt(dias);
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasAtras);

    // Esta consulta requeriría una implementación más compleja con agregaciones
    // Por simplicidad, retornamos un placeholder
    return {
      periodo: `Últimos ${dias} días`,
      mensaje: 'Funcionalidad en desarrollo - requiere agregaciones SQL complejas',
      ejemplo_datos: [
        { mesa: 1, total_reservas: 45, promedio_personas: 3.2 },
        { mesa: 2, total_reservas: 38, promedio_personas: 2.8 },
        { mesa: 3, total_reservas: 42, promedio_personas: 4.1 },
      ],
    };
  }
}