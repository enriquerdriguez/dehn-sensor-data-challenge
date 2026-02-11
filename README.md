# Dehn IoT Sensor Data Ingestion Challenge

NestJS + TypeScript application for ingesting high-volume IoT sensor data into PostgreSQL, with a single-command pipeline (PostgreSQL + ingestion script) and three analytical queries.

---

## 1. Setup Instructions

### Prerequisites

- **Docker** and **Docker Compose**
- Project files and `task-sensor-data-v1.csv` in the project root

### Single command: run the full pipeline

From the project root:

```bash
docker-compose up
```

This will:

1. Start **PostgreSQL** (database `sensor_data` is created automatically via `POSTGRES_DB`).
2. Start the **pipeline** service, which runs in order:
   - Create table `sensor_data`
   - Run **ingestion** (PostgreSQL COPY from `task-sensor-data-v1.csv`)
   - Create indexes
   - Run the **3 required queries** (with execution time shown)

When the pipeline finishes, its container exits. PostgreSQL keeps running until you stop with `Ctrl+C`.

### Clean run (fresh database)

```bash
docker-compose down
docker volume rm dehn-sensor-data-challenge_postgres_data
docker-compose up
```

### Interactive mode (pause after each step, see query results and timing)

```bash
docker-compose up -d postgres
docker-compose run --rm -it pipeline
```



---

## 2. Benchmark Results

*Fill in after running the pipeline on your machine. Example format below.*

### Environment

- **Machine:**  MacBook Pro M4 Pro, 24 GB RAM
- **Docker:** Docker Desktop 4.54
- **Dataset:** 4,000,000 rows, task-sensor-data-v1.csv

### Ingestion (COPY)

| Metric        | Value        |
|---------------|--------------|
| Total rows   |  4,000,000 |
| Duration     |  29.91s  |
| Throughput   | 133726 rows/second |

### Query execution times (psql `\timing`)

| Query | Description                              | Time (ms) |
|-------|------------------------------------------|-----------|
| 1     | Latest reading per device                | 4019.042 ms |
| 2     | Warning/error readings in time range (2025-01-01 00:00:00 to 2025-12-31 23:59:59)     | 239.157 ms  |
| 3     | Average value per sensor type per day    | 282.236 ms |



---

## 3. Schema Design Decisions

### Table: `sensor_data`

| Column       | Type           | Rationale |
|-------------|----------------|-----------|
| `id`        | `SERIAL`       | Surrogate primary key; simple and stable for joins and COPY. |
| `timestamp` | `TIMESTAMPTZ`  | Sensor reading time; timezone-aware for global deployments. |
| `device_id` | `VARCHAR(50)`  | Device identifier; length from expected ID format. |
| `location_id` | `VARCHAR(50)` | Location identifier. |
| `sensor_type` | `VARCHAR(20)` | Type of sensor (e.g. temperature, humidity). |
| `value`     | `DECIMAL(10,4)` | Numeric reading; decimal to avoid float rounding in aggregations. |
| `unit`      | `VARCHAR(10)` | Unit of measurement. |
| `status`    | `VARCHAR(10)` | Status (e.g. online, warning, error) for filtering. |
| `created_at` | `TIMESTAMPTZ` | Record insertion time; default `NOW()`. |


### Ingestion strategy

On a first approach I used a DTO, TypeORM and ReadStream to read the CSV, create entities and insert batches, but that approach was too slow for this kind of dataset. For this scenario, the ideal script should use PostgreSQL COPY and ReadStream to stream the rows from the CSV directly into the database, without loading the whole file into memory. COPY is much faster because it sends data in bulk instead of many separate INSERT statements. The indexes are created after the ingestion so they don’t slow down the COPY.

The first approach took around 180 seconds; the second approach completed in about 30 seconds.


### Indexes (created after ingestion)

- **`idx_device_timestamp`** on `(device_id, timestamp DESC)`  
  - Supports **Query 1** (latest reading per device) with `DISTINCT ON (device_id)` and ordering.

- **`idx_status_timestamp`** on `(status, timestamp)`  
  - Supports **Query 2** (warning/error in time range) by status and range on timestamp.

- **`idx_sensor_type_timestamp`** on `(sensor_type, timestamp)`  
  - Supports **Query 3** (average per sensor type per day) by sensor type and date grouping.

Indexes are created **after** the bulk COPY to avoid slowing down ingestion.


---

## 4. Cloud Scaling Considerations (100M+ Rows)

### Database

- **Partitioning:** Partition `sensor_data` by time (e.g. by month or week) on `timestamp` to keep partition size manageable and enable partition pruning for time-range queries (Query 2, Query 3).

### Queries and indexing

- **Indexes:** Keep the same index strategy; monitor slow queries and add partial or composite indexes if new access patterns appear.


---

## Project structure (reference)

```
├── docker-compose.yml          # PostgreSQL + pipeline service
├── Dockerfile                  # Node + postgresql-client for pipeline
├── task-sensor-data-v1.csv     # Input dataset
├── scripts/
│   ├── run-pipeline.sh         # Pipeline: create table → ingest → indexes → queries
│   └── ...
├── queries/
│   ├── 00_create_table.sql
│   ├── 00_create_indexes.sql
│   ├── 01_latest_reading_per_device.sql
│   ├── 02_warning_error_readings_time_range.sql
│   └── 03_average_value_per_sensor_type_per_day.sql
└── src/
    ├── ingestion/              # COPY-based ingestion (NestJS)
    ├── sensor-data/            # Entity and module
    └── ...
```

---

