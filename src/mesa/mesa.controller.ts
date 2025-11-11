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
import { MesaService } from './mesa.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';

@Controller('mesas')
export class MesaController {
  constructor(private readonly mesaService: MesaService) {}

  @Post()
  create(@Body() createMesaDto: CreateMesaDto) {
    return this.mesaService.create(createMesaDto);
  }

  @Get()
  findAll(@Query('activas') activas?: string) {
    if (activas === 'true') {
      return this.mesaService.findActive();
    }
    return this.mesaService.findAll();
  }

  @Get('capacidad/:capacidad')
  findByCapacity(@Param('capacidad', ParseIntPipe) capacidad: number) {
    return this.mesaService.findByCapacity(capacidad);
  }

  @Get(':numero')
  findOne(@Param('numero', ParseIntPipe) numero: number) {
    return this.mesaService.findOne(numero);
  }

  @Patch(':numero')
  update(
    @Param('numero', ParseIntPipe) numero: number,
    @Body() updateMesaDto: UpdateMesaDto,
  ) {
    return this.mesaService.update(numero, updateMesaDto);
  }

  @Delete(':numero')
  remove(@Param('numero', ParseIntPipe) numero: number) {
    return this.mesaService.remove(numero);
  }
}