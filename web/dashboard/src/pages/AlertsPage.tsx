import { Button, Card, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { api, AlertRecord } from '../services/api';

const fallbackAlerts: AlertRecord[] = [
  {
    id: '1',
    alert_no: 'AL001',
    level: 'CRITICAL',
    type: 'SOS',
    message: 'B0001 触发 SOS 主动报警',
    status: 'OPEN',
    opened_at: '刚刚'
  }
];

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>(fallbackAlerts);

  const load = async () => {
    try {
      const res = await api.get<AlertRecord[]>('/alerts?status=OPEN');
      setAlerts(res.data.length ? res.data : fallbackAlerts);
    } catch {
      setAlerts(fallbackAlerts);
    }
  };

  const ack = async (id: string) => {
    try {
      await api.post(`/alerts/${id}/ack`, { operator: 'dashboard' });
      message.success('已确认');
      await load();
    } catch {
      message.warning('后端未启动，无法确认报警');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card bordered={false} title="报警日志">
      <Table
        rowKey="id"
        dataSource={alerts}
        columns={[
          { title: '报警号', dataIndex: 'alert_no' },
          { title: '等级', dataIndex: 'level', render: (level) => <Tag color={level === 'CRITICAL' ? 'red' : 'orange'}>{level}</Tag> },
          { title: '类型', dataIndex: 'type' },
          { title: '内容', dataIndex: 'message' },
          { title: '状态', dataIndex: 'status' },
          { title: '时间', dataIndex: 'opened_at' },
          {
            title: '操作',
            render: (_, record) => (
              <Space>
                <Button size="small" onClick={() => ack(record.id)}>确认</Button>
                <Button size="small" type="primary">关闭</Button>
              </Space>
            )
          }
        ]}
      />
    </Card>
  );
}
