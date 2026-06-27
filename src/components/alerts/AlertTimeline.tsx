import React from 'react';
import { Timeline, Typography } from 'antd';
import {
  WarningFilled,
  SendOutlined,
  EyeOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AlertInfo } from '../../types/alert';

const { Text } = Typography;

interface AlertTimelineProps {
  alert: AlertInfo;
}

const AlertTimeline: React.FC<AlertTimelineProps> = ({ alert }) => {
  const events = [
    {
      time: dayjs(alert.triggeredAt).format('HH:mm:ss'),
      color: 'red',
      icon: <WarningFilled />,
      description: `系统检测到报警：${alert.summary}`,
    },
    {
      time: dayjs(alert.triggeredAt).add(5, 'second').format('HH:mm:ss'),
      color: 'blue',
      icon: <SendOutlined />,
      description: '已通过飞书推送通知给相关主管',
    },
    ...(alert.processed
      ? [
          {
            time: dayjs(alert.triggeredAt).add(30, 'second').format('HH:mm:ss'),
            color: 'orange',
            icon: <EyeOutlined />,
            description: `主管 ${alert.processedBy || '管理员'} 查看报警详情`,
          },
          {
            time: dayjs(alert.processedAt).format('HH:mm:ss'),
            color: alert.action === 'false_alarm' ? '#8c8c8c' : 'green',
            icon: alert.action === 'false_alarm' ? <CloseCircleOutlined /> : <ToolOutlined />,
            description:
              alert.action === 'false_alarm'
                ? `标记为误报${alert.remark ? ` - ${alert.remark}` : ''}`
                : `处置操作：${alert.action}${alert.remark ? ` - ${alert.remark}` : ''}`,
          },
          {
            time: dayjs(alert.processedAt).format('HH:mm:ss'),
            color: 'green',
            icon: <CheckCircleOutlined />,
            description: '报警已闭环处理',
          },
        ]
      : [
          {
            time: '等待中...',
            color: '#d9d9d9',
            icon: <EyeOutlined />,
            description: '等待主管查看处理',
          },
        ]),
  ];

  return (
    <Timeline
      items={events.map((e, idx) => ({
        key: idx,
        color: e.color,
        dot: e.icon,
        children: (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>{e.time}</Text>
            <br />
            <Text style={{ fontSize: 13 }}>{e.description}</Text>
          </div>
        ),
      }))}
    />
  );
};

export default AlertTimeline;
