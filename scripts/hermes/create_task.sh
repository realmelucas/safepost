#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/luo/Documents/AI兔帮守岗(智能胸卡安全监护系统)"
BOARD="safepost"

usage() {
  cat <<'EOF'
Usage:
  scripts/hermes/create_task.sh <role> "title" "body"

Roles:
  pm | product       -> safepostpm
  backend           -> safepostbackend
  firmware          -> safepostfirmware
  frontend          -> safepostfrontend
  qa | test         -> safepostqa

Example:
  scripts/hermes/create_task.sh firmware \
    "ESP32-C3 SOS + MPU6050 代码" \
    "输出 Arduino 代码、接线说明、串口测试步骤。验收：SOS 和静止报警均可发布 MQTT。"
EOF
}

if [[ $# -lt 3 ]]; then
  usage
  exit 2
fi

role="$1"
title="$2"
body="$3"

case "$role" in
  pm|product)
    assignee="safepostpm"
    ;;
  backend)
    assignee="safepostbackend"
    ;;
  firmware)
    assignee="safepostfirmware"
    ;;
  frontend)
    assignee="safepostfrontend"
    ;;
  qa|test)
    assignee="safepostqa"
    ;;
  *)
    echo "Unknown role: $role" >&2
    usage
    exit 2
    ;;
esac

hermes kanban --board "$BOARD" create "$title" \
  --assignee "$assignee" \
  --workspace "dir:${ROOT}" \
  --body "$body"

echo
echo "Created task for ${assignee}."
echo "Gateway dispatcher will pick it up automatically if Hermes gateway is running."
