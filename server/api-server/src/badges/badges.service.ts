import { Inject, Injectable } from '@nestjs/common';
import mqtt from 'mqtt';
import { Pool } from 'pg';
import { PG_POOL } from '../db/db.module';

export type BadgeStatus = 'PENDING' | 'ALLOWED' | 'FORBIDDEN' | 'ALERT';

@Injectable()
export class BadgesService {
  private readonly mqttClient = mqtt.connect(process.env.MQTT_URL ?? 'mqtt://localhost:1883', {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  });

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async list() {
    const result = await this.pool.query('SELECT * FROM badges ORDER BY created_at DESC LIMIT 100');
    return result.rows;
  }

  async bind(badgeNo: string, workerId: string) {
    const result = await this.pool.query(
      `UPDATE badges SET worker_id = $2 WHERE badge_no = $1 RETURNING *`,
      [badgeNo, workerId]
    );
    return result.rows[0];
  }

  async setStatus(badgeNo: string, status: BadgeStatus, reason: string) {
    const result = await this.pool.query(
      `UPDATE badges SET status = $2 WHERE badge_no = $1 RETURNING *`,
      [badgeNo, status]
    );

    this.mqttClient.publish(
      `safepost/badge/${badgeNo}/down`,
      JSON.stringify({
        type: 'SET_STATUS',
        status,
        message: reason,
        ts: Date.now()
      }),
      { qos: 1 }
    );

    return result.rows[0] ?? { badgeNo, status, reason };
  }
}
