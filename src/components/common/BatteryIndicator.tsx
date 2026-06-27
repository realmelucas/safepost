import React from 'react';
import { Progress, Tooltip } from 'antd';
import {
  ThunderboltFilled,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { BATTERY_THRESHOLDS } from '../../config/constants';

interface BatteryIndicatorProps {
  value: number; // 0-100
  charging?: boolean;
  size?: 'small' | 'default';
}

const getBatteryColor = (value: number): string => {
  if (value > BATTERY_THRESHOLDS.high) return '#52c41a';
  if (value > BATTERY_THRESHOLDS.medium) return '#faad14';
  return '#ff4d4f';
};

const getBatteryIcon = (value: number, charging?: boolean) => {
  if (charging) {
    return <ThunderboltFilled style={{ color: '#faad14', fontSize: 14 }} />;
  }
  if (value < BATTERY_THRESHOLDS.medium) {
    return <ThunderboltOutlined style={{ color: '#ff4d4f', fontSize: 14 }} />;
  }
  return null;
};

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
  value,
  charging = false,
  size = 'default',
}) => {
  const color = getBatteryColor(value);
  const icon = getBatteryIcon(value, charging);
  const strokeWidth = size === 'small' ? 6 : 8;
  const width = size === 'small' ? 60 : 80;

  // SVG battery shape using Progress
  return (
    <Tooltip title={`电量 ${value}%${charging ? ' (充电中)' : ''}`}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* Battery outline via CSS */}
        <div
          style={{
            position: 'relative',
            width: size === 'small' ? 34 : 42,
            height: size === 'small' ? 16 : 20,
            border: `2px solid ${color}`,
            borderRadius: 3,
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Battery terminal */}
          <div
            style={{
              position: 'absolute',
              right: -4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 3,
              height: size === 'small' ? 6 : 8,
              backgroundColor: color,
              borderRadius: '0 1px 1px 0',
            }}
          />
          {/* Fill level */}
          <div
            style={{
              width: `${value}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: 1,
              transition: 'width 0.5s ease, background-color 0.3s ease',
              minWidth: value > 0 ? 2 : 0,
            }}
          />
        </div>
        {icon}
      </div>
    </Tooltip>
  );
};

export default BatteryIndicator;
