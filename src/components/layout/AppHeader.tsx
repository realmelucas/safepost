import React from 'react';
import { Layout, Select, Badge, Space, Avatar, Dropdown, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { TRANSFER_CENTERS } from '../../config/constants';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, onToggle }) => {
  const [center, setCenter] = React.useState('shenzhen');

  const userMenuItems = [
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '个人设置',
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'var(--color-header-bg, #ffffff)',
        borderBottom: '1px solid var(--color-header-border, #f0f0f0)',
        height: 56,
        lineHeight: '56px',
      }}
    >
      {/* Left Section */}
      <Space size="large">
        <span
          onClick={onToggle}
          style={{ fontSize: 18, cursor: 'pointer', color: 'var(--color-text-primary)' }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
        <Select
          value={center}
          onChange={setCenter}
          style={{ width: 160 }}
          options={[...TRANSFER_CENTERS]}
          size="small"
        />
      </Space>

      {/* Center Section - Status Indicators */}
      <Space size={24}>
        <Space size={4}>
          <Badge status="success" />
          <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            在线工人 <Text strong style={{ color: 'var(--color-safe)' }}>128</Text>
          </Text>
        </Space>
        <Space size={4}>
          <CheckCircleFilled style={{ color: 'var(--color-safe)', fontSize: 12 }} />
          <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            飞书 <Text strong style={{ color: 'var(--color-safe)' }}>已连接</Text>
          </Text>
        </Space>
        <Space size={4}>
          <Badge status="error" />
          <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            未处理报警 <Text strong style={{ color: 'var(--color-danger)' }}>3</Text>
          </Text>
        </Space>
      </Space>

      {/* Right Section - User */}
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: 'var(--color-info)' }} />
          <Text style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>管理员</Text>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;
