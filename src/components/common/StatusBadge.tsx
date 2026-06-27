import React from 'react';
import { Badge, Tag } from 'antd';
import {
  CheckCircleFilled,
  MinusCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
} from '@ant-design/icons';

export type WorkerStatus = 'online' | 'offline' | 'warning' | 'danger' | 'pending';

interface StatusBadgeProps {
  status: WorkerStatus;
  pulse?: boolean;
  label?: string;
}

const statusConfig: Record<WorkerStatus, { color: string; icon: React.ReactNode; defaultLabel: string }> = {
  online: {
    color: '#52c41a',
    icon: <CheckCircleFilled />,
    defaultLabel: '在岗',
  },
  offline: {
    color: '#8c8c8c',
    icon: <MinusCircleFilled />,
    defaultLabel: '离线',
  },
  warning: {
    color: '#faad14',
    icon: <ClockCircleFilled />,
    defaultLabel: '警告',
  },
  danger: {
    color: '#ff4d4f',
    icon: <CloseCircleFilled />,
    defaultLabel: '危险',
  },
  pending: {
    color: '#faad14',
    icon: <ExclamationCircleFilled />,
    defaultLabel: '待确认',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, pulse = false, label }) => {
  const config = statusConfig[status];
  const className = pulse && (status === 'danger' || status === 'warning')
    ? status === 'danger' ? 'sos-pulse' : 'alert-pulse'
    : undefined;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span className={className} style={{ display: 'inline-flex', lineHeight: 0 }}>
        <Badge
          status={status === 'online' ? 'success' : status === 'offline' ? 'default' : status === 'warning' || status === 'pending' ? 'warning' : 'error'}
          dot={!config.icon}
        />
      </span>
      <span style={{ color: config.color, fontSize: 12 }}>
        {config.icon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
      </span>
      <Tag
        color={config.color}
        style={{ margin: 0, fontSize: 12, lineHeight: '20px' }}
      >
        {label || config.defaultLabel}
      </Tag>
    </span>
  );
};

export default StatusBadge;
