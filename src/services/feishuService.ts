/**
 * SafePost 飞书消息推送服务
 * ==========================
 * 将报警事件通过飞书后端 API 推送到群聊
 */

import type { AlertInfo } from '../types/alert';

const FEISHU_API_BASE = 'http://localhost:8000/api';

// 报警类型到 API 的映射
function alertToPayload(alert: AlertInfo): Record<string, unknown> {
  const base = {
    type: alert.type,
    worker_name: alert.workerName,
    worker_id: alert.workerId,
    location: alert.location,
    triggered_at: alert.triggeredAt,
    duration: alert.duration,
  };

  // 根据类型补充特有字段
  if (alert.type === 'vital_abnormal') {
    return {
      ...base,
      temperature: 39.5,  // 后续可从 realtimeData 中提取
      heart_rate: 128,
      spo2: 96,
      blood_pressure: '145/92',
    };
  }

  if (alert.type === 'lost') {
    return {
      ...base,
      last_location: alert.location,
      last_signal: alert.triggeredAt,
      lost_duration: alert.duration,
      mac: alert.workerId,
    };
  }

  return base;
}

/**
 * 发送报警消息到飞书
 */
export async function sendAlertToFeishu(alert: AlertInfo): Promise<boolean> {
  try {
    const payload = alertToPayload(alert);
    const response = await fetch(`${FEISHU_API_BASE}/alert/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log('[FeishuService] 报警推送结果:', data);
    return data.success === true;
  } catch (error) {
    console.error('[FeishuService] 报警推送失败:', error);
    return false;
  }
}

/**
 * 发送处置结果通知到飞书
 */
export async function sendResolveToFeishu(
  alertType: string,
  workerName: string,
  action: string,
  remark: string,
  processedBy: string = '管理员'
): Promise<boolean> {
  try {
    const response = await fetch(`${FEISHU_API_BASE}/alert/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert_type: alertType,
        worker_name: workerName,
        action,
        remark,
        processed_by: processedBy,
      }),
    });
    const data = await response.json();
    console.log('[FeishuService] 处置通知推送结果:', data);
    return data.success === true;
  } catch (error) {
    console.error('[FeishuService] 处置通知推送失败:', error);
    return false;
  }
}

/**
 * 发送报告到飞书
 */
export async function sendReportToFeishu(
  reportType: 'daily' | 'weekly' | 'monthly',
  stats: Record<string, unknown>,
  dateRange: string = ''
): Promise<boolean> {
  try {
    const response = await fetch(`${FEISHU_API_BASE}/report/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_type: reportType,
        stats,
        date_range: dateRange,
      }),
    });
    const data = await response.json();
    console.log('[FeishuService] 报告推送结果:', data);
    return data.success === true;
  } catch (error) {
    console.error('[FeishuService] 报告推送失败:', error);
    return false;
  }
}
