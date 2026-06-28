"""
SafePost 飞书集成后端服务
==========================
提供以下能力：
1. 飞书自建应用鉴权（tenant_access_token）
2. 报警消息发送（卡片消息 + 文本消息）
3. 飞书事件回调（卡片按钮交互、审批回调等）
4. 定时推送（日报/周报/月报）
"""
import os
import json
import hashlib
import time
import asyncio
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
import httpx

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="SafePost 飞书集成服务",
    version="1.0.0",
    description="AI兔帮守岗 - 飞书消息推送与交互服务"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 配置 ──────────────────────────────────────────────
APP_ID = os.getenv("FEISHU_APP_ID", "")
APP_SECRET = os.getenv("FEISHU_APP_SECRET", "")
VERIFY_TOKEN = os.getenv("FEISHU_VERIFY_TOKEN", "")
ENCRYPT_KEY = os.getenv("FEISHU_ENCRYPT_KEY", "")
WEBHOOK_URL = os.getenv("FEISHU_WEBHOOK_URL", "")

# token 缓存
_token_cache: dict = {"token": "", "expires_at": 0}


# ── 飞书 API 客户端 ───────────────────────────────────
class FeishuClient:
    """飞书 API 客户端，支持自建应用鉴权和 Webhook 发送"""

    @staticmethod
    async def get_tenant_token() -> str:
        """获取 tenant_access_token（自建应用模式）"""
        now = time.time()
        if _token_cache["token"] and _token_cache["expires_at"] > now + 60:
            return _token_cache["token"]

        if not APP_ID or not APP_SECRET:
            return ""  # 未配置自建应用，回退到 Webhook

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
                json={"app_id": APP_ID, "app_secret": APP_SECRET},
            )
            data = resp.json()
            if data.get("code") == 0:
                _token_cache["token"] = data["tenant_access_token"]
                _token_cache["expires_at"] = now + data.get("expire", 7200)
                return _token_cache["token"]
            raise Exception(f"飞书鉴权失败: {data}")

    @staticmethod
    async def send_webhook(payload: dict) -> dict:
        """通过 Webhook 发送消息（群机器人方式）"""
        if not WEBHOOK_URL:
            return {"code": -1, "msg": "Webhook URL 未配置"}
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(WEBHOOK_URL, json=payload)
            return resp.json()

    @staticmethod
    async def send_app_message(receive_id: str, msg_type: str, content: str) -> dict:
        """通过自建应用发送消息"""
        token = await FeishuClient.get_tenant_token()
        if not token:
            return {"code": -1, "msg": "自建应用未配置"}
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://open.feishu.cn/open-apis/im/v1/messages",
                params={"receive_id_type": "chat_id"},
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "receive_id": receive_id,
                    "msg_type": msg_type,
                    "content": content,
                },
            )
            return resp.json()


feishu = FeishuClient()


# ── 消息模板 ──────────────────────────────────────────
def build_sos_card(worker_name: str, worker_id: str, location: str,
                   triggered_at: str, mac: str = "", rssi: int = 0,
                   duration: int = 0) -> dict:
    """构建 SOS 紧急求救卡片"""
    return {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "🚨 SOS 紧急求救"},
                "template": "red"
            },
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": f"**⚠️ 工人触发了SOS紧急求救，请立即响应！**\n\n---\n**工人姓名**：{worker_name}\n**工号**：{worker_id}\n**所在位置**：{location}\n**触发时间**：{triggered_at}\n**手环MAC**：{mac}\n**网关RSSI**：{rssi} dBm\n**持续时长**：{duration}秒\n---\n📟 请立即前往现场确认人员状态"}},
                {"tag": "action", "actions": [
                    {"tag": "button", "text": {"tag": "plain_text", "content": "✅ 已确认处理"}, "type": "primary"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "❌ 误报"}, "type": "danger"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📞 拨打联系人"}, "type": "default"}
                ]},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": "🤖 SafePost 智能卡安全监护系统 · 自动报警"}]}
            ]
        }
    }


