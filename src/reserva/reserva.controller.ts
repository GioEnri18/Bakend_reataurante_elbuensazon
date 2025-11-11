import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservaService.create(createReservaDto);
  }

  @Get()
  findAll() {
    return this.reservaService.findAll();
  }

  @Get('dia')
  findReservasDelDia(@Query('fecha') fecha?: string) {
    return this.reservaService.findReservasDelDia(fecha);
  }

  @Get('disponibilidad')
  findDisponibilidadMesas(
    @Query('fecha') fecha: string,
    @Query('hora') hora: string,
    @Query('personas') personas?: string,
  ) {
    const numPersonas = personas ? parseInt(personas) : undefined;
    return this.reservaService.findDisponibilidadMesas(fecha, hora, numPersonas);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservaService.update(id, updateReservaDto);
  }

  @Patch(':id/cancelar')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.reservaService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservaService.remove(id);
  }
}