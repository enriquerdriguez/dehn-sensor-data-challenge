-- Query 2: All "warning" or "error" readings in a time range
-- Uses psql variables :start and :end (set via -v start=... -v end=... or env QUERY2_START, QUERY2_END)

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
  AND timestamp BETWEEN :'start'::timestamptz AND :'end'::timestamptz
ORDER BY timestamp DESC;
