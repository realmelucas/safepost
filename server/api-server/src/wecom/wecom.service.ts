import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface WecomAlertMessage {
  title: string;
  level: 'INFO' | 'WARN' | 'CRITICAL';
  workerName?: string;
  badgeNo?: string;
  stationName?: string;
  message: string;
}

@Injectable()
export class WecomService {
  private readonly logger = new Logger(WecomService.name);

  constructor(private readonly config: ConfigService) {}

  async sendAlert(message: WecomAlertMessage): Promise<boolean> {
    const webhook = this.config.get<string>('WECOM_WEBHOOK_URL');
    if (!webhook) {
      this.logger.warn('WECOM_WEBHOOK_URL is not configured');
      return false;
    }

    const content = [
      `【SafePost ${message.level}】${message.title}`,
      message.workerName ? `工人：${message.workerName}` : undefined,
      message.badgeNo ? `工牌：${message.badgeNo}` : undefined,
      message.stationName ? `位置：${message.stationName}` : undefined,
      `详情：${message.message}`
    ].filter(Boolean).join('\n');

    await axios.post(webhook, {
      msgtype: 'markdown',
      markdown: { content }
    });

    return true;
  }
}
