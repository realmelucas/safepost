import { Button, Card, Table, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { api, Badge } from '../services/api';

const fallbackBadges: Badge[] = [
  { id: '1', badge_no: 'B0001', status: 'ALLOWED', battery: 86 },
  { id: '2', badge_no: 'B0002', status: 'PENDING', battery: 72 },
  { id: '3', badge_no: 'B0003', status: 'FORBIDDEN', battery: 64 }
];

export function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>(fallbackBadges);

  const load = async () => {
    try {
      const res = await api.get<Badge[]>('/badges');
      setBadges(res.data.length ? res.data : fallbackBadges);
    } catch {
      setBadges(fallbackBadges);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card bordered={false} title="工牌管理" extra={<Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>}>
      <Table
        rowKey="id"
        dataSource={badges}
        columns={[
          { title: '工牌编号', dataIndex: 'badge_no' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (status) => (
              <Tag>
                <span className={`status-dot status-${status}`} />
                {status}
              </Tag>
            )
          },
          { title: '电量', dataIndex: 'battery', render: (battery) => `${battery ?? '-'}%` },
          { title: '最后在线', dataIndex: 'last_seen_at', render: (value) => value ?? '-' }
        ]}
      />
    </Card>
  );
}
