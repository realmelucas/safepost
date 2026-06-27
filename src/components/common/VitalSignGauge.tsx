import React from 'react';
import { Typography, Space, Tooltip } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export type VitalType = 'temperature' | 'heartRate' | 'spo2';
export type Trend = 'up' | 'down' | 'stable';

interface VitalSignGaugeProps {
  type: VitalType;
  value: number | null;
  unit?: string;
  isAbnormal?: boolean;
  trend?: Trend;
}

const vitalConfig: Record<VitalType, { label: string; defaultUnit: string; icon: string }> = {
  temperature: { label: '体温', defaultUnit: '°C', icon: '🌡' },
  heartRate: { label: '心率', defaultUnit: 'bpm', icon: '💓' },
  spo2: { label: '血氧', defaultUnit: '%', icon: '🫁' },
};

const trendConfig: Record<Trend, { color: string; icon: React.ReactNode; label: string }> = {
  up: { color: '#ff4d4f', icon: <ArrowUpOutlined />, label: '上升' },
  down: { color: '#1677ff', icon: <ArrowDownOutlined />, label: '下降' },
  stable: { color: '#8c8c8c', icon: <MinusOutlined />, label: '平稳' },
};

const VitalSignGauge: React.FC<VitalSignGaugeProps> = ({
  type,
  value,
  unit,
  isAbnormal = false,
  trend = 'stable',
}) => {
  const config = vitalConfig[type];
  const trendInfo = trendConfig[trend];
  const displayUnit = unit || config.defaultUnit;

  if (value === null) {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {config.icon} {config.label}
        </Text>
        <div>
          <Text type="secondary" style={{ fontSize: 14 }}>
            --
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '4px 0' }}>
      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
        {config.label}
      </Text>
      <Tooltip title={isAbnormal ? '体征异常' : '正常'}>
        <Text
          strong
          style={{
            fontSize: 22,
            color: isAbnormal ? 'var(--color-danger)' : 'var(--color-text-primary)',
            lineHeight: 1.2,
          }}
        >
          {value.toFixed(1)}
          <Text style={{ fontSize: 12, marginLeft: 2, color: 'var(--color-text-tertiary)' }}>
            {displayUnit}
          </Text>
        </Text>
      </Tooltip>
      <div>
        <Space size={2}>
          <span style={{ color: trendInfo.color, fontSize: 11 }}>{trendInfo.icon}</span>
          <Text style={{ fontSize: 10, color: trendInfo.color }}>{trendInfo.label}</Text>
        </Space>
      </div>
    </div>
  );
};

export default VitalSignGauge;
