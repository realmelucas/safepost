// ============================================
// SafeGuard System Constants
// ============================================

/** Vital sign thresholds */
export const VITAL_THRESHOLDS = {
  temperature: {
    min: 35.0,
    max: 38.0,
    criticalMin: 34.0,
    criticalMax: 40.0,
    unit: '°C',
  },
  heartRate: {
    min: 50,
    max: 120,
    criticalMin: 40,
    criticalMax: 150,
    unit: 'bpm',
  },
  spo2: {
    min: 94,
    max: 100,
    criticalMin: 90,
    unit: '%',
  },
} as const;

/** Timeout constants (seconds) */
export const SOS_TIMEOUT = 30;
export const LOST_TIMEOUT = 30;
export const NO_RESPONSE_TIMEOUT = 60;

/** Battery level thresholds */
export const BATTERY_THRESHOLDS = {
  high: 60,
  medium: 20,
} as const;

/** Signal strength thresholds (RSSI) */
export const SIGNAL_THRESHOLDS = {
  excellent: -50,
  good: -65,
  fair: -75,
  poor: -85,
} as const;

/** Refresh intervals (milliseconds) */
export const REFRESH_INTERVALS = {
  dashboard: 2000,
  alertList: 3000,
  workerList: 5000,
  vitalSigns: 1000,
} as const;

/** Pagination defaults */
export const PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/** Transfer center options */
export const TRANSFER_CENTERS = [
  { label: '深圳转运中心', value: 'shenzhen' },
  { label: '广州转运中心', value: 'guangzhou' },
  { label: '北京转运中心', value: 'beijing' },
  { label: '上海转运中心', value: 'shanghai' },
  { label: '成都转运中心', value: 'chengdu' },
] as const;

/** Worker status display config */
export const WORKER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  online:   { label: '在岗',   color: '#52c41a', icon: 'CheckCircleFilled' },
  offline:  { label: '离线',   color: '#8c8c8c', icon: 'MinusCircleFilled' },
  warning:  { label: '警告',   color: '#faad14', icon: 'ClockCircleFilled' },
  danger:   { label: '危险',   color: '#ff4d4f', icon: 'CloseCircleFilled' },
  pending:  { label: '待确认', color: '#faad14', icon: 'ExclamationCircleFilled' },
};

/** Alert type display config */
export const ALERT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string; priority: number }> = {
  sos:            { label: 'SOS求救',   color: '#FF1F1F', icon: 'WarningFilled',       priority: 1 },
  lost:           { label: '失联',      color: '#FF7A00', icon: 'DisconnectOutlined',   priority: 2 },
  no_response:    { label: '无响应',     color: '#FFD700', icon: 'QuestionCircleFilled', priority: 3 },
  vital_abnormal: { label: '体征异常',   color: '#FF6B6B', icon: 'HeartFilled',         priority: 4 },
};

/** App metadata */
export const APP_NAME = 'SafeGuard';
export const APP_SUBTITLE = '爱兔帮守岗系统';
export const APP_VERSION = '2.0.0';
