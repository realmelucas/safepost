#!/bin/bash
# ============================================================
# SafePost 飞书群机器人 Webhook 通路测试脚本
# ============================================================
# 用途：验证飞书消息推送通路是否畅通
# 测试内容：SOS报警、体征异常、失联报警、安全日报
# ============================================================

WEBHOOK_URL="https://open.feishu.cn/open-apis/bot/v2/hook/18efb77b-36f2-423c-b343-e53e89831395"

# --------------- 颜色输出 ---------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[FAIL]${NC}  $1"; }

# --------------- 通用发送函数 ---------------
send_card() {
  local title="$1"
  local card_json="$2"
  
  log_info "发送: $title"
  
  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "$card_json")
  
  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "200" ]; then
    local feishu_code
    feishu_code=$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin).get('code',-1))" 2>/dev/null)
    if [ "$feishu_code" = "0" ]; then
      log_ok "$title → 发送成功 (HTTP $http_code, code=$feishu_code)"
      return 0
    else
      log_error "$title → 飞书返回错误 (HTTP $http_code, code=$feishu_code)"
      echo "$body" | python3 -m json.tool 2>/dev/null
      return 1
    fi
  else
    log_error "$title → HTTP请求失败 (HTTP $http_code)"
    echo "$body"
    return 1
  fi
}

# --------------- 测试1: SOS紧急求救 ---------------
test_sos() {
  local card
  card=$(cat <<'CARDJSON'
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "🚨 SOS 紧急求救"
      },
      "template": "red"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**⚠️ 工人触发了SOS紧急求救，请立即响应！**\n\n---\n**工人姓名**：张三\n**工号**：SF-2024-0018\n**所在位置**：3号岗亭 · 车厢B区\n**触发时间**：2025-01-15 14:32:18\n**手环MAC**：AA:BB:CC:DD:EE:01\n**网关RSSI**：-58 dBm\n**持续时长**：0秒\n---\n📟 请立即前往现场确认人员状态"
        }
      },
      {
        "tag": "action",
        "actions": [
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "✅ 已确认处理"
            },
            "type": "primary"
          },
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "❌ 误报"
            },
            "type": "danger"
          },
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "📞 拨打联系人"
            },
            "type": "default"
          }
        ]
      },
      {
        "tag": "hr"
      },
      {
        "tag": "note",
        "elements": [
          {
            "tag": "plain_text",
            "content": "🤖 SafePost 智能卡安全监护系统 · 自动报警"
          }
        ]
      }
    ]
  }
}
CARDJSON
)
  send_card "SOS紧急求救" "$card"
}

# --------------- 测试2: 体征异常 ---------------
test_vital_abnormal() {
  local card
  card=$(cat <<'CARDJSON'
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "🫀 体征异常告警"
      },
      "template": "orange"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**工人体征数据出现异常，请关注！**\n\n---\n**工人姓名**：王五\n**工号**：SF-2024-0023\n**所在位置**：5号岗亭 · 车厢C区\n**触发时间**：2025-01-15 14:28:45\n\n| 指标 | 实测值 | 正常范围 | 状态 |\n| --- | --- | --- | --- |\n| 🌡️ 体温 | **39.5°C** | 36.0-37.3°C | 🔴 偏高 |\n| ❤️ 心率 | **128 bpm** | 60-100 bpm | 🔴 偏高 |\n| 💓 血氧 | 96% | 95-100% | 🟢 正常 |\n| 💪 血压 | 145/92 | 90-140/60-90 | 🟡 偏高 |\n\n---\n📟 建议立即联系该工人，确认身体状况"
        }
      },
      {
        "tag": "action",
        "actions": [
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "🏥 安排就医"
            },
            "type": "primary"
          },
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "📞 联系工人"
            },
            "type": "default"
          },
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "👀 持续观察"
            },
            "type": "default"
          }
        ]
      },
      {
        "tag": "hr"
      },
      {
        "tag": "note",
        "elements": [
          {
            "tag": "plain_text",
            "content": "🤖 SafePost 智能卡安全监护系统 · 自动报警"
          }
        ]
      }
    ]
  }
}
CARDJSON
)
  send_card "体征异常告警" "$card"
}

# --------------- 测试3: 设备失联 ---------------
test_lost() {
  local card
  card=$(cat <<'CARDJSON'
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "📡 设备失联告警"
      },
      "template": "yellow"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**工人设备信号中断，可能发生意外！**\n\n---\n**工人姓名**：赵六\n**工号**：SF-2024-0031\n**最后位置**：7号岗亭 · 车厢D区\n**最后信号**：2025-01-15 14:25:03\n**中断时长**：已超 **60秒**\n**手环MAC**：AA:BB:CC:DD:EE:03\n---\n📟 可能原因：\n- 工人进入信号盲区\n- 手环电量耗尽\n- 手环被意外摘下\n- 人员发生意外失去行动能力\n\n⚠️ **请立即派人前往最后已知位置排查！**"
        }
      },
      {
        "tag": "action",
        "actions": [
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "🔍 派人排查"
            },
            "type": "primary"
          },
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "📞 联系工人"
            },
            "type": "default"
          },
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "📹 查看监控"
            },
            "type": "default"
          }
        ]
      },
      {
        "tag": "hr"
      },
      {
        "tag": "note",
        "elements": [
          {
            "tag": "plain_text",
            "content": "🤖 SafePost 智能卡安全监护系统 · 自动报警"
          }
        ]
      }
    ]
  }
}
CARDJSON
)
  send_card "设备失联告警" "$card"
}