def build_vital_card(worker_name: str, worker_id: str, location: str,
                     triggered_at: str, temperature: float, heart_rate: int,
                     spo2: int, blood_pressure: str = "") -> dict:
    """构建体征异常告警卡片"""
    temp_status = "🔴 偏高" if temperature > 37.3 else ("🔵 偏低" if temperature < 36.0 else "🟢 正常")
    hr_status = "🔴 偏高" if heart_rate > 100 else ("🔵 偏低" if heart_rate < 60 else "🟢 正常")
    spo2_status = "🟢 正常" if spo2 >= 95 else ("🟡 偏低" if spo2 >= 90 else "🔴 危险")

    return {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "🫀 体征异常告警"},
                "template": "orange"
            },
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": f"**工人体征数据出现异常，请关注！**\n\n---\n**工人姓名**：{worker_name}\n**工号**：{worker_id}\n**所在位置**：{location}\n**触发时间**：{triggered_at}\n\n| 指标 | 实测值 | 正常范围 | 状态 |\n| --- | --- | --- | --- |\n| 🌡️ 体温 | **{temperature}°C** | 36.0-37.3°C | {temp_status} |\n| ❤️ 心率 | **{heart_rate} bpm** | 60-100 bpm | {hr_status} |\n| 💓 血氧 | {spo2}% | 95-100% | {spo2_status} |\n\n---\n📟 建议立即联系该工人，确认身体状况"}},
                {"tag": "action", "actions": [
                    {"tag": "button", "text": {"tag": "plain_text", "content": "🏥 安排就医"}, "type": "primary"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📞 联系工人"}, "type": "default"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "👀 持续观察"}, "type": "default"}
                ]},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": "🤖 SafePost 智能卡安全监护系统 · 自动报警"}]}
            ]
        }
    }


def build_lost_card(worker_name: str, worker_id: str, last_location: str,
                    last_signal: str, lost_duration: int, mac: str = "") -> dict:
    """构建设备失联告警卡片"""
    return {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "📡 设备失联告警"},
                "template": "yellow"
            },
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": f"**工人设备信号中断，可能发生意外！**\n\n---\n**工人姓名**：{worker_name}\n**工号**：{worker_id}\n**最后位置**：{last_location}\n**最后信号**：{last_signal}\n**中断时长**：已超 **{lost_duration}秒**\n**手环MAC**：{mac}\n---\n📟 可能原因：\n- 工人进入信号盲区\n- 手环电量耗尽\n- 手环被意外摘下\n- 人员发生意外失去行动能力\n\n⚠️ **请立即派人前往最后已知位置排查！**"}},
                {"tag": "action", "actions": [
                    {"tag": "button", "text": {"tag": "plain_text", "content": "🔍 派人排查"}, "type": "primary"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📞 联系工人"}, "type": "default"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📹 查看监控"}, "type": "default"}
                ]},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": "🤖 SafePost 智能卡安全监护系统 · 自动报警"}]}
            ]
        }
    }


def build_daily_report(stats: dict, date_str: str = "") -> dict:
    """构建安全日报卡片"""
    if not date_str:
        date_str = datetime.now().strftime("%Y年%m月%d日")

    return {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "📊 SafePost 安全日报"},
                "template": "blue"
            },
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": f"**{date_str} · 物流转运中心安全监护日报**\n\n---\n**📋 在岗概况**\n\n| 指标 | 数值 |\n| --- | --- |\n| 👷 应到工人 | {stats.get('total', 0)}人 |\n| ✅ 在岗正常 | {stats.get('normal', 0)}人 |\n| ⚠️ 体征异常 | {stats.get('vital_abnormal', 0)}人 |\n| 🔴 触发报警 | {stats.get('alerts_total', 0)}次 |\n| 📡 设备离线 | {stats.get('offline', 0)}人 |\n\n---\n**📈 报警统计**\n\n| 类型 | 次数 | 处置率 |\n| --- | --- | --- |\n| 🚨 SOS | {stats.get('sos_count', 0)} | {stats.get('sos_rate', '100%')} |\n| 📡 失联 | {stats.get('lost_count', 0)} | {stats.get('lost_rate', '100%')} |\n| ❓ 无响应 | {stats.get('no_response_count', 0)} | {stats.get('no_response_rate', '-')} |\n| 🫀 体征异常 | {stats.get('vital_count', 0)} | {stats.get('vital_rate', '100%')} |\n\n---\n**⏱️ 平均响应时间**：{stats.get('avg_response', 'N/A')}\n\n**📟 重点关注**\n{stats.get('focus_items', '- 无特殊关注事项')}"}},
                {"tag": "action", "actions": [
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📋 查看详细日报"}, "type": "primary", "url": "https://realmelucas.github.io/safepost/"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "⚙️ 系统配置"}, "type": "default", "url": "https://realmelucas.github.io/safepost/"}
                ]},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": f"🤖 SafePost 智能卡安全监护系统 · 每日 08:00 自动推送"}]}
            ]
        }
    }


