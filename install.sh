#!/bin/bash
# ⚽ World Cup 2026 Prediction Suite — 一键安装
set -e

echo "========================================="
echo " ⚽ World Cup 2026 Prediction Suite"
echo "   6层数据交叉验证 · 一键部署"
echo "========================================="
echo ""

# ── jc-mcp (本仓库) ──
echo "📦 [1/4] 安装 jc-mcp (竞彩赔率)..."
cd "$(dirname "$0")"
npm install --silent
npm run build
echo "   ✅ jc-mcp 编译完成"

# ── MCP servers ──
echo ""
echo "📦 [2/4] 注册 wc26-mcp..."
claude mcp add wc26 -- npx -y wc26-mcp 2>/dev/null || echo "   ⚠️ 请手动: claude mcp add wc26 -- npx -y wc26-mcp"

echo "📦 [3/4] 注册 onside-football-mcp..."
claude mcp add onside-football -- npx -y onside-football-mcp 2>/dev/null || echo "   ⚠️ 请手动: claude mcp add onside-football -- npx -y onside-football-mcp"

# ── sports-skills ──
echo ""
echo "📦 [4/4] 安装 sports-skills..."
pip install git+https://github.com/machina-sports/sports-skills.git 2>/dev/null || echo "   ⚠️ 请手动: pip install git+https://github.com/machina-sports/sports-skills.git"

# ── Register jc-mcp ──
echo ""
echo "🔧 注册 jc-mcp..."
claude mcp add jc-mcp -- node "$(pwd)/dist/index.js" 2>/dev/null || echo "   ⚠️ 请手动: claude mcp add jc-mcp -- node $(pwd)/dist/index.js"

echo ""
echo "========================================="
echo " ✅ 安装完成！重新打开 Claude Code"
echo "    试试问: '明天揭幕战预测一下？'"
echo "========================================="
