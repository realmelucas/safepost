import React from 'react';
import { Card, Statistic, Skeleton, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface TrendInfo {
  value: number | string;
  isUp: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  color?: string;
  trend?: TrendInfo;
  loading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  color,
  trend,
  loading = false,
  onClick,
}) => {
  if (loading) {
    return (
      <Card size="small" style={{ minHeight: 120 }}>
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
      </Card>
    );
  }

  const trendIcon = trend ? (
    trend.isUp ? (
      <ArrowUpOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
    ) : (
      <ArrowDownOutlined style={{ color: '#52c41a', fontSize: 12 }} />
    )
  ) : null;

  return (
    <Card
      size="small"
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        minHeight: 120,
        cursor: onClick ? 'pointer' : 'default',
        borderTop: color ? `3px solid ${color}` : undefined,
      }}
    >
      <Statistic
        title={
          <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {title}
          </Text>
        }
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{
          fontSize: 28,
          fontWeight: 700,
          color: color || 'var(--color-text-primary)',
        }}
      />
      {trend && (
        <div style={{ marginTop: 4 }}>
          <Space size={4}>
            {trendIcon}
            <Text
              style={{
                fontSize: 12,
                color: trend.isUp ? '#ff4d4f' : '#52c41a',
              }}
            >
              {trend.value}
            </Text>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
