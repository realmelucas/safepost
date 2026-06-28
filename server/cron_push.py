#!/usr/bin/env python3
"""
SafePost 定时推送脚本
=====================
支持日报（每日08:00）、周报（每周一09:00）、月报（每月1日10:00）
通过飞书 Webhook 推送到群聊。

使用方式:
  python3 cron_push.py daily      # 立即发送日报
  python3 cron_push.py weekly     # 立即发送周报
  python3 cron_push.py monthly    # 立即发送月报
  python3 cron_push.py all        # 发送所有报告

可配合 crontab 实现定时:
  0 8 * * * cd /path/to/server && python3 cron_push.py daily
  0 9 * * 1 cd /path/to/server && python3 cron_push.py weekly
  0 10 1 * * cd /path/to/server && python3 cron_push.py monthly
"""
import sys
import os
import random
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import httpx

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

WEBHOOK_URL = os.getenv("FEISHU_WEBHOOK_URL", "")
SAFEPOST_API = "http://localhost:8000"

# ── 模拟数据生成器（后续可替换为真实 API 调用） ──────

def get_daily_stats(date: datetime = None) -> dict:
    """生成日报数据"""
    if date is None:
        date = datetime.now()
    # 模拟：后续替换为从 SafePost 系统拉取真实数据
    total_workers = 32
    online = random.randint(28, total_workers)
    offline = total_workers - online
    sos = random.randint(0, 2)
    lost = random.randint(0, 2)
    no_resp = random.randint(0, 1)
    vital = random.randint(0, 3)
    alerts_total = sos + lost + no_resp + vital
    vital_abnormal = random.randint(0, 2)

    focus_items = []
    if vital_abnormal > 0:
        focus_items.append("- 有工人体征数据异常，建议关注")
    if offline > 0:
        focus_items.append(f"- {offline}人设备离线，建议排查")
    if sos > 0:
        focus_items.append("- 今日发生SOS报警，请关注处理情况")

    return {
        "total": total_workers,
        "normal": online - vital_abnormal,
        "vital_abnormal": vital_abnormal,
        "alerts_total": alerts_total,
        "offline": offline,
        "sos_count": sos,
        "sos_rate": "100%",
        "lost_count": lost,
        "lost_rate": "100%" if lost > 0 else "-",
        "no_response_count": no_resp,
        "no_response_rate": "100%" if no_resp > 0 else "-",
        "vital_count": vital,
        "vital_rate": "100%" if vital > 0 else "-",
        "avg_response": f"{random.randint(1,5)}分{random.randint(10,59)}秒",
        "focus_items": "\n".join(focus_items) if focus_items else "- 今日一切正常"
    }


def get_weekly_stats() -> dict:
    """生成周报数据"""
    weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    trend_lines = []
    total_alerts = 0
    for day in weekdays:
        s = random.randint(0, 2)
        l = random.randint(0, 2)
        nr = random.randint(0, 1)
        v = random.randint(0, 2)
        total_alerts += s + l + nr + v
        trend_lines.append(f"| {day} | {s} | {l} | {nr} | {v} |")

    today = datetime.now()
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    week_range = f"{monday.strftime('%m/%d')} - {sunday.strftime('%m/%d')}"

    return {
        "avg_workers": random.randint(29, 32),
        "worker_change": random.choice(["持平", "↑ 1人", "↓ 1人"]),
        "total_alerts": total_alerts,
        "alert_change": random.choice(["持平", "↓ 20%", "↑ 15%"]),
        "avg_response": f"{random.randint(1,3)}分{random.randint(10,59)}秒",
        "response_change": random.choice(["持平", "↑ 10%", "↓ 5%"]),
        "resolve_rate": "100%",
        "resolve_change": "持平",
        "daily_trend": "\n".join(trend_lines),
        "key_events": "- 本周发生" + str(random.randint(0,2)) + "次SOS误触，已记录",
        "suggestions": "- 持续关注体征异常工人\n- 建议定期检查手环电量"
    }, week_range


def get_monthly_stats() -> dict:
    """生成月报数据"""
    total = random.randint(25, 45)
    sos = random.randint(5, 12)
    lost = random.randint(8, 15)
    nr = random.randint(2, 8)
    vital = total - sos - lost - nr

    month_str = datetime.now().strftime("%Y年%m月")

    return {
        "total_alerts": total,
        "avg_response": f"{random.randint(1,3)}分{random.randint(10,59)}秒",
        "resolve_rate": "100%",
        "false_rate": f"{random.uniform(1,5):.1f}%",
        "online_rate": f"{random.uniform(97,99.9):.1f}%",
        "sos_count": sos, "sos_pct": f"{sos/total*100:.1f}%",
        "lost_count": lost, "lost_pct": f"{lost/total*100:.1f}%",
        "no_response_count": nr, "nr_pct": f"{nr/total*100:.1f}%",
        "vital_count": vital, "vital_pct": f"{vital/total*100:.1f}%",
        "alert_kpi": "✅" if total < 50 else "❌",
        "response_kpi": "✅",
        "resolve_kpi": "✅",
        "false_kpi": "✅",
        "online_kpi": "✅",
        "summary": "- 本月安全管理总体运行正常\n- 所有KPI指标达标\n- 建议下月继续优化响应流程",
        "next_plan": "- 推进蓝牙网关增补\n- 优化SOS防误触算法\n- 完成飞书自建应用集成"
    }, month_str


