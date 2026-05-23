import { Alert, Button, Card, Space, Table, Tag, Typography } from 'antd';
import { BellOutlined, SoundOutlined } from '@ant-design/icons';
import { MetricCard } from '../components/MetricCard';

const alerts = [
  { key: '1', level: 'CRITICAL', type: 'SOS', message: 'B0001 触发 SOS 主动报警', time: '刚刚' },
  { key: '2', level: 'WARN', type: 'OFFLINE', message: 'B0007 超过 120 秒未上报心跳', time: '3 分钟前' }
];

export function OverviewPage() {
  return (
    <>
      <Alert
        showIcon
        type="warning"
        message="当前存在 2 条未处理报警"
        action={<Button size="small" icon={<BellOutlined />}>查看</Button>}
      />
      <div className="metric-grid section">
        <MetricCard title="今日上岗人数" value={86} />
        <MetricCard title="工牌在线率" value="98.2%" />
        <MetricCard title="待处理报警" value={2} />
        <MetricCard title="检测通过率" value="94.7%" />
      </div>
      <Card
        bordered={false}
        title={<Typography.Text strong>实时报警</Typography.Text>}
        extra={<Button icon={<SoundOutlined />}>广播喝水提醒</Button>}
      >
        <Table
          pagination={false}
          dataSource={alerts}
          columns={[
            {
              title: '等级',
              dataIndex: 'level',
              render: (level) => <Tag color={level === 'CRITICAL' ? 'red' : 'orange'}>{level}</Tag>
            },
            { title: '类型', dataIndex: 'type' },
            { title: '内容', dataIndex: 'message' },
            { title: '时间', dataIndex: 'time' },
            {
              title: '操作',
              render: () => (
                <Space>
                  <Button size="small">确认</Button>
                  <Button size="small" type="primary">关闭</Button>
                </Space>
              )
            }
          ]}
        />
      </Card>
    </>
  );
}
