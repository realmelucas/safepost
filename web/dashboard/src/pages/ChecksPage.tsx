import { Button, Card, Form, Input, InputNumber, message, Table, Tag } from 'antd';
import { api } from '../services/api';

const records = [
  { key: '1', worker: '张三', badgeNo: 'B0001', bp: '122/78', alcohol: 0, passed: true, time: '09:12' },
  { key: '2', worker: '李四', badgeNo: 'B0003', bp: '152/94', alcohol: 0, passed: false, time: '09:16' }
];

export function ChecksPage() {
  const submit = async (values: Record<string, unknown>) => {
    try {
      await api.post('/checks', values);
      message.success('检测结果已上传');
    } catch {
      message.warning('后端未启动，已保留表单示例');
    }
  };

  return (
    <>
      <Card bordered={false} title="上传检测结果">
        <Form layout="inline" onFinish={submit}>
          <Form.Item name="workerId" rules={[{ required: true }]}><Input placeholder="workerId" /></Form.Item>
          <Form.Item name="badgeNo" rules={[{ required: true }]}><Input placeholder="工牌编号" /></Form.Item>
          <Form.Item name="systolic" rules={[{ required: true }]}><InputNumber placeholder="收缩压" /></Form.Item>
          <Form.Item name="diastolic" rules={[{ required: true }]}><InputNumber placeholder="舒张压" /></Form.Item>
          <Form.Item name="alcoholMg100ml" rules={[{ required: true }]}><InputNumber placeholder="酒精" /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">上传</Button></Form.Item>
        </Form>
      </Card>
      <Card bordered={false} title="检测记录" className="section">
        <Table
          pagination={false}
          dataSource={records}
          columns={[
            { title: '工人', dataIndex: 'worker' },
            { title: '工牌', dataIndex: 'badgeNo' },
            { title: '血压', dataIndex: 'bp' },
            { title: '酒精 mg/100ml', dataIndex: 'alcohol' },
            { title: '结果', dataIndex: 'passed', render: (passed) => <Tag color={passed ? 'green' : 'red'}>{passed ? '通过' : '禁止上岗'}</Tag> },
            { title: '时间', dataIndex: 'time' }
          ]}
        />
      </Card>
    </>
  );
}
