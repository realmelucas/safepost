import { Injectable } from '@nestjs/common';
import mqtt from 'mqtt';

export interface BroadcastInput {
  stationNo: string;
  type: 'DRINK_WATER' | 'WORK_TIMEOUT' | 'EVACUATE' | 'CUSTOM';
  message: string;
  badgeNos?: string[];
}

@Injectable()
export class BroadcastsService {
  private readonly mqttClient = mqtt.connect(process.env.MQTT_URL ?? 'mqtt://localhost:1883', {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  });

  async send(input: BroadcastInput) {
    const basePayload = {
      type: 'BROADCAST',
      noticeType: input.type,
      message: input.message,
      ts: Date.now()
    };

    const badgeNos = input.badgeNos?.length ? input.badgeNos : ['ALL'];
    for (const badgeNo of badgeNos) {
      this.mqttClient.publish(
        `safepost/station/${input.stationNo}/down`,
        JSON.stringify({ ...basePayload, badgeNo }),
        { qos: 1 }
      );
    }

    return { accepted: true, ...basePayload, badgeNos };
  }
}
