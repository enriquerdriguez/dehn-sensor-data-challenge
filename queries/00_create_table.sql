-- Create sensor_data table (matches TypeORM entity)
-- Used by pipeline when running without NestJS

CREATE TABLE IF NOT EXISTS sensor_data (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  device_id VARCHAR(50) NOT NULL,
  location_id VARCHAR(50) NOT NULL,
  sensor_type VARCHAR(20) NOT NULL,
  value DECIMAL(10, 4) NOT NULL,
  unit VARCHAR(10) NOT NULL,
  status VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
