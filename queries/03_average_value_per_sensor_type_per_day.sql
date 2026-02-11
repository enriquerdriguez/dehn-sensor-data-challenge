-- Query 3: Average value per sensor type per day
-- Returns the average value, count of readings, and date for each sensor type grouped by day

SELECT 
    sensor_type,
    DATE(timestamp) as date,
    AVG(value) as avg_value,
    COUNT(*) as reading_count,
    MIN(value) as min_value,
    MAX(value) as max_value
FROM sensor_data
GROUP BY sensor_type, DATE(timestamp)
ORDER BY sensor_type, date;
