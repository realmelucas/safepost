import React, { useState } from 'react';
import { Alert, Button, Space, Typography, Row, Col } from 'antd';
import type { AlertInfo } from '../../types/alert';
import { ALERT_TYPE_CONFIG } from '../../types/alert';

const { Text } = Typography;

interface AlertBannerProps {
  alerts: AlertInfo[];
  onViewAll: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onViewAll }) => {
  const [dismissed, setDismissed] = useState(false);

  const unprocessedAlerts = alerts.filter((a) => !a.processed);
  if (unprocessedAlerts.length === 0 || dismissed) {
    return null;
  }

  // 按 priority 排序取最高优先级报警
  const sorted = [...unprocessedAlerts].sort(
    (a, b) => (ALERT_TYPE_CONFIG[a.type]?.priority ?? 99) - (ALERT_TYPE_CONFIG[b.type]?.priority ?? 99)
  );
  const topAlert = sorted[0];
  const config = ALERT_TYPE_CONFIG[topAlert.type];

  const isSOS = topAlert.type === 'sos';

  return (
    <div
      className={isSOS ? 'sos-pulse' : undefined}
      style={{ marginBottom: 16 }}
    >
      <Alert
        type="error"
        banner
        showIcon
        closable
        onClose={() => setDismissed(true)}
        message={
          <Row align="middle" style={{ width: '100%' }}>
            <Col flex="auto">
              <Space size={8} wrap>
                <Text strong style={{ color: config?.color || '#ff4d4f', fontSize: 14 }}>
                  [{config?.label || '报警'}]
                </Text>
                <Text>
                  {topAlert.workerName} - {topAlert.summary}
                </Text>
                {sorted.length > 1 && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    还有 {sorted.length - 1} 条报警未处理
                  </Text>
                )}
              </Space>
            </Col>
            <Col>
              <Button
                type="link"
                danger
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAll();
                }}
              >
                查看全部
              </Button>
            </Col>
          </Row>
        }
        style={{
          border: isSOS ? '2px solid #FF1F1F' : undefined,
          borderRadius: 8,
        }}
      />
    </div>
  );
};

export default AlertBanner;