def build_weekly_report(stats: dict, week_range: str = "") -> dict:
    """构建安全周报卡片"""
    if not week_range:
        today = datetime.now()
        monday = today - timedelta(days=today.weekday())
        sunday = monday + timedelta(days=6)
        week_range = f"{monday.strftime('%m/%d')} - {sunday.strftime('%m/%d')}"

    return {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "📈 SafePost 安全周报"},
                "template": "turquoise"
            },
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": f"**{week_range} · 安全监护周报**\n\n---\n**📊 本周概览**\n\n| 指标 | 数值 | 环比 |\n| --- | --- | --- |\n| 👷 日均在岗 | {stats.get('avg_workers', 0)}人 | {stats.get('worker_change', '持平')} |\n| 🔴 报警总数 | {stats.get('total_alerts', 0)}次 | {stats.get('alert_change', '持平')} |\n| ⏱️ 平均响应 | {stats.get('avg_response', 'N/A')} | {stats.get('response_change', '持平')} |\n| ✅ 处置率 | {stats.get('resolve_rate', '100%')} | {stats.get('resolve_change', '持平')} |\n\n---\n**📈 每日报警趋势**\n\n| 日期 | SOS | 失联 | 无响应 | 体征异常 |\n| --- | --- | --- | --- | --- |\n{stats.get('daily_trend', '| - | 0 | 0 | 0 | 0 |')}\n\n---\n**📟 本周重点事件**\n{stats.get('key_events', '- 无重大事件')}\n\n**💡 改进建议**\n{stats.get('suggestions', '- 持续保持当前安全管理水平')}"}},
                {"tag": "action", "actions": [
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📋 查看完整周报"}, "type": "primary", "url": "https://realmelucas.github.io/safepost/"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📊 数据大盘"}, "type": "default", "url": "https://realmelucas.github.io/safepost/"}
                ]},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": "🤖 SafePost 智能卡安全监护系统 · 每周一 09:00 自动推送"}]}
            ]
        }
    }


def build_monthly_report(stats: dict, month_str: str = "") -> dict:
    """构建安全月报卡片"""
    if not month_str:
        month_str = datetime.now().strftime("%Y年%m月")

    return {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "📋 SafePost 安全月报"},
                "template": "purple"
            },
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": f"**{month_str} · 安全监护月度报告**\n\n---\n**📊 月度KPI**\n\n| 指标 | 数值 | 目标 | 达成 |\n| --- | --- | --- | --- |\n| 🔴 报警总数 | {stats.get('total_alerts', 0)}次 | <50次 | {stats.get('alert_kpi', '✅')} |\n| ⏱️ 平均响应 | {stats.get('avg_response', 'N/A')} | <3分钟 | {stats.get('response_kpi', '✅')} |\n| ✅ 处置率 | {stats.get('resolve_rate', '100%')} | 100% | {stats.get('resolve_kpi', '✅')} |\n| 🎯 误报率 | {stats.get('false_rate', '0%')} | <5% | {stats.get('false_kpi', '✅')} |\n| 📡 在线率 | {stats.get('online_rate', '99%')} | >95% | {stats.get('online_kpi', '✅')} |\n\n---\n**📈 报警类型分布**\n\n| 类型 | 次数 | 占比 |\n| --- | --- | --- |\n| 🚨 SOS | {stats.get('sos_count', 0)} | {stats.get('sos_pct', '0%')} |\n| 📡 失联 | {stats.get('lost_count', 0)} | {stats.get('lost_pct', '0%')} |\n| ❓ 无响应 | {stats.get('no_response_count', 0)} | {stats.get('nr_pct', '0%')} |\n| 🫀 体征异常 | {stats.get('vital_count', 0)} | {stats.get('vital_pct', '0%')} |\n\n---\n**📟 月度总结**\n{stats.get('summary', '- 本月安全管理运行正常')}\n\n**🔮 下月计划**\n{stats.get('next_plan', '- 持续优化安全管理流程')}"}},
                {"tag": "action", "actions": [
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📋 查看完整月报"}, "type": "primary", "url": "https://realmelucas.github.io/safepost/"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📊 数据分析"}, "type": "default", "url": "https://realmelucas.github.io/safepost/"}
                ]},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": "🤖 SafePost 智能卡安全监护系统 · 每月1日 10:00 自动推送"}]}
            ]
        }
    }


