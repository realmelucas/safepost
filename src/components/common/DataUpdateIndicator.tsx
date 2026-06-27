import React from 'react';
import { Space, Typography, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface DataUpdateIndicatorProps {
  lastUpdate?: string;
  isConnected?: boolean;
}

const DataUpdateIndicator: React.FC<DataUpdateIndicatorProps> = ({
  lastUpdate,
  isConnected = true,
}) => {
  const displayTime = lastUpdate || '--:--:--';

  return (
    <Space size={6} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {/* Green pulsing dot for live data */}
      <Tooltip title={isConnected ? '数据实时更新中' : '连接已断开'}>
        <span
          className={isConnected ? 'data-fresh' : undefined}
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isConnected ? 'var(--color-safe)' : 'var(--color-danger)',
            flexShrink: 0,
          }}
        />
      </Tooltip>

      <Text style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
        数据更新
      </Text>

      <Text
        style={{
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          fontFamily: 'monospace',
        }}
      >
        {displayTime}
      </Text>

      {isConnected && (
        <Tooltip title="实时同步中">
          <SyncOutlined
            spin
            style={{ fontSize: 11, color: 'var(--color-text-quaternary)' }}
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default DataUpdateIndicator;
