-- Query 1: Latest reading per device
-- Returns the most recent reading for each device

SELECT DISTINCT ON (device_id) 
    device_id,
    timestamp,
    value,
    sensor_type,
    status,
    location_id,
    unit
FROM sensor_data
ORDER BY device_id, timestamp DESC;
