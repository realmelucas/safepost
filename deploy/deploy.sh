#!/bin/bash
# ============================================================
# SafeGuard 爱兔帮守岗系统 - 一键部署脚本
# ============================================================
# 用法:
#   ./deploy.sh <服务器IP> [--skip-build]
#
# 示例:
#   ./deploy.sh 123.456.789.0
#   ./deploy.sh your-domain.com --skip-build
# ============================================================
set -e

# ── 配置 ──────────────────────────────────────
DEPLOY_DIR="/opt/safeguard-web"
SERVER="${1:-}"
SKIP_BUILD=false

if [ "$2" = "--skip-build" ]; then
  SKIP_BUILD=true
fi

if [ -z "$SERVER" ]; then
  echo "用法: ./deploy.sh <服务器IP或域名> [--skip-build]"
  echo "示例: ./deploy.sh 123.456.789.0"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   🛡️  SafeGuard 爱兔帮守岗系统 - 部署工具  ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "  目标服务器: $SERVER"
echo "  部署目录:   $DEPLOY_DIR"
echo ""

# ── 1. 构建前端 ──────────────────────────────
if [ "$SKIP_BUILD" = false ]; then
  echo "━━━ [1/5] 构建前端 ━━━"
  cd "$PROJECT_DIR"
  echo "  安装依赖..."
  npm ci --silent 2>/dev/null || npm install
  echo "  编译 TypeScript + Vite 构建..."
  npm run build
  echo "  ✅ 构建完成"
else
  echo "━━━ [1/5] 构建前端 (已跳过) ━━━"
fi

# ── 2. 上传文件到服务器 ──────────────────────
echo ""
echo "━━━ [2/5] 上传文件到服务器 ━━━"

echo "  上传前端构建产物..."
rsync -avz --delete "$PROJECT_DIR/dist/" "root@${SERVER}:${DEPLOY_DIR}/dist/"

echo "  上传后端服务..."
rsync -avz --delete --exclude='__pycache__' --exclude='venv' \
  "$PROJECT_DIR/server/" "root@${SERVER}:${DEPLOY_DIR}/server/"

echo "  ✅ 文件上传完成"

# ── 3. 配置 Nginx ────────────────────────────
echo ""
echo "━━━ [3/5] 配置 Nginx ━━━"

# 先复制 nginx 配置到服务器临时目录
scp "$PROJECT_DIR/deploy/nginx.conf" "root@${SERVER}:/tmp/safeguard-nginx.conf"

ssh "root@${SERVER}" bash <<'REMOTE_NGINX'
  set -e

  # 安装 nginx (如果未安装)
  if ! command -v nginx &>/dev/null; then
    echo "  安装 Nginx..."
    apt-get update -qq && apt-get install -y nginx
  fi

  # 部署配置
  cp /tmp/safeguard-nginx.conf /etc/nginx/sites-available/safeguard

  # 如果存在 default 配置则移除
  rm -f /etc/nginx/sites-enabled/default

  # 启用 safeguard 配置
  ln -sf /etc/nginx/sites-available/safeguard /etc/nginx/sites-enabled/safeguard

  # 测试配置
  nginx -t

  # 重载
  systemctl reload nginx

  echo "  ✅ Nginx 配置完成"
REMOTE_NGINX

# ── 4. 配置 Python 后端 ──────────────────────
echo ""
echo "━━━ [4/5] 配置后端服务 ━━━"

ssh "root@${SERVER}" bash <<'REMOTE_BACKEND'
  set -e

  DEPLOY_DIR="/opt/safeguard-web"

  # 安装 Python 3 和 venv (如果未安装)
  if ! command -v python3 &>/dev/null; then
    echo "  安装 Python 3..."
    apt-get update -qq && apt-get install -y python3 python3-pip python3-venv
  fi

  cd "$DEPLOY_DIR/server"

  # 创建虚拟环境
  if [ ! -d "venv" ]; then
    python3 -m venv venv
  fi

  # 安装依赖
  ./venv/bin/pip install -r requirements.txt --quiet

  echo "  ✅ Python 环境配置完成"
REMOTE_BACKEND

# 复制 systemd 服务文件
scp "$PROJECT_DIR/deploy/safeguard-api.service" "root@${SERVER}:/etc/systemd/system/"

ssh "root@${SERVER}" bash <<'REMOTE_SERVICE'
  set -e

  systemctl daemon-reload
  systemctl enable safeguard-api
  systemctl restart safeguard-api

  echo "  ✅ 后端服务已启动"
REMOTE_SERVICE

# ── 5. 配置定时任务 ──────────────────────────
echo ""
echo "━━━ [5/5] 配置定时推送 ━━━"

ssh "root@${SERVER}" bash <<'REMOTE_CRON'
  set -e

  DEPLOY_DIR="/opt/safeguard-web"

  # 添加定时任务（避免重复添加）
  CRON_FILE="$DEPLOY_DIR/server/crontab.txt"
  if [ -f "$CRON_FILE" ]; then
    # 先移除旧的 safeguard 相关任务
    crontab -l 2>/dev/null | grep -v "safeguard" | crontab - || true
    # 追加新任务
    (crontab -l 2>/dev/null; cat "$CRON_FILE") | crontab -
    echo "  ✅ 定时任务已配置"
  else
    echo "  ⚠️  crontab.txt 不存在，跳过定时任务配置"
  fi
REMOTE_CRON

# ── 完成 ──────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   🎉 部署完成！                            ║"
echo "╠════════════════════════════════════════════╣"
echo "║                                            ║"
echo "║   官网首页:   http://${SERVER}/             ║"
echo "║   管理后台:   http://${SERVER}/#/app/dashboard ║"
echo "║   健康检查:   http://${SERVER}/health       ║"
echo "║                                            ║"
echo "║   后端状态:   ssh root@${SERVER}            ║"
echo "║              systemctl status safeguard-api ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo ""
