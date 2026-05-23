import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  suffix?: ReactNode;
}

export function MetricCard({ title, value, suffix }: MetricCardProps) {
  return (
    <Card bordered={false}>
      <Statistic title={title} value={value} suffix={suffix} />
    </Card>
  );
}
