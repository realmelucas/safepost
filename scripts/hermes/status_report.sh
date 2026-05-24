#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/luo/Documents/AI兔帮守岗(智能胸卡安全监护系统)"
BOARD="safepost"
TARGET="${HERMES_FEISHU_TARGET:-feishu}"
SEND=0

if [[ "${1:-}" == "--send" ]]; then
  SEND=1
fi

cd "$ROOT"

timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
kanban_list="$(hermes kanban --board "$BOARD" list)"
git_status="$(git status --short)"
if [[ -z "$git_status" ]]; then
  git_status="工作区干净"
fi

report="$(cat <<EOF
SafePost Agent 工作状态
时间：${timestamp}

当前看板：
${kanban_list}

角色分工：
- 产品 Agent：safepostpm，负责内部方案、PRD、试点标准、汇报材料。
- 后端 Agent：safepostbackend，负责 NestJS、PostgreSQL、MQTT、通知、部署。
- 固件 Agent：safepostfirmware，负责 ESP32、MPU-6050、SOS、震动马达。
- 前端 Agent：safepostfrontend，负责 React 后台、演示页、截图验证。
- 测试 Agent：safepostqa，负责真机测试、端到端验证、验收清单。

Git 工作区：
${git_status}

下一步：
1. 审核 Agent 已生成的代码和文档。
2. 确认可保留后再提交。
3. 硬件到货后优先跑通 SOS、静止检测、MQTT、现场声光报警器联动。
EOF
)"

if [[ "$SEND" -eq 1 ]]; then
  printf '%s\n' "$report" | hermes send --to "$TARGET" --file -
else
  printf '%s\n' "$report"
fi