# ── Pydantic 模型 ─────────────────────────────────────
class AlertPayload(BaseModel):
    """前端发送报警的请求体"""
    type: str  # sos / lost / no_response / vital_abnormal
    worker_name: str
    worker_id: str = ""
    location: str = ""
    triggered_at: str = ""
    mac: str = ""
    rssi: int = 0
    duration: int = 0
    # 体征异常专用
    temperature: float = 0
    heart_rate: int = 0
    spo2: int = 0
    blood_pressure: str = ""
    # 失联专用
    last_location: str = ""
    last_signal: str = ""
    lost_duration: int = 0


class ReportPayload(BaseModel):
    """日报/周报/月报的请求体"""
    report_type: str = "daily"  # daily / weekly / monthly
    stats: dict = {}
    date_range: str = ""


class ResolvePayload(BaseModel):
    """报警处置通知"""
    alert_type: str = ""
    worker_name: str = ""
    action: str = ""
    remark: str = ""
    processed_by: str = "管理员"


# ── API 路由 ──────────────────────────────────────────

@app.get("/")
async def root():
    return {"service": "SafePost 飞书集成服务", "version": "1.0.0", "status": "running"}


@app.post("/api/alert/send")
async def send_alert(payload: AlertPayload):
    """
    发送报警消息到飞书群
    支持 SOS、体征异常、失联、无响应四种类型
    """
    triggered_at = payload.triggered_at or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if payload.type == "sos":
        card = build_sos_card(
            payload.worker_name, payload.worker_id, payload.location,
            triggered_at, payload.mac, payload.rssi, payload.duration
        )
    elif payload.type == "vital_abnormal":
        card = build_vital_card(
            payload.worker_name, payload.worker_id, payload.location,
            triggered_at, payload.temperature, payload.heart_rate,
            payload.spo2, payload.blood_pressure
        )
    elif payload.type == "lost":
        card = build_lost_card(
            payload.worker_name, payload.worker_id,
            payload.last_location or payload.location,
            payload.last_signal or triggered_at,
            payload.lost_duration or payload.duration,
            payload.mac
        )
    else:
        # no_response 或其他，使用文本消息
        card = {
            "msg_type": "text",
            "content": {"text": f"⚠️ SafePost 报警\n\n工人 {payload.worker_name} 在 {payload.location} 触发「无响应」报警\n触发时间：{triggered_at}"}
        }

    result = await feishu.send_webhook(card)
    return {"success": result.get("code") == 0, "feishu_response": result}


@app.post("/api/alert/resolve")
async def send_resolve_notification(payload: ResolvePayload):
    """发送报警处置结果通知"""
    text = f"✅ **报警已处置**\n\n- 报警类型：{payload.alert_type}\n- 涉事工人：{payload.worker_name}\n- 处置操作：{payload.action}\n- 处置备注：{payload.remark}\n- 处置人：{payload.processed_by}\n- 处置时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

    card = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {"tag": "plain_text", "content": "✅ 报警已处置"},
                "template": "green"
            },
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": text}},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": "🤖 SafePost 智能卡安全监护系统"}]}
            ]
        }
    }

    result = await feishu.send_webhook(card)
    return {"success": result.get("code") == 0, "feishu_response": result}


@app.post("/api/report/send")
async def send_report(payload: ReportPayload):
    """发送日报/周报/月报"""
    if payload.report_type == "weekly":
        card = build_weekly_report(payload.stats, payload.date_range)
    elif payload.report_type == "monthly":
        card = build_monthly_report(payload.stats, payload.date_range)
    else:
        card = build_daily_report(payload.stats, payload.date_range)

    result = await feishu.send_webhook(card)
    return {"success": result.get("code") == 0, "feishu_response": result}


