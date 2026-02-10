import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';
import { SensorDataDto } from './dto/sensor_data.dto';

@Controller('sensor-readings')
export class SensorDataController {
  constructor(private readonly sensorDataService: SensorDataService) {}

  @Post()
  async create(@Body() createSensorReadingDto: SensorDataDto) {
    return await this.sensorDataService.create(createSensorReadingDto);
  }

  @Get()
  async findAll() {
    return await this.sensorDataService.findAll();
  }

  @Get(':deviceId')
  async findOne(@Param('deviceId') deviceId: string) {
    return await this.sensorDataService.findOne(deviceId);
  }
}
