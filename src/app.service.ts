import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! Welcome to NestJS 🚀';
  }

  getHelloMessage(): string {
    return 'Hello! This is your IoT Sensor Data Ingestion application.';
  }
}
