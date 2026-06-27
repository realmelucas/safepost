import React from 'react';
import { Empty, Button, Typography } from 'antd';

const { Text, Title } = Typography;

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = '暂无数据',
  description,
  actionText,
  onAction,
}) => {
  return (
    <Empty
      image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
      style={{ padding: '40px 0' }}
      description={null}
    >
      <div style={{ textAlign: 'center' }}>
        {icon && <div style={{ marginBottom: 16 }}>{icon}</div>}
        <Title
          level={5}
          style={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}
        >
          {title}
        </Title>
        {description && (
          <Text
            type="secondary"
            style={{ display: 'block', marginBottom: 16, fontSize: 13 }}
          >
            {description}
          </Text>
        )}
        {actionText && onAction && (
          <Button type="primary" onClick={onAction} size="small">
            {actionText}
          </Button>
        )}
      </div>
    </Empty>
  );
};

export default EmptyState;
