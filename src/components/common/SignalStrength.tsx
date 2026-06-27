import React from 'react';
import { Tooltip, Space } from 'antd';
import { SIGNAL_THRESHOLDS } from '../../config/constants';

interface SignalStrengthProps {
  rssi: number; // RSSI value in dBm (e.g., -50, -75)
}

const getSignalLevel = (rssi: number): { bars: number; label: string; color: string } => {
  if (rssi >= SIGNAL_THRESHOLDS.excellent) {
    return { bars: 4, label: '信号优秀', color: '#52c41a' };
  }
  if (rssi >= SIGNAL_THRESHOLDS.good) {
    return { bars: 3, label: '信号良好', color: '#73d13d' };
  }
  if (rssi >= SIGNAL_THRESHOLDS.fair) {
    return { bars: 2, label: '信号一般', color: '#faad14' };
  }
  if (rssi >= SIGNAL_THRESHOLDS.poor) {
    return { bars: 1, label: '信号弱', color: '#ff7a00' };
  }
  return { bars: 0, label: '无信号', color: '#ff4d4f' };
};

const SignalStrength: React.FC<SignalStrengthProps> = ({ rssi }) => {
  const { bars, label, color } = getSignalLevel(rssi);

  return (
    <Tooltip title={`${label} (${rssi} dBm)`}>
      <Space size={1} style={{ display: 'inline-flex', alignItems: 'flex-end', height: 20 }}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              width: 4,
              height: 4 + level * 3.5,
              backgroundColor: level <= bars ? color : 'var(--color-border-secondary)',
              borderRadius: 1,
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
      </Space>
    </Tooltip>
  );
};

export default SignalStrength;
