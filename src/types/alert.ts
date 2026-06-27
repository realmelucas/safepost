export type AlertType = 'sos' | 'lost' | 'no_response' | 'vital_abnormal';
export type AlertEventType = 'triggered' | 'notified' | 'viewed' | 'action_taken' | 'resolved' | 'false_alarm';

export interface AlertInfo {
  id: string;
  type: AlertType;
  workerName: string;
  workerId: string;
  location: string;
  triggeredAt: string;
  duration: number;
  summary: string;
  processed: boolean;
  processedAt?: string;
  processedBy?: string;
  action?: string;
  remark?: string;
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  type: AlertEventType;
  actor?: string;
  description: string;
  details?: string;
}

export const ALERT_TYPE_CONFIG: Record<AlertType, { label: string; color: string; icon: string; priority: number }> = {
  sos:             { label: 'SOS求救',    color: '#FF1F1F', icon: 'WarningFilled',     priority: 1 },
  lost:            { label: '失联',        color: '#FF7A00', icon: 'DisconnectOutlined', priority: 2 },
  no_response:     { label: '无响应',      color: '#FFD700', icon: 'QuestionCircleFilled', priority: 3 },
  vital_abnormal:  { label: '体征异常',    color: '#FF6B6B', icon: 'HeartFilled',       priority: 4 },
};
