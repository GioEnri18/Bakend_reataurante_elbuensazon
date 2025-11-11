import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { Reserva } from './reserva.entity';
import { MesaModule } from '../mesa/mesa.module';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva]),
    MesaModule,
    ClienteModule,
  ],
  controllers: [ReservaController],
  providers: [ReservaService],
  exports: [ReservaService],
})
export class ReservaModule {}