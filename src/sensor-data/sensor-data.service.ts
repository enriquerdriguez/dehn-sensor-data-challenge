import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorDataDto } from './dto/sensor_data.dto';
import { SensorData } from './entities/sensor-data.entity';

@Injectable()
export class SensorDataService {
  constructor(
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
  ) {}

  async create(SensorDataDto: SensorDataDto): Promise<SensorData> {
    const sensorData = this.sensorDataRepository.create({
      timestamp: new Date(SensorDataDto.timestamp),
      deviceId: SensorDataDto.deviceId,
      locationId: SensorDataDto.locationId,
      sensorType: SensorDataDto.sensorType,
      value: SensorDataDto.value,
      unit: SensorDataDto.unit,
      status: SensorDataDto.status,
    });

    return await this.sensorDataRepository.save(sensorData);
  }

  async findAll(): Promise<SensorData[]> {
    return await this.sensorDataRepository.find({
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(deviceId: string): Promise<SensorData | null> {
    return await this.sensorDataRepository.findOne({
      where: { deviceId },
      order: { timestamp: 'DESC' },
    });
  }
}
