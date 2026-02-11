import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { IngestionServiceCopy } from './ingestion.service-copy';
import { SensorData } from '../sensor-data/entities/sensor-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SensorData])],
  providers: [IngestionService, IngestionServiceCopy],
  exports: [IngestionService, IngestionServiceCopy],
})
export class IngestionModule {}
