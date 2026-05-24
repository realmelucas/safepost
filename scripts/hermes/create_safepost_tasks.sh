#!/usr/bin/env bash
set -euo pipefail

ROOT="/Users/luo/Documents/AI兔帮守岗(智能胸卡安全监护系统)"

hermes kanban boards switch safepost

hermes kanban create "ESP32-C3-Pro mini 工牌接线表" \
  --assignee safepostfirmware \
  --workspace "dir:${ROOT}" \
  --idempotency-key "safepost-c3-wiring" \
  --body "基于当前采购清单，输出 ESP32-C3-Pro mini + MPU-6050 + SOS 按键 + 确认按键 + 红黄绿 LED + 震动马达 + TP4056 的第一版接线表。强调不要直接用 GPIO 驱动马达，给出继电器/三极管/MOS 管建议。"

hermes kanban create "MPU-6050 静止检测算法设计" \
  --assignee safepostfirmware \
  --workspace "dir:${ROOT}" \
  --idempotency-key "safepost-mpu6050-stillness" \
  --body "设计工牌端静止检测算法，目标是识别 120 秒长时间静止和 180 秒无响应。输出 Arduino 实现思路、阈值、去抖策略、误报控制和测试方法。"

hermes kanban create "MQTT 报警模拟器" \
  --assignee safepostbackend \
  --workspace "dir:${ROOT}" \
  --idempotency-key "safepost-mqtt-simulator" \
  --body "为 server 目录补一个本地 MQTT 报警模拟器，可以模拟 HEARTBEAT、SOS、OFFLINE、NO_RESPONSE。要求文档说明如何启动 EMQX 和如何验证 API/MQTT 链路。"

hermes kanban create "后台 MVP 演示页完善" \
  --assignee safepostfrontend \
  --workspace "dir:${ROOT}" \
  --idempotency-key "safepost-dashboard-demo" \
  --body "完善 web/dashboard 的 MVP 演示体验，突出车厢盲区、失联发现机制、SOS、无响应、企业微信/飞书通知状态。完成后生成桌面和移动端截图。"

hermes kanban create "真机到货 10 步测试清单" \
  --assignee safepostqa \
  --workspace "dir:${ROOT}" \
  --idempotency-key "safepost-hardware-checklist" \
  --body "输出硬件到货后的 10 步测试清单，覆盖 ESP32-C3 点灯、Wi-Fi、MQTT、SOS、MPU-6050、震动马达、S3 基站、现成声光报警器复用、企业微信/飞书报警、端到端演示。"

hermes kanban --board safepost list
