import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';
import { IngestionModule } from './ingestion/ingestion.module';

@Module({
  imports: [DatabaseModule, SensorDataModule, IngestionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
