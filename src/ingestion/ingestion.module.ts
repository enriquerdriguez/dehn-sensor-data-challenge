import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { SensorData } from '../sensor-data/entities/sensor-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SensorData])],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