# ── 消息模板 ──────────────────────────────────────────

def build_daily_card(stats: dict, date_str: str = "") -> dict:
    if not date_str:
        date_str = datetime.now().strftime("%Y年%m月%d日")
    return {
        "msg_type": "interactive",
        "card": {
            "header": {"title": {"tag": "plain_text", "content": "📊 SafePost 安全日报"}, "template": "blue"},
            "elements": [
                {"tag": "div", "text": {"tag": "lark_md", "content": f"**{date_str} · 物流转运中心安全监护日报**\n\n---\n**📋 在岗概况**\n\n| 指标 | 数值 |\n| --- | --- |\n| 👷 应到工人 | {stats.get('total', 0)}人 |\n| ✅ 在岗正常 | {stats.get('normal', 0)}人 |\n| ⚠️ 体征异常 | {stats.get('vital_abnormal', 0)}人 |\n| 🔴 触发报警 | {stats.get('alerts_total', 0)}次 |\n| 📡 设备离线 | {stats.get('offline', 0)}人 |\n\n---\n**📈 报警统计**\n\n| 类型 | 次数 | 处置率 |\n| --- | --- | --- |\n| 🚨 SOS | {stats.get('sos_count', 0)} | {stats.get('sos_rate', '100%')} |\n| 📡 失联 | {stats.get('lost_count', 0)} | {stats.get('lost_rate', '100%')} |\n| ❓ 无响应 | {stats.get('no_response_count', 0)} | {stats.get('no_response_rate', '-')} |\n| 🫀 体征异常 | {stats.get('vital_count', 0)} | {stats.get('vital_rate', '100%')} |\n\n---\n**⏱️ 平均响应时间**：{stats.get('avg_response', 'N/A')}\n\n**📟 重点关注**\n{stats.get('focus_items', '- 无特殊关注事项')}"}},
                {"tag": "action", "actions": [
                    {"tag": "button", "text": {"tag": "plain_text", "content": "📋 查看详细日报"}, "type": "primary", "url": "https://realmelucas.github.io/safepost/"},
                    {"tag": "button", "text": {"tag": "plain_text", "content": "⚙️ 系统配置"}, "type": "default", "url": "https://realmelucas.github.io/safepost/"}
                ]},
                {"tag": "hr"},
                {"tag": "note", "elements": [{"tag": "plain_text", "content": "🤖 SafePost 智能卡安全监护系统 · 每日 08:00 自动推送"}]}
            ]
        }
    }


def build_weekly_card(stats: dict, week_range: str) -> dict:
    return {
        "msg_type": "interactive",
        "card": {
            "header": {"title": {"tag": "plain_text", "content": "📈 SafePost 安全周报"}, "template": "turquoise"},
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


def build_monthly_card(stats: dict, month_str: str) -> dict:
    return {
        "msg_type": "interactive",
        "card": {
            "header": {"title": {"tag": "plain_text", "content": "📋 SafePost 安全月报"}, "template": "purple"},
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


# ── 发送函数 ──────────────────────────────────────────

async def send_card(card: dict, label: str) -> bool:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(WEBHOOK_URL, json=card)
        data = resp.json()
        ok = data.get("code") == 0
        status = "✅ 成功" if ok else f"❌ 失败 ({data})"
        print(f"  [{status}] {label}")
        return ok


async def push_daily():
    print("\n📊 发送安全日报...")
    stats = get_daily_stats()
    card = build_daily_card(stats)
    return await send_card(card, "安全日报")


async def push_weekly():
    print("\n📈 发送安全周报...")
    stats, week_range = get_weekly_stats()
    card = build_weekly_card(stats, week_range)
    return await send_card(card, f"安全周报 ({week_range})")


async def push_monthly():
    print("\n📋 发送安全月报...")
    stats, month_str = get_monthly_stats()
    card = build_monthly_card(stats, month_str)
    return await send_card(card, f"安全月报 ({month_str})")


# ── 主入口 ────────────────────────────────────────────

async def main():
    if not WEBHOOK_URL:
        print("❌ 错误：FEISHU_WEBHOOK_URL 未配置，请检查 .env 文件")
        sys.exit(1)

    cmd = sys.argv[1] if len(sys.argv) > 1 else "daily"

    print("╔════════════════════════════════════════════╗")
    print("║   SafePost 定时推送脚本                    ║")
    print("╚════════════════════════════════════════════╝")

    if cmd == "daily":
        await push_daily()
    elif cmd == "weekly":
        await push_weekly()
    elif cmd == "monthly":
        await push_monthly()
    elif cmd == "all":
        results = []
        results.append(await push_daily())
        await asyncio.sleep(1)
        results.append(await push_weekly())
        await asyncio.sleep(1)
        results.append(await push_monthly())
        ok = sum(1 for r in results if r)
        print(f"\n🎯 总计: {ok}/{len(results)} 发送成功")
    else:
        print(f"用法: python3 {sys.argv[0]} [daily|weekly|monthly|all]")
        sys.exit(1)

    print("\n✅ 完成！请检查飞书群消息。\n")


# Python 3.6+ 兼容 asyncio.run
if __name__ == "__main__":
    import asyncio
    try:
        asyncio.run(main())
    except AttributeError:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
