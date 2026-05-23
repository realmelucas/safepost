import {
  AlertOutlined,
  DashboardOutlined,
  IdcardOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';
import { useState } from 'react';
import { AlertsPage } from './pages/AlertsPage';
import { BadgesPage } from './pages/BadgesPage';
import { ChecksPage } from './pages/ChecksPage';
import { OverviewPage } from './pages/OverviewPage';

const { Header, Sider, Content } = Layout;

const pages = {
  overview: <OverviewPage />,
  badges: <BadgesPage />,
  checks: <ChecksPage />,
  alerts: <AlertsPage />
};

export function App() {
  const [page, setPage] = useState<keyof typeof pages>('overview');

  return (
    <Layout className="app-shell">
      <Sider width={232} className="app-sider">
        <div className="brand">
          <SafetyCertificateOutlined />
          <span>SafePost</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[page]}
          onClick={({ key }) => setPage(key as keyof typeof pages)}
          items={[
            { key: 'overview', icon: <DashboardOutlined />, label: '安全看板' },
            { key: 'badges', icon: <IdcardOutlined />, label: '工牌管理' },
            { key: 'checks', icon: <NotificationOutlined />, label: '检测记录' },
            { key: 'alerts', icon: <AlertOutlined />, label: '报警日志' }
          ]}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Typography.Title level={4}>AI兔帮守岗 智能卡安全监护系统</Typography.Title>
        </Header>
        <Content className="app-content">{pages[page]}</Content>
      </Layout>
    </Layout>
  );
}
