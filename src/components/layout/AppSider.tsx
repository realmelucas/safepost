import React from 'react';
import { Layout, Menu, Switch, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  AlertOutlined,
  TeamOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
  MoonOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { APP_NAME, APP_SUBTITLE } from '../../config/constants';

const { Sider } = Layout;
const { Text } = Typography;

interface AppSiderProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const menuItems = [
  {
    key: '/app/dashboard',
    icon: <DashboardOutlined />,
    label: '实时监控大盘',
  },
  {
    key: '/app/alerts',
    icon: <AlertOutlined />,
    label: '报警管理',
  },
  {
    key: '/app/workers',
    icon: <TeamOutlined />,
    label: '工人管理',
  },
  {
    key: '/app/settings',
    icon: <SettingOutlined />,
    label: '系统配置',
  },
];

const AppSider: React.FC<AppSiderProps> = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedKey = (() => {
    const path = location.pathname;
    const match = path.match(/^\/app\/([^/]+)/);
    return match ? `/app/${match[1]}` : '/app/dashboard';
  })();

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={220}
      style={{
        backgroundColor: 'var(--color-sider-bg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
      theme="dark"
    >
      {/* Logo Area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: collapsed ? '16px 0' : '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Space align="center" size={8}>
          <SafetyCertificateOutlined
            style={{ fontSize: 24, color: '#1677ff' }}
          />
          {!collapsed && (
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                {APP_NAME}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                {APP_SUBTITLE}
              </div>
            </div>
          )}
        </Space>
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          flex: 1,
          borderRight: 0,
          marginTop: 8,
          backgroundColor: 'transparent',
        }}
      />

      {/* Bottom Section */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: collapsed ? '12px 8px' : '12px 16px',
        }}
      >
        {/* Theme Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: 12,
          }}
        >
          {!collapsed && (
            <Space size={4}>
              {theme === 'dark' ? (
                <MoonOutlined style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }} />
              ) : (
                <SunOutlined style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }} />
              )}
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                {theme === 'dark' ? '深色模式' : '浅色模式'}
              </Text>
            </Space>
          )}
          <Switch
            size="small"
            checked={theme === 'dark'}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>

        {/* System Time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }} />
          {!collapsed && (
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, fontFamily: 'monospace' }}>
              {formatTime(currentTime)}
            </Text>
          )}
        </div>
      </div>
    </Sider>
  );
};

export default AppSider;
