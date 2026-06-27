import React, { useState } from 'react';
import { Button, Input, Space, Tag, Typography, message } from 'antd';
import type { AlertInfo } from '../../types/alert';

const { TextArea } = Input;
const { Text } = Typography;

interface AlertActionPanelProps {
  alert: AlertInfo;
  onProcess: (id: string, action: string, remark: string) => void;
}

const actionLabels: Record<string, string> = {
  '派员查看': '已派人查看',
  false_alarm: '误报',
  resolved_safe: '已处理(安全)',
};

const AlertActionPanel: React.FC<AlertActionPanelProps> = ({ alert, onProcess }) => {
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAction = (action: string) => {
    if (!remark.trim() && action !== 'false_alarm') {
      message.warning('请填写处置备注');
      return;
    }
    setSubmitting(true);
    // simulate async
    setTimeout(() => {
      onProcess(alert.id, action, remark);
      setSubmitting(false);
      message.success(`操作成功：${actionLabels[action] || action}`);
    }, 300);
  };

  if (alert.processed) {
    const actionLabel = alert.action ? (actionLabels[alert.action] || alert.action) : '已处理';
    return (
      <div style={{ padding: '12px 0' }}>
        <Tag color={alert.action === 'false_alarm' ? 'default' : 'success'} style={{ fontSize: 13, padding: '4px 12px' }}>
          处理结果：{actionLabel}
        </Tag>
        {alert.remark && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">备注：{alert.remark}</Text>
          </div>
        )}
        {alert.processedBy && (
          <div style={{ marginTop: 4 }}>
            <Text type="secondary">处理人：{alert.processedBy}</Text>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <Space wrap size="small" style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          onClick={() => handleAction('派员查看')}
          loading={submitting}
        >
          已派人查看
        </Button>
        <Button
          danger
          onClick={() => handleAction('false_alarm')}
          loading={submitting}
        >
          误报
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          onClick={() => handleAction('resolved_safe')}
          loading={submitting}
        >
          已处理(安全)
        </Button>
      </Space>
      <TextArea
        placeholder="请输入处置备注（误报可不填）"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        rows={2}
        style={{ marginBottom: 8 }}
      />
    </div>
  );
};

export default AlertActionPanel;
