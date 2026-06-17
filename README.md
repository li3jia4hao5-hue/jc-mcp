# ⚽ World Cup 2026 Prediction System | 世界杯AI预测系统

> 12步预测流程 · 20层技能 · 20+场实战迭代 · 18科学 + 1玄学 + 1赔率

实时世界杯预测系统 — 正在2026美加墨世界杯实战中使用。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![MCP Server](https://img.shields.io/badge/MCP-Server-blue)
![World Cup 2026](https://img.shields.io/badge/World_Cup-2026-gold)

---

## 🎯 12步 · 20层

AI预测 → 球员评分 → 战术相克 → 主场优势 → 天气海拔 → 定位球 → 裁判 → 轮换心理 → Kelly数学 → 防守体系 → 周易玄学 → 赔率认知 → 投注建议

**18层科学 + 1层玄学 + 1层赔率认知**

---

## 🔧 实战迭代

| 日期 | 教训 | 改进 |
|------|------|------|
| 6/14 | 瑞士1:1→碾压≠屠杀 | 屠杀分级规则 |
| 6/15 | 瑞典5:1→预选赛数据不可靠 | 弱联赛×0.5 |
| 6/15 | 玄学主导翻车 | ±70→±35 |
| 6/16 | 四场全平→全灭 | 删反共识/防投墙 |
| 6/17 | 方向全对比分偏小 | 信任方向向上偏 |

---

## 🚀 一键部署

```bash
git clone git@github.com:li3jia4hao5-hue/jc-mcp.git
cd jc-mcp && npm install && npm run build
claude mcp add jc-mcp -- node "$(pwd)/dist/index.js"
claude mcp add wc26 -- npx -y wc26-mcp
claude mcp add onside-football -- npx -y onside-football-mcp
pip install git+https://github.com/machina-sports/sports-skills.git
cp CLAUDE.md /你的项目/CLAUDE.md
```

说 `深度预测 <对阵>` 即触发全流程。

---

## 📦 文件

| 文件 | 内容 |
|------|------|
| `CLAUDE.md` | 完整预测系统(复制即用) |
| `src/index.ts` | jc-mcp 竞彩MCP服务器 |
| `PLAYER-RATING.md` | 球员评分系统 |
| `BETTING-PHILOSOPHY.md` | 赔率认知 |

## ⚠️

本工具不构成投注建议。竞彩请去线下实体店。

## 📄

MIT
