import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../db/db.module';
import { WecomService } from '../wecom/wecom.service';

export interface CreateAlertInput {
  type: string;
  level: 'INFO' | 'WARN' | 'CRITICAL';
  message: string;
  badgeNo?: string;
  stationNo?: string;
}

@Injectable()
export class AlertsService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly wecom: WecomService
  ) {}

  async list(status = 'OPEN') {
    const result = await this.pool.query(
      'SELECT * FROM alerts WHERE status = $1 ORDER BY opened_at DESC LIMIT 100',
      [status]
    );
    return result.rows;
  }

  async create(input: CreateAlertInput) {
    const alertNo = `AL${Date.now()}`;
    const result = await this.pool.query(
      `INSERT INTO alerts (alert_no, level, type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [alertNo, input.level, input.type, input.message]
    );

    await this.wecom.sendAlert({
      title: input.type,
      level: input.level,
      badgeNo: input.badgeNo,
      stationName: input.stationNo,
      message: input.message
    });

    return result.rows[0];
  }

  async ack(id: string, operator: string) {
    const result = await this.pool.query(
      `UPDATE alerts
       SET status = 'ACKED', acked_at = now()
       WHERE id = $1
       RETURNING *, $2::text AS operator`,
      [id, operator]
    );
    return result.rows[0];
  }

  async resolve(id: string, operator: string, note?: string) {
    const result = await this.pool.query(
      `UPDATE alerts
       SET status = 'RESOLVED', resolved_at = now()
       WHERE id = $1
       RETURNING *, $2::text AS operator, $3::text AS note`,
      [id, operator, note ?? '']
    );
    return result.rows[0];
  }
}
