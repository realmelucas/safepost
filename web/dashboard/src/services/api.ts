import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1'
});

export interface Badge {
  id: string;
  badge_no: string;
  status: 'PENDING' | 'ALLOWED' | 'FORBIDDEN' | 'ALERT';
  battery?: number;
  last_seen_at?: string;
}

export interface AlertRecord {
  id: string;
  alert_no: string;
  level: 'INFO' | 'WARN' | 'CRITICAL';
  type: string;
  message: string;
  status: 'OPEN' | 'ACKED' | 'RESOLVED';
  opened_at: string;
}
