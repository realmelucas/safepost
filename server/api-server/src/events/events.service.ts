import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import mqtt, { MqttClient } from 'mqtt';
import { Pool } from 'pg';
import { AlertsService } from '../alerts/alerts.service';
import { PG_POOL } from '../db/db.module';

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);
  private client!: MqttClient;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly alerts: AlertsService
  ) {}

  onModuleInit() {
    this.client = mqtt.connect(process.env.MQTT_URL ?? 'mqtt://localhost:1883', {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD
    });

    this.client.on('connect', () => {
      this.client.subscribe(['safepost/badge/+/up', 'safepost/station/+/up'], { qos: 1 });
      this.logger.log('Subscribed to SafePost device topics');
    });

    this.client.on('message', (topic, payload) => {
      void this.handleMessage(topic, payload);
    });
  }

  private async handleMessage(topic: string, payload: Buffer) {
    const text = payload.toString('utf8');
    const event = JSON.parse(text) as { type: string; badgeNo?: string; stationNo?: string };

    await this.pool.query(
      'INSERT INTO device_events (device_id, event_type, payload) VALUES ($1, $2, $3)',
      [event.badgeNo ?? event.stationNo ?? topic, event.type, event]
    );

    if (event.type === 'SOS') {
      await this.alerts.create({
        type: 'SOS',
        level: 'CRITICAL',
        badgeNo: event.badgeNo,
        message: `工牌 ${event.badgeNo} 触发 SOS 主动报警`
      });
    }

    if (event.type === 'HEARTBEAT' && event.badgeNo) {
      await this.pool.query(
        'UPDATE badges SET last_seen_at = now(), battery = COALESCE(($2)::int, battery) WHERE badge_no = $1',
        [event.badgeNo, (event as { battery?: number }).battery ?? null]
      );
    }
  }
}
