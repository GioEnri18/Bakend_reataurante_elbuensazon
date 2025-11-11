import { Module } from '@nestjs/common';
import { ConsultasController } from './consultas.controller';
import { ReservaModule } from '../reserva/reserva.module';
import { ClienteModule } from '../cliente/cliente.module';
import { MesaModule } from '../mesa/mesa.module';

@Module({
  imports: [ReservaModule, ClienteModule, MesaModule],
  controllers: [ConsultasController],
})
export class ConsultasModule {}