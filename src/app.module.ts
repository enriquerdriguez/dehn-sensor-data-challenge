import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';

@Module({
  imports: [DatabaseModule, SensorDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