# --------------- 测试4: 简单文本消息（轻量测试） ---------------
test_text() {
  local text_json
  text_json=$(cat <<JSON
{
  "msg_type": "text",
  "content": {
    "text": "🔔 SafePost 通路测试消息\n\n这是一条来自 SafePost 智能卡安全监护系统的测试消息。\n如果收到此消息，说明飞书群机器人 Webhook 通路正常。\n\n---\n发送时间：$(date '+%Y-%m-%d %H:%M:%S')"
  }
}
JSON
)
  send_card "文本通路测试" "$text_json"
}

# --------------- 测试5: 安全日报 ---------------
test_daily_report() {
  local today
  today=$(date '+%Y年%m月%d日')
  local card
  card=$(cat <<CARDJSON
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": {
        "tag": "plain_text",
        "content": "📊 SafePost 安全日报"
      },
      "template": "blue"
    },
    "elements": [
      {
        "tag": "div",
        "text": {
          "tag": "lark_md",
          "content": "**${today} · 物流转运中心安全监护日报**\n\n---\n**📋 在岗概况**\n\n| 指标 | 数值 |\n| --- | --- |\n| 👷 应到工人 | 32人 |\n| ✅ 在岗正常 | 30人 |\n| ⚠️ 体征异常 | 1人（王五·体温偏高） |\n| 🔴 触发报警 | 1次（SOS·已处置） |\n| 📡 设备离线 | 1人（赵六·已恢复） |\n\n---\n**📈 今日报警统计**\n\n| 类型 | 次数 | 处置率 |\n| --- | --- | --- |\n| 🚨 SOS | 1 | 100% |\n| 📡 失联 | 1 | 100% |\n| ❓ 无响应 | 0 | - |\n| 🫀 体征异常 | 1 | 100% |\n\n---\n**⏱️ 平均响应时间**：2分18秒 ✅ 达标（目标 < 3分钟）\n\n**📟 重点关注**\n- 王五体温持续偏高，建议安排休息观察\n- 3号岗亭车厢B区信号较弱，建议增设网关"
        }
      },
      {
        "tag": "action",
        "actions": [
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "📋 查看详细日报"
            },
            "type": "primary",
            "url": "https://realmelucas.github.io/safepost/"
          },
          {
            "tag": "button",
            "text": {
              "tag": "plain_text",
              "content": "⚙️ 系统配置"
            },
            "type": "default",
            "url": "https://realmelucas.github.io/safepost/"
          }
        ]
      },
      {
        "tag": "hr"
      },
      {
        "tag": "note",
        "elements": [
          {
            "tag": "plain_text",
            "content": "🤖 SafePost 智能卡安全监护系统 · 每日 ${today} 08:00 自动推送"
          }
        ]
      }
    ]
  }
}
CARDJSON
)
  # 替换变量
  card=$(echo "$card" | sed "s/\${today}/$today/g")
  send_card "安全日报" "$card"
}

# ============================================================
# 主流程
# ============================================================

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     🛡️  SafePost 飞书 Webhook 通路测试              ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  Webhook: 18efb77b-36f2-423c-b343-e53e89831395     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0

# 测试顺序执行
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 1/5: 文本通路测试（最基础）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_text && ((PASS++)) || ((FAIL++))

sleep 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 2/5: SOS 紧急求救卡片"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_sos && ((PASS++)) || ((FAIL++))

sleep 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 3/5: 体征异常告警卡片"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_vital_abnormal && ((PASS++)) || ((FAIL++))

sleep 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 4/5: 设备失联告警卡片"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_lost && ((PASS++)) || ((FAIL++))

sleep 1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  测试 5/5: 安全日报卡片"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_daily_report && ((PASS++)) || ((FAIL++))

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              测试结果汇总                            ║"
echo "╠══════════════════════════════════════════════════════╣"
printf "║  通过: %d  |  失败: %d                                  ║\n" $PASS $FAIL
echo "╚══════════════════════════════════════════════════════╝"
echo ""

if [ "$FAIL" -eq 0 ]; then
  log_ok "🎉 所有飞书通路测试通过！请检查飞书群消息。"
  exit 0
else
  log_warn "部分测试失败，请检查飞书群机器人的 Webhook 地址和权限配置。"
  exit 1
fi
