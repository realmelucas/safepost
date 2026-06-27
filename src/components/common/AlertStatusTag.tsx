import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  WarningFilled,
  DisconnectOutlined,
  QuestionCircleFilled,
  HeartFilled,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { ALERT_TYPE_CONFIG } from '../../config/constants';

type AlertType = 'sos' | 'lost' | 'no_response' | 'vital_abnormal';

interface AlertStatusTagProps {
  type: AlertType;
  processed?: boolean;
}

const iconMap: Record<AlertType, React.ReactNode> = {
  sos: <WarningFilled />,
  lost: <DisconnectOutlined />,
  no_response: <QuestionCircleFilled />,
  vital_abnormal: <HeartFilled />,
};

const AlertStatusTag: React.FC<AlertStatusTagProps> = ({ type, processed = false }) => {
  const config = ALERT_TYPE_CONFIG[type];

  if (!config) {
    return <Tag>未知</Tag>;
  }

  return (
    <Tooltip title={processed ? `${config.label} (已处理)` : config.label}>
      <Tag
        color={processed ? 'default' : config.color}
        icon={processed ? <CheckCircleOutlined /> : iconMap[type]}
        style={{
          margin: 0,
          opacity: processed ? 0.6 : 1,
          fontSize: 12,
        }}
      >
        {config.label}
        {processed && ' (已处理)'}
      </Tag>
    </Tooltip>
  );
};

export default AlertStatusTag;
