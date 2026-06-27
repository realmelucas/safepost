import React from 'react';
import { Form, Input, Button, Space, Typography, Tag, Divider } from 'antd';
import { ScanOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import type { WorkerInfo } from '../../types/worker';

const { Text } = Typography;

interface DeviceBindingProps {
  worker: WorkerInfo;
}

const DeviceBinding: React.FC<DeviceBindingProps> = ({ worker }) => {
  const [braceletForm] = Form.useForm();
  const [cardForm] = Form.useForm();

  const handleScanBracelet = () => {
    // 模拟扫描
    braceletForm.setFieldsValue({ mac: 'AA:BB:CC:DD:EE:FF' });
  };

  return (
    <div>
      {/* 手环绑定 */}
      <div style={{ marginBottom: 24 }}>
        <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
          <LinkOutlined /> 手环绑定
        </Text>
        {worker.mac ? (
          <div style={{ marginBottom: 12 }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px' }}>
              已绑定：{worker.mac}
            </Tag>
            <Button size="small" danger icon={<DisconnectOutlined />} style={{ marginLeft: 8 }}>
              解绑
            </Button>
          </div>
        ) : null}
        <Form form={braceletForm} layout="inline">
          <Form.Item name="mac" rules={[{ required: true, message: '请输入或扫描MAC地址' }]}>
            <Input placeholder="手环MAC地址" style={{ width: 200 }} size="small" />
          </Form.Item>
          <Form.Item>
            <Button icon={<ScanOutlined />} size="small" onClick={handleScanBracelet}>
              扫描
            </Button>
          </Form.Item>
          <Form.Item>
            <Button type="primary" size="small">
              绑定
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            绑定时间：{worker.workStartTime || '2025-01-15 08:30:00'}
          </Text>
        </div>
      </div>

      <Divider />

      {/* 工牌绑定 */}
      <div style={{ marginTop: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
          <LinkOutlined /> 工牌绑定
        </Text>
        {worker.cardId ? (
          <div style={{ marginBottom: 12 }}>
            <Tag color="green" style={{ fontSize: 13, padding: '4px 10px' }}>
              已绑定：{worker.cardId}
            </Tag>
            <Button size="small" danger icon={<DisconnectOutlined />} style={{ marginLeft: 8 }}>
              解绑
            </Button>
          </div>
        ) : null}
        <Form form={cardForm} layout="inline">
          <Form.Item name="cardId" rules={[{ required: true, message: '请输入工牌ID' }]}>
            <Input placeholder="工牌ID" style={{ width: 200 }} size="small" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" size="small">
              绑定
            </Button>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            绑定时间：{worker.workStartTime || '2025-01-15 08:30:00'}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default DeviceBinding;
