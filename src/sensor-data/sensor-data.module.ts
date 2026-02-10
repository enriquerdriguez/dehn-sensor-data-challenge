import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorDataService } from './sensor-data.service';
import { SensorData } from './entities/sensor-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SensorData])],
  providers: [SensorDataService],
  exports: [SensorDataService],
})
export class SensorDataModule {}
