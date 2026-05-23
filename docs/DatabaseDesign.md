# 数据库设计

数据库：PostgreSQL

## 1. 表结构

```sql
CREATE TYPE badge_status AS ENUM ('PENDING', 'ALLOWED', 'FORBIDDEN', 'ALERT');
CREATE TYPE alert_level AS ENUM ('INFO', 'WARN', 'CRITICAL');
CREATE TYPE alert_status AS ENUM ('OPEN', 'ACKED', 'RESOLVED');

CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  team TEXT,
  phone TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_no TEXT UNIQUE NOT NULL,
  worker_id UUID REFERENCES workers(id),
  status badge_status NOT NULL DEFAULT 'PENDING',
  battery INTEGER,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE check_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  badge_id UUID REFERENCES badges(id),
  station_id UUID REFERENCES stations(id),
  systolic INTEGER,
  diastolic INTEGER,
  heart_rate INTEGER,
  alcohol_mg_100ml NUMERIC(6,2),
  passed BOOLEAN NOT NULL,
  reason TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  station_id UUID REFERENCES stations(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  last_response_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE device_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_no TEXT UNIQUE NOT NULL,
  badge_id UUID REFERENCES badges(id),
  worker_id UUID REFERENCES workers(id),
  station_id UUID REFERENCES stations(id),
  level alert_level NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status alert_status NOT NULL DEFAULT 'OPEN',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acked_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id),
  channel TEXT NOT NULL,
  target TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  response TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 2. 索引建议

```sql
CREATE INDEX idx_badges_last_seen ON badges(last_seen_at);
CREATE INDEX idx_check_records_worker_checked ON check_records(worker_id, checked_at DESC);
CREATE INDEX idx_alerts_status_opened ON alerts(status, opened_at DESC);
CREATE INDEX idx_device_events_device_received ON device_events(device_id, received_at DESC);
```
