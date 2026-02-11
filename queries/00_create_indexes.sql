-- Create indexes for better query performance
-- Run this AFTER data ingestion is complete

-- Index for Query 1: Latest reading per device
CREATE INDEX IF NOT EXISTS idx_device_timestamp 
ON sensor_data(device_id, timestamp DESC);

-- Index for Query 2: Warning/error readings in time range
CREATE INDEX IF NOT EXISTS idx_status_timestamp 
ON sensor_data(status, timestamp);

-- Index for Query 3: Average value per sensor type per day
-- Simple index on sensor_type and timestamp (DATE() will be used in query)
CREATE INDEX IF NOT EXISTS idx_sensor_type_timestamp 
ON sensor_data(sensor_type, timestamp);

-- Verify indexes were created
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'sensor_data';
