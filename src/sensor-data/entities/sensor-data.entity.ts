import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('sensor_data')
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ name: 'device_id', length: 50 })
  deviceId: string;

  @Column({ name: 'location_id', length: 50 })
  locationId: string;

  @Column({ name: 'sensor_type', length: 20 })
  sensorType: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  value: number;

  @Column({ length: 10 })
  unit: string;

  @Column({ length: 10 })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