@app.post("/api/test/all")
async def test_all_cards():
    """一键测试所有卡片类型（通路验证用）"""
    results = {}

    # SOS
    sos_card = build_sos_card("张三", "SF-2024-0018", "3号岗亭·车厢B区",
                              datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                              "AA:BB:CC:DD:EE:01", -58, 0)
    results["sos"] = await feishu.send_webhook(sos_card)
    await asyncio.sleep(0.5)

    # 体征异常
    vital_card = build_vital_card("王五", "SF-2024-0023", "5号岗亭·车厢C区",
                                  datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                  39.5, 128, 96, "145/92")
    results["vital"] = await feishu.send_webhook(vital_card)
    await asyncio.sleep(0.5)

    # 失联
    lost_card = build_lost_card("赵六", "SF-2024-0031", "7号岗亭·车厢D区",
                                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                60, "AA:BB:CC:DD:EE:03")
    results["lost"] = await feishu.send_webhook(lost_card)
    await asyncio.sleep(0.5)

    # 日报
    daily_stats = {
        "total": 32, "normal": 30, "vital_abnormal": 1, "alerts_total": 3,
        "offline": 1, "sos_count": 1, "sos_rate": "100%", "lost_count": 1,
        "lost_rate": "100%", "no_response_count": 0, "no_response_rate": "-",
        "vital_count": 1, "vital_rate": "100%", "avg_response": "2分18秒 ✅",
        "focus_items": "- 王五体温持续偏高，建议安排休息观察\n- 3号岗亭车厢B区信号较弱，建议增设网关"
    }
    results["daily"] = await feishu.send_webhook(build_daily_report(daily_stats))
    await asyncio.sleep(0.5)

    # 周报
    weekly_stats = {
        "avg_workers": 31, "worker_change": "持平", "total_alerts": 8,
        "alert_change": "↓ 20%", "avg_response": "2分05秒",
        "response_change": "↑ 10%", "resolve_rate": "100%", "resolve_change": "持平",
        "daily_trend": "| 周一 | 1 | 1 | 0 | 1 |\n| 周二 | 0 | 1 | 0 | 1 |\n| 周三 | 2 | 0 | 0 | 1 |",
        "key_events": "- 周三发生2次SOS误触，已加强培训",
        "suggestions": "- 建议3号岗亭增补蓝牙网关\n- 建议更新手环固件到v2.1"
    }
    results["weekly"] = await feishu.send_webhook(build_weekly_report(weekly_stats))
    await asyncio.sleep(0.5)

    # 月报
    monthly_stats = {
        "total_alerts": 32, "avg_response": "2分12秒",
        "resolve_rate": "100%", "false_rate": "3.1%", "online_rate": "99.2%",
        "sos_count": 8, "sos_pct": "25%", "lost_count": 10, "lost_pct": "31.3%",
        "no_response_count": 4, "nr_pct": "12.5%", "vital_count": 10, "vital_pct": "31.3%",
        "alert_kpi": "✅", "response_kpi": "✅", "resolve_kpi": "✅",
        "false_kpi": "✅", "online_kpi": "✅",
        "summary": "- 本月安全管理总体达标，所有KPI均达标\n- 设备失联和体征异常为最主要报警类型\n- 平均响应时间持续优化中",
        "next_plan": "- 推进蓝牙网关增补部署\n- 优化SOS防误触算法\n- 启动飞书自建应用集成"
    }
    results["monthly"] = await feishu.send_webhook(build_monthly_report(monthly_stats))

    all_ok = all(r.get("code") == 0 for r in results.values())
    return {"success": all_ok, "results": results}


# ── 飞书事件回调 ───────────────────────────────────────
@app.post("/api/feishu/callback")
async def feishu_callback(request: Request):
    """飞书事件回调入口（自建应用配置后使用）"""
    body = await request.json()
    # 处理 URL 验证
    if body.get("type") == "url_verification":
        token = body.get("token", "")
        challenge = body.get("challenge", "")
        if token == VERIFY_TOKEN:
            return PlainTextResponse(challenge)
        return JSONResponse({"error": "invalid token"}, status_code=403)

    # 处理卡片按钮回调
    if body.get("type") == "event_callback":
        event = body.get("event", {})
        event_type = event.get("type", "")

        if event_type == "card.action.trigger":
            # 卡片按钮点击
            action = event.get("action", {})
            action_value = action.get("value", "")
            open_id = event.get("operator", {}).get("open_id", "")

            print(f"[飞书回调] 卡片按钮: {action_value}, 操作人: {open_id}")
            # TODO: 根据 action_value 执行对应的处置操作
            return JSONResponse({"success": True})

    return JSONResponse({"success": True})


# ── 健康检查 ───────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "webhook_configured": bool(WEBHOOK_URL),
        "app_configured": bool(APP_ID and APP_SECRET),
        "timestamp": datetime.now().isoformat()
    }


# ── 启动入口 ───────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
