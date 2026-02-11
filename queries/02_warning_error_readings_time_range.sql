-- Query 2: All "warning" or "error" readings in a time range
-- Returns all readings with status 'warning' or 'error' within the specified time range

SELECT 
    id,
    timestamp,
    device_id,
    location_id,
    sensor_type,
    value,
    unit,
    status
FROM sensor_data
WHERE status IN ('warning', 'error')
  AND timestamp BETWEEN :start AND :end
ORDER BY timestamp DESC;

-- Example usage with specific dates:
-- WHERE status IN ('warning', 'error')
--   AND timestamp BETWEEN '2025-01-01 00:00:00'::timestamptz 
--                       AND '2025-12-31 23:59:59'::timestamptz
