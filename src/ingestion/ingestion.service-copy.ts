import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { from as copyFrom } from 'pg-copy-streams';

@Injectable()
export class IngestionServiceCopy {
  private readonly logger = new Logger(IngestionServiceCopy.name);

  constructor(private dataSource: DataSource) {}

  async ingestFromFile(filePath: string): Promise<{ totalRows: number; duration: number }> {
    const startTime = Date.now();
    let totalRows = 0;

    const options = this.dataSource.options as any;
    const client = new Client({
      host: options.host || 'localhost',
      port: options.port || 5432,
      user: options.username,
      password: options.password,
      database: options.database,
    });
    await client.connect();

    return new Promise((resolve, reject) => {

      const stream = client.query(
        copyFrom(`
          COPY sensor_data (timestamp, device_id, location_id, sensor_type, value, unit, status)
          FROM STDIN WITH (FORMAT CSV, HEADER true, DELIMITER ',')
        `),
      );

      const fileStream = createReadStream(filePath);
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on('data', (row) => {
        const csvRow = [
          row.timestamp,
          row.device_id,
          row.location_id,
          row.sensor_type,
          row.value,
          row.unit,
          row.status,
        ].join(',') + '\n';

        stream.write(csvRow);
        totalRows++;

        if (totalRows % 100000 === 0) {
          this.logger.log(`Ingested ${totalRows.toLocaleString()} rows...`);
        }
      });

      parser.on('end', () => {
        stream.end();
      });

      stream.on('finish', async () => {
        await client.end();
        const duration = (Date.now() - startTime) / 1000;
        this.logger.log(`Ingestion completed: ${totalRows.toLocaleString()} rows in ${duration.toFixed(2)}s`);
        resolve({ totalRows, duration });
      });

      stream.on('error', async (error) => {
        await client.end();
        this.logger.error(`COPY error: ${error.message}`);
        reject(error);
      });

      parser.on('error', (error) => {
        this.logger.error(`Parser error: ${error.message}`);
        reject(error);
      });

      fileStream.pipe(parser);
    });
  }
}
