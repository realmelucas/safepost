import React, { useEffect, useState } from 'react';
import {
  Typography, Card, Tabs, Form, Input, InputNumber, Switch, Select,
  Button, Space, Badge, TimePicker, Divider, Row, Col, Tag, message,
} from 'antd';
import {
  SettingOutlined, ApiOutlined, BellOutlined, LinkOutlined,
  CheckCircleFilled, CloseCircleFilled, MailOutlined, PhoneOutlined,
  ClockCircleOutlined, RobotOutlined, WechatOutlined, SendOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface SystemConfig {
  feishu: {
    appId: string;
    appSecret: string;
    webhookUrl: string;
  };
  alertRules: {
    temperatureMax: number;
    temperatureMin: number;
    heartRateMax: number;
    heartRateMin: number;
    spo2Min: number;
    lostTimeout: number;
    sosTimeout: number;
    noResponseTimeout: number;
  };
  pushStrategy: {
    dailyEnabled: boolean;
    dailyTime: string;
    weeklyEnabled: boolean;
    weeklyTime: string;
    monthlyEnabled: boolean;
    monthlyTime: string;
  };
}

const API_BASE = '/api';

const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [testing, setTesting] = useState(false);
  const [feishuForm] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [pushForm] = Form.useForm();

  // 加载配置
  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then(r => r.json())
      .then((data: SystemConfig) => {
        if (data && data.feishu) {
          setConfig(data);
          feishuForm.setFieldsValue(data.feishu);
          ruleForm.setFieldsValue(data.alertRules);
          pushForm.setFieldsValue({
            ...data.pushStrategy,
            dailyTime: dayjs(data.pushStrategy.dailyTime, 'HH:mm'),
            weeklyTime: dayjs(data.pushStrategy.weeklyTime, 'HH:mm'),
            monthlyTime: dayjs(data.pushStrategy.monthlyTime, 'HH:mm'),
          });
        }
      })
      .catch(() => message.error('加载配置失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (section: string) => {
    setSaving(section);
    try {
      let values: Record<string, unknown> = {};
      if (section === 'feishu') values = { feishu: feishuForm.getFieldsValue() };
      else if (section === 'alertRules') values = { alertRules: ruleForm.getFieldsValue() };
      else if (section === 'pushStrategy') {
        const raw = pushForm.getFieldsValue();
        values = {
          pushStrategy: {
            ...raw,
            dailyTime: typeof raw.dailyTime === 'string' ? raw.dailyTime : dayjs(raw.dailyTime).format('HH:mm'),
            weeklyTime: typeof raw.weeklyTime === 'string' ? raw.weeklyTime : dayjs(raw.weeklyTime).format('HH:mm'),
            monthlyTime: typeof raw.monthlyTime === 'string' ? raw.monthlyTime : dayjs(raw.monthlyTime).format('HH:mm'),
          },
        };
      }

      const resp = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await resp.json();
      if (data.success) {
        message.success('配置已保存');
        setConfig(data.config);
      } else {
        message.error('保存失败');
      }
    } catch {
      message.error('保存失败，请检查网络连接');
    } finally {
      setSaving('');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const resp = await fetch(`${API_BASE}/alert/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sos',
          worker_name: '测试用户',
          worker_id: 'TEST001',
          location: '测试岗亭',
          triggered_at: new Date().toISOString(),
          mac: 'TEST:MAC:ADDRESS',
          rssi: -50,
          duration: 0,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        message.success('飞书连接测试成功！请检查飞书群消息');
      } else {
        message.warning('飞书返回异常，请检查 Webhook 配置');
      }
    } catch {
      message.error('连接测试失败，请检查后端服务是否运行');
    } finally {
      setTesting(false);
    }
  };

  const handleTestReport = async (type: string) => {
    message.loading({ content: `正在生成${type === 'daily' ? '日报' : type === 'weekly' ? '周报' : '月报'}预览...`, key: 'report' });
    try {
      const resp = await fetch(`${API_BASE}/report/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: type, stats: {} }),
      });
      const data = await resp.json();
      if (data.success) {
        message.success({ content: '报告已推送到飞书群！', key: 'report' });
      }
    } catch {
      message.error({ content: '推送失败', key: 'report' });
    }
  };

  const feishuConnected = Boolean(config?.feishu?.webhookUrl);

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Title level={4} style={{ marginBottom: 24 }}>系统配置</Title>

      <Tabs
        defaultActiveKey="feishu"
        items={[
          {
            key: 'feishu',
            label: <span><ApiOutlined /> 飞书集成</span>,
            children: (
              <Card loading={loading}>
                <Form form={feishuForm} layout="vertical">
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="飞书 App ID" name="appId">
                        <Input placeholder="自建应用 App ID（可选）" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="飞书 App Secret" name="appSecret">
                        <Input.Password placeholder="自建应用 Secret（可选）" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="群机器人 Webhook 地址" name="webhookUrl">
                    <Input placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." />
                  </Form.Item>

                  <Space>
                    <Tag icon={feishuConnected ? <CheckCircleFilled /> : <CloseCircleFilled />}
                         color={feishuConnected ? 'success' : 'error'}>
                      {feishuConnected ? 'Webhook 已配置' : 'Webhook 未配置'}
                    </Tag>
                    <Tag icon={<CheckCircleFilled />} color={config?.feishu?.appId ? 'success' : 'default'}>
                      {config?.feishu?.appId ? '自建应用已配置' : '自建应用未配置'}
                    </Tag>
                  </Space>

                  <Divider />
                  <Space>
                    <Button type="primary" icon={<SendOutlined />} loading={testing} onClick={handleTestConnection}>
                      测试飞书连接
                    </Button>
                    <Button icon={<LinkOutlined />} loading={saving === 'feishu'} onClick={() => handleSave('feishu')}>
                      保存配置
                    </Button>
                  </Space>
                </Form>
              </Card>
            ),
          },
          {
            key: 'rules',
            label: <span><BellOutlined /> 报警规则</span>,
            children: (
              <Card loading={loading}>
                <Form form={ruleForm} layout="vertical">
                  <Title level={5}>体征阈值</Title>
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item label="体温上限 (°C)" name="temperatureMax">
                        <InputNumber min={36} max={42} step={0.1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="体温下限 (°C)" name="temperatureMin">
                        <InputNumber min={33} max={37} step={0.1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8} />
                    <Col span={8}>
                      <Form.Item label="心率上限 (bpm)" name="heartRateMax">
                        <InputNumber min={80} max={200} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="心率下限 (bpm)" name="heartRateMin">
                        <InputNumber min={30} max={80} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="血氧下限 (%)" name="spo2Min">
                        <InputNumber min={80} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={5} style={{ marginTop: 16 }}>超时规则（秒）</Title>
                  <Row gutter={24}>
                    <Col span={8}>
                      <Form.Item label="SOS 超时" name="sosTimeout">
                        <InputNumber min={10} max={300} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="失联超时" name="lostTimeout">
                        <InputNumber min={10} max={300} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="无响应超时" name="noResponseTimeout">
                        <InputNumber min={30} max={600} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Button type="primary" loading={saving === 'alertRules'} onClick={() => handleSave('alertRules')}>
                    保存规则
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'push',
            label: <span><ClockCircleOutlined /> 推送策略</span>,
            children: (
              <Card loading={loading}>
                <Form form={pushForm} layout="vertical">
                  {[
                    { key: 'daily', label: '安全日报', enabled: 'dailyEnabled', time: 'dailyTime' },
                    { key: 'weekly', label: '安全周报', enabled: 'weeklyEnabled', time: 'weeklyTime' },
                    { key: 'monthly', label: '安全月报', enabled: 'monthlyEnabled', time: 'monthlyTime' },
                  ].map(item => (
                    <Row key={item.key} gutter={24} align="middle" style={{ marginBottom: 16 }}>
                      <Col span={4}>
                        <Form.Item name={item.enabled} valuePropName="checked" style={{ marginBottom: 0 }}>
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Text strong>{item.label}</Text>
                      </Col>
                      <Col span={6}>
                        <Form.Item name={item.time} style={{ marginBottom: 0 }}>
                          <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Button size="small" icon={<SendOutlined />} onClick={() => handleTestReport(item.key)}>
                          预览推送
                        </Button>
                      </Col>
                    </Row>
                  ))}

                  <Divider />
                  <Button type="primary" loading={saving === 'pushStrategy'} onClick={() => handleSave('pushStrategy')}>
                    保存策略
                  </Button>
                </Form>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SettingsPage;
