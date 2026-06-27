import React from 'react';
import { Tooltip } from 'antd';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  MinusCircleFilled,
  ExclamationCircleFilled,
  QuestionCircleFilled,
} from '@ant-design/icons';
import { WORKER_STATUS_CONFIG } from '../../config/constants';

type WorkerStatus = 'online' | 'offline' | 'warning' | 'danger' | 'pending';

interface WorkerStatusIconProps {
  status: WorkerStatus;
  size?: number;
  pulse?: boolean;
}

const iconMap: Record<WorkerStatus, React.ComponentType<{ style?: React.CSSProperties }>> = {
  online: CheckCircleFilled,
  offline: MinusCircleFilled,
  warning: ClockCircleFilled,
  danger: CloseCircleFilled,
  pending: ExclamationCircleFilled,
};

const WorkerStatusIcon: React.FC<WorkerStatusIconProps> = ({
  status,
  size = 16,
  pulse = false,
}) => {
  const config = WORKER_STATUS_CONFIG[status];
  const IconComponent = iconMap[status] || QuestionCircleFilled;

  const className = pulse && (status === 'danger' || status === 'warning')
    ? status === 'danger' ? 'sos-pulse' : 'alert-pulse'
    : undefined;

  return (
    <Tooltip title={config?.label || status}>
      <span className={className} style={{ display: 'inline-flex', lineHeight: 0 }}>
        <IconComponent style={{ fontSize: size, color: config?.color }} />
      </span>
    </Tooltip>
  );
};

export default WorkerStatusIcon;
