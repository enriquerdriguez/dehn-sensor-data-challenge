import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IngestionServiceCopy } from '../ingestion/ingestion.service-copy';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ingestionService = app.get(IngestionServiceCopy);

  const filePath = process.argv[2] || './task-sensor-data-v1.csv';
  
  console.log(`Starting ingestion from: ${filePath}`);
  
  try {
    const result = await ingestionService.ingestFromFile(filePath);
    console.log(`Ingestion completed successfully!`);
    console.log(`   Total rows: ${result.totalRows.toLocaleString()}`);
    console.log(`   Duration: ${result.duration.toFixed(2)}s`);
    console.log(`   Average: ${(result.totalRows / result.duration).toFixed(0)} rows/second`);
  } catch (error) {
    console.error('Ingestion failed:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
