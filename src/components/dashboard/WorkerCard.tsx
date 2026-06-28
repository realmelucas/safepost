import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import dayjs from 'dayjs';
import type { WorkerInfo } from '../../types/worker';
import type { VitalSignData } from '../../types/common';
import { VITAL_THRESHOLDS } from '../../config/constants';
import type { AlertInfo } from '../../types/alert';
import { ALERT_TYPE_CONFIG } from '../../types/alert';
import { VitalSignGauge, BatteryIndicator, SignalStrength, WorkerStatusIcon, AlertStatusTag } from '../common';

const { Text } = Typography;

interface WorkerCardProps {
  worker: WorkerInfo;
  vitalData: VitalSignData | null;
  alert: AlertInfo | null;
  onClick?: (workerId: string) => void;
}

const CARD_WIDTH = 280;
const CARD_HEIGHT = 200;

const getBorderStyle = (alert: AlertInfo | null, status: string): React.CSSProperties => {
  if (!alert && status !== 'offline') {
    return { borderColor: '#52c41a' };
  }
  if (status === 'offline') {
    return { borderColor: '#8c8c8c' };
  }
  if (!alert) {
    return { borderColor: '#52c41a' };
  }
  return { borderColor: ALERT_TYPE_CONFIG[alert.type]?.color || '#ff4d4f' };
};

const getCardClassName = (alert: AlertInfo | null, status: string): string | undefined => {
  if (!alert || status === 'offline') return undefined;
  if (alert.type === 'sos') return 'sos-pulse';
  if (alert.type === 'lost') return 'alert-pulse';
  if (alert.type === 'no_response') return 'alert-pulse';
  return undefined;
};

const getWorkerStatusForIcon = (status: string, alert: AlertInfo | null): 'online' | 'offline' | 'warning' | 'danger' | 'pending' => {
  if (alert && alert.type === 'sos') return 'danger';
  if (alert && (alert.type === 'lost' || alert.type === 'no_response')) return 'warning';
  if (alert && alert.type === 'vital_abnormal') return 'danger';
  if (status === 'on_duty') return 'online';
  if (status === 'pending_check') return 'pending';
  if (status === 'blocked') return 'warning';
  return 'offline';
};

const getWorkDuration = (workStartTime?: string): string => {
  if (!workStartTime) return '--';
  const start = dayjs(workStartTime);
  if (!start.isValid()) return '--';
  const now = dayjs();
  const hours = now.diff(start, 'hour');
  const minutes = now.diff(start, 'minute') % 60;
  return `${hours}h${minutes}m`;
};

const isVitalAbnormal = (type: 'temperature' | 'heartRate' | 'spo2', value: number | null): boolean => {
  if (value === null || value === 0) return false;
  if (type === 'temperature') return value < VITAL_THRESHOLDS.temperature.min || value > VITAL_THRESHOLDS.temperature.max;
  if (type === 'heartRate') return value < VITAL_THRESHOLDS.heartRate.min || value > VITAL_THRESHOLDS.heartRate.max;
  if (type === 'spo2') return value < VITAL_THRESHOLDS.spo2.min;
  return false;
};

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, vitalData, alert, onClick }) => {
  const statusForIcon = getWorkerStatusForIcon(worker.status, alert);
  const hasAlert = alert !== null;
  const cardClassName = getCardClassName(alert, worker.status);

  return (
    <Card
      size="small"
      hoverable
      onClick={() => onClick?.(worker.id)}
      className={cardClassName}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderWidth: 2,
        borderStyle: 'solid',
        ...getBorderStyle(alert, worker.status),
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      bodyStyle={{ padding: '8px 12px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* 顶部：工人姓名 + 状态图标 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <Space size={6}>
          <WorkerStatusIcon status={statusForIcon} size={14} pulse={hasAlert} />
          <Text strong style={{ fontSize: 14, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {worker.name}
          </Text>
        </Space>
        {alert && <AlertStatusTag type={alert.type} processed={alert.processed} />}
        {!alert && worker.status === 'offline' && (
          <Text type="secondary" style={{ fontSize: 11 }}>离线</Text>
        )}
      </div>

      {/* 体征数据行 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Row style={{ width: '100%' }}>
          <Col span={8}>
            <VitalSignGauge
              type="temperature"
              value={vitalData?.temperature ?? null}
              isAbnormal={isVitalAbnormal('temperature', vitalData?.temperature ?? null)}
            />
          </Col>
          <Col span={8}>
            <VitalSignGauge
              type="heartRate"
              value={vitalData?.heartRate ?? null}
              isAbnormal={isVitalAbnormal('heartRate', vitalData?.heartRate ?? null)}
            />
          </Col>
          <Col span={8}>
            <VitalSignGauge
              type="spo2"
              value={vitalData?.spo2 ?? null}
              isAbnormal={isVitalAbnormal('spo2', vitalData?.spo2 ?? null)}
            />
          </Col>
        </Row>
      </div>

      {/* 底部行：电量、信号、作业时长 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, borderTop: '1px solid #f0f0f0', paddingTop: 6 }}>
        <Space size={12}>
          <BatteryIndicator value={vitalData?.battery ?? 0} size="small" />
          <SignalStrength rssi={worker.gatewayRssi} />
        </Space>
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 11 }}>作业</Text>
          <Text style={{ fontSize: 12, fontWeight: 500, fontFamily: 'monospace' }}>
            {getWorkDuration(worker.workStartTime)}
          </Text>
        </Space>
      </div>
    </Card>
  );
};

export default WorkerCard;
