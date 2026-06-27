import React from 'react';
import {
  Typography,
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Radio,
  Select,
  Button,
  Space,
  Badge,
  TimePicker,
  Divider,
  Row,
  Col,
  Tag,
  message,
} from 'antd';
import {
  SettingOutlined,
  ApiOutlined,
  BellOutlined,
  LinkOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const SettingsPage: React.FC = () => {
  const [feishuForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [pushForm] = Form.useForm();

  const handleSave = (tab: string) => {
    message.success(`${tab} 配置已保存`);
  };

  const handleTestConnection = () => {
    message.loading('正在测试飞书连接...', 1).then(() => {
      message.success('飞书连接测试成功');
    });
  };

  const tabItems = [
    {
      key: 'feishu',
      label: (
        <span><ApiOutlined /> 飞书集成配置</span>
      ),
      children: (
        <Form
          form={feishuForm}
          layout="vertical"
          initialValues={{
            appId: 'cli_a1234567890abcdef',
            appSecret: 'abcdef1234567890abcdef1234567890',
            phoneAlert: true,
            notificationGroup: 'safety-group',
            atReminder: true,
            actionMethod: 'card',
          }}
          style={{ maxWidth: 600 }}
        >
          {/* 飞书应用凭证 */}
          <Card size="small" title="飞书应用凭证" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="App ID" name="appId">
                  <Input.Password placeholder="飞书应用 App ID" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="App Secret" name="appSecret">
                  <Input.Password placeholder="飞书应用 App Secret" />
                </Form.Item>
              </Col>
            </Row>
            <Space align="center">
              <Text>连接状态：</Text>
              <Badge status="success" text={<Text style={{ color: '#52c41a' }}>已连接</Text>} />
              <Button
                type="link"
                icon={<ApiOutlined />}
                onClick={handleTestConnection}
                size="small"
              >
                测试连接
              </Button>
            </Space>
          </Card>

          {/* 报警通知配置 */}
          <Card size="small" title={<><BellOutlined /> 报警通知配置</>} style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="飞书电话通知" name="phoneAlert" valuePropName="checked">
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="@提醒" name="atReminder" valuePropName="checked">
                  <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="通知群组" name="notificationGroup">
              <Select
                options={[
                  { label: '安全管理群', value: 'safety-group' },
                  { label: '值班主管群', value: 'duty-group' },
                  { label: '运营管理群', value: 'ops-group' },
                  { label: '应急响应群', value: 'emergency-group' },
                ]}
              />
            </Form.Item>
            <Form.Item label="处置方式" name="actionMethod">
              <Radio.Group>
                <Radio.Button value="card">飞书卡片交互</Radio.Button>
                <Radio.Button value="web">跳转Web后台</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Card>

          <Button type="primary" onClick={() => handleSave('飞书集成')}>
            保存配置
          </Button>
        </Form>
      ),
    },
    {
      key: 'rules',
      label: (
        <span><SettingOutlined /> 报警规则配置</span>
      ),
      children: (
        <Form
          form={ruleForm}
          layout="vertical"
          initialValues={{
            lostTimeout: 30,
            noResponseTimeout: 60,
            tempThreshold: 38.5,
            heartRateThreshold: 120,
            spo2Threshold: 94,
            escalateTime: 300,
          }}
          style={{ maxWidth: 600 }}
        >
          <Card size="small" title="检测阈值设置" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="失联检测阈值（秒）" name="lostTimeout">
                  <InputNumber min={10} max={300} style={{ width: '100%' }} addonAfter="秒" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="无响应检测阈值（秒）" name="noResponseTimeout">
                  <InputNumber min={10} max={600} style={{ width: '100%' }} addonAfter="秒" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card size="small" title="体征异常阈值" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="体温异常阈值" name="tempThreshold">
                  <InputNumber min={35} max={42} step={0.1} style={{ width: '100%' }} addonAfter="°C" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="心率异常阈值" name="heartRateThreshold">
                  <InputNumber min={40} max={200} style={{ width: '100%' }} addonAfter="bpm" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="血氧异常阈值" name="spo2Threshold">
                  <InputNumber min={80} max={100} style={{ width: '100%' }} addonAfter="%" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="报警升级时间" name="escalateTime">
                  <InputNumber min={60} max={3600} style={{ width: '100%' }} addonAfter="秒" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Button type="primary" onClick={() => handleSave('报警规则')}>
            保存配置
          </Button>
        </Form>
      ),
    },
    {
      key: 'push',
      label: (
        <span><MailOutlined /> 推送策略配置</span>
      ),
      children: (
        <Form
          form={pushForm}
          layout="vertical"
          initialValues={{
            dailyReport: true,
            dailyTime: dayjs('08:00', 'HH:mm'),
            weeklyReport: true,
            weeklyTime: '每周一 09:00',
            monthlyReport: false,
            monthlyTime: '每月1日 10:00',
          }}
          style={{ maxWidth: 700 }}
        >
          {/* 日报 */}
          <Card
            size="small"
            title={
              <Space>
                <CalendarOutlined />
                <Text strong>安全日报</Text>
              </Space>
            }
            extra={
              <Form.Item name="dailyReport" valuePropName="checked" noStyle>
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            }
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="推送时间" name="dailyTime">
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            {/* 日报预览卡片 */}
            <Card
              size="small"
              style={{ backgroundColor: '#fafafa' }}
              bodyStyle={{ padding: 12 }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                推送内容预览
              </Text>
              <Row gutter={8}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0', background: '#fff', borderRadius: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>在岗人数</Text>
                    <div><Text strong style={{ fontSize: 20, color: '#52c41a' }}>128</Text></div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0', background: '#fff', borderRadius: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>报警次数</Text>
                    <div><Text strong style={{ fontSize: 20, color: '#ff4d4f' }}>3</Text></div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '8px 0', background: '#fff', borderRadius: 4 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>异常汇总</Text>
                    <div><Text strong style={{ fontSize: 20, color: '#faad14' }}>5</Text></div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Card>

          {/* 周报 */}
          <Card
            size="small"
            title={
              <Space>
                <LineChartOutlined />
                <Text strong>安全周报</Text>
              </Space>
            }
            extra={
              <Form.Item name="weeklyReport" valuePropName="checked" noStyle>
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            }
            style={{ marginBottom: 16 }}
          >
            <Form.Item label="推送时间" name="weeklyTime">
              <Input disabled style={{ width: '100%' }} />
            </Form.Item>
            <Card
              size="small"
              style={{ backgroundColor: '#fafafa' }}
              bodyStyle={{ padding: 12 }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                推送内容预览 - 趋势图
              </Text>
              <div
                style={{
                  height: 80,
                  background: '#fff',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed #d9d9d9',
                }}
              >
                <Space>
                  <LineChartOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                  <Text type="secondary">本周报警趋势图</Text>
                </Space>
              </div>
            </Card>
          </Card>

          {/* 月报 */}
          <Card
            size="small"
            title={
              <Space>
                <BarChartOutlined />
                <Text strong>安全月报</Text>
              </Space>
            }
            extra={
              <Form.Item name="monthlyReport" valuePropName="checked" noStyle>
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            }
            style={{ marginBottom: 16 }}
          >
            <Form.Item label="推送时间" name="monthlyTime">
              <Input disabled style={{ width: '100%' }} />
            </Form.Item>
            <Card
              size="small"
              style={{ backgroundColor: '#fafafa' }}
              bodyStyle={{ padding: 12 }}
            >
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                推送内容预览 - 统计汇总
              </Text>
              <Row gutter={8}>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '12px 0', background: '#fff', borderRadius: 4 }}>
                    <PieChartOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                    <div><Text type="secondary" style={{ fontSize: 11 }}>报警类型分布</Text></div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '12px 0', background: '#fff', borderRadius: 4 }}>
                    <BarChartOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <div><Text type="secondary" style={{ fontSize: 11 }}>月度趋势对比</Text></div>
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center', padding: '12px 0', background: '#fff', borderRadius: 4 }}>
                    <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
                    <div><Text type="secondary" style={{ fontSize: 11 }}>平均响应时间</Text></div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Card>

          <Button type="primary" onClick={() => handleSave('推送策略')}>
            保存配置
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 16 }}>系统配置</Title>
      <Card>
        <Tabs defaultActiveKey="feishu" items={tabItems} />
      </Card>
    </div>
  );
};

export default SettingsPage;
