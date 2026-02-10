import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { SensorData } from '../sensor-data/entities/sensor-data.entity';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly BATCH_SIZE = 1000;
  private readonly INSERT_CHUNK_SIZE = 500;

  constructor(
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
  ) {}

  async ingestFromFile(filePath: string): Promise<{ totalRows: number; duration: number }> {
    const startTime = Date.now();
    let totalRows = 0;
    let batch: Partial<SensorData>[] = [];

    return new Promise((resolve, reject) => {
      const fileStream = createReadStream(filePath);
      
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on('data', async (row) => {
        try {
          const sensorData: Partial<SensorData> = {
            timestamp: new Date(row.timestamp),
            deviceId: row.device_id,
            locationId: row.location_id,
            sensorType: row.sensor_type,
            value: parseFloat(row.value),
            unit: row.unit,
            status: row.status,
          };

          batch.push(sensorData);
          totalRows++;

          if (batch.length >= this.BATCH_SIZE) {
            parser.pause();
            await this.insertBatch([...batch]);
            batch = [];
            this.logger.log(`Ingested ${totalRows} rows...`);
            parser.resume();
          }
        } catch (error) {
          this.logger.error(`Error processing row: ${error.message}`);
        }
      });

      parser.on('end', async () => {
        try {
          if (batch.length > 0) {
            await this.insertBatch(batch);
          }
          const duration = (Date.now() - startTime) / 1000;
          this.logger.log(`Ingestion completed: ${totalRows} rows in ${duration.toFixed(2)}s`);
          resolve({ totalRows, duration });
        } catch (error) {
          reject(error);
        }
      });

      parser.on('error', (error) => {
        this.logger.error(`Parser error: ${error.message}`);
        reject(error);
      });

      fileStream.pipe(parser);
    });
  }

  private async insertBatch(batch: Partial<SensorData>[]): Promise<void> {
    try {
      // Divide el batch en chunks más pequeños para evitar límites de parámetros
      for (let i = 0; i < batch.length; i += this.INSERT_CHUNK_SIZE) {
        const chunk = batch.slice(i, i + this.INSERT_CHUNK_SIZE);
        await this.sensorDataRepository
          .createQueryBuilder()
          .insert()
          .into(SensorData)
          .values(chunk)
          .execute();
      }
    } catch (error) {
      this.logger.error(`Batch insert error: ${error.message}`);
      throw error;
    }
  }
}
