#!/bin/sh
set -e

# Only pause when stdin is a TTY (e.g. docker-compose run -it pipeline).
# With docker-compose up there is no TTY, so we skip pause to avoid script exiting.
pause() {
  if [ -t 0 ]; then
    printf "\nPress Enter to run the next step... "
    read -r || true
  fi
}

# Wait for PostgreSQL
echo "=== Waiting for PostgreSQL ==="
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  sleep 2
done

# 1. Create table
echo "=== 1. Creating table sensor_data ==="
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\timing on' -f /app/queries/00_create_table.sql

# 2. Run ingestion (COPY)
echo "=== 2. Running ingestion (COPY) ==="
cd /app && npm run ingest:copy

# 3. Create indexes
echo "=== 3. Creating indexes ==="
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\timing on' -f /app/queries/00_create_indexes.sql
pause

# 4. Run queries (with \timing on to show execution time)
echo "=== 4. Query 1: Latest reading per device ==="
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\timing on' -f /app/queries/01_latest_reading_per_device.sql
pause

# Query 2: time range from env QUERY2_START and QUERY2_END (default: full 2025)
# Override: QUERY2_START="2025-01-15" QUERY2_END="2025-01-20" docker-compose run --rm -it pipeline
QUERY2_START="${QUERY2_START:-2025-01-01 00:00:00}"
QUERY2_END="${QUERY2_END:-2025-12-31 23:59:59}"
echo "=== 5. Query 2: Warning/Error readings in time range ($QUERY2_START to $QUERY2_END) ==="
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\timing on' -v start="$QUERY2_START" -v end="$QUERY2_END" -f /app/queries/02_warning_error_readings_time_range.sql
pause

echo "=== 6. Query 3: Average value per sensor type per day ==="
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USERNAME" -d "$DB_NAME" -c '\timing on' -f /app/queries/03_average_value_per_sensor_type_per_day.sql

echo ""
echo "=== Pipeline completed ==="
