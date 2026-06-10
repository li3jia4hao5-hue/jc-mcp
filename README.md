# 🎰 jc-mcp — 中国竞彩足球 MCP 服务器

实时获取[中国体育彩票竞彩足球](https://www.sporttery.cn)官方赔率的 MCP 服务器。

支持**全部5种玩法**，专为 **Claude Code / Cursor / Windsurf** 等 AI 编程助手打造。

---

## 📊 数据来源

**中国竞彩网官方 API** (`webapi.sporttery.cn`) — 实时、权威、零延迟、固定奖金制。

---

## 🎮 五种玩法

| 玩法 | 代码 | 选项数 | 说明 |
|------|:---:|:---:|------|
| 胜平负 | HAD | 3 | 猜90分钟主队胜/平/负，入门首选 |
| 让球胜平负 | HHAD | 3 | 官方设让球数（如-1、+2）后再猜 |
| 比分 | CRS | 31 | 精确猜中90分钟最终比分 |
| 总进球数 | TTG | 8 | 猜总进球区间 0/1/2/3/4/5/6/7+ |
| 半全场 | HAFU | 9 | 同时猜上半场+全场结果 |

---

## 🚀 安装

### 前置要求
- Node.js >= 18
- MCP 客户端（Claude Code / Claude Desktop / Cursor 等）

### 步骤 1: 克隆并编译

```bash
git clone https://github.com/li3jia4hao5-hue/jc-mcp.git
cd jc-mcp
npm install
npm run build
```

> 💡 **国内加速**: 如果 GitHub 克隆慢，可用 `git clone git@github.com:li3jia4hao5-hue/jc-mcp.git`（SSH）

### 步骤 2: 注册到 MCP 客户端

**Claude Code:**
```bash
claude mcp add jc-mcp -- node /path/to/jc-mcp/dist/index.js
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "jc-mcp": {
      "command": "node",
      "args": ["/path/to/jc-mcp/dist/index.js"]
    }
  }
}
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "jc-mcp": {
      "command": "node",
      "args": ["/path/to/jc-mcp/dist/index.js"]
    }
  }
}
```

---

## 🛠 三个工具

### `get_jc_odds` — 完整赔率
拉取当天全部比赛的全部5种玩法赔率。

| 参数 | 类型 | 说明 |
|------|------|------|
| `date` | 可选 | 日期 YYYY-MM-DD，默认当天 |
| `team` | 可选 | 按队名模糊筛选，如 `"阿根廷"`、`"葡萄牙"` |
| `league` | 可选 | 按联赛筛选，如 `"世界杯"`、`"英超"` |
| `play_type` | 可选 | `HAD`/`HHAD`/`CRS`/`TTG`/`HAFU`/`all`，默认all |

### `get_jc_odds_simple` — 快速扫描
只返回胜平负 + 让球胜平负，适合快速扫盘。

### `get_jc_match_odds` — 深度分析
指定两队，返回隐含概率 + 返奖率 + 最佳赔率选项。

| 参数 | 类型 | 说明 |
|------|------|------|
| `home_team` | **必填** | 主队中文简写，如 `"墨西哥"` |
| `away_team` | **必填** | 客队中文简写，如 `"南非"` |

---

## 💬 使用示例

在 Claude Code 中直接用自然语言：

```
"查一下今天世界杯的竞彩赔率"
"快速扫一眼明天有哪些比赛"
"深度分析一下英格兰vs克罗地亚，给出投注建议"
"对比竞彩赔率和AI预测，看有没有偏差"
```

---

## 🧠 推荐搭配 — 6层预测体系

单用 jc-mcp 只能看赔率，搭配以下工具形成完整预测链：

| 层 | 工具 | 能力 |
|:---:|------|------|
| 🔴 | **jc-mcp** (本工具) | 竞彩官方赔率 — 投注决策基准 |
| 🟠 | [onside-football-mcp](https://www.npmjs.com/package/onside-football-mcp) | AI蒙特卡洛模型 — 胜率拆解 |
| 🟡 | [sports-skills](https://github.com/machina-sports/sports-skills) | Polymarket预测市场 + 凯利公式 |
| 🟢 | [wc26-mcp](https://github.com/jordanlyall/wc26-mcp) | 赛程/伤病/历史交锋/球队档案 |
| 🔵 | WebSearch | 赛前1小时首发/突发伤病 |
| ⚫ | sports-skills betting | 串关数学分析/凯利准则 |

```bash
# 一键安装全套
claude mcp add jc-mcp -- node /path/to/jc-mcp/dist/index.js
claude mcp add wc26 -- npx -y wc26-mcp
claude mcp add onside-football -- npx -y onside-football-mcp
pip install git+https://github.com/machina-sports/sports-skills.git
```

---

## 📐 隐含概率公式

竞彩返奖率约 **71%**（国内彩票最高）：

```
隐含概率 P = 0.71 ÷ 赔率

例如: 赔率 2.00 → P = 0.71/2.00 = 35.5%
```

---

## 🏗 技术架构

```
Claude Code / Cursor
       │  MCP JSON-RPC (stdio)
       ▼
  ┌─────────────┐
  │  jc-mcp     │  ← TypeScript + @modelcontextprotocol/sdk
  │  index.ts   │
  └──────┬──────┘
         │  HTTPS GET
         ▼
  ┌─────────────────────────┐
  │  webapi.sporttery.cn    │  ← 中国竞彩网官方API
  │  getMatchCalculatorV1   │
  └─────────────────────────┘
```

- **运行时**: Node.js ≥ 18
- **传输**: MCP stdio (JSON-RPC)
- **参数校验**: Zod
- **零外部依赖**（除MCP SDK外）

---

## ⚠️ 重要提醒

- 🏪 竞彩**唯一合法渠道**：线下中国体育彩票实体店
- 🔞 未满18周岁不得购买
- 🧠 理性购彩，量力而行
- 📌 固定奖金制：出票即锁定，不受后续调整影响
- ⏱️ 淘汰赛只计90分钟常规时间+伤停补时（冠军/冠亚军竞猜除外）
- 💰 中奖超1万元需缴20%个人所得税
- 📅 兑奖期限：60个自然日，逾期作废

---

## 📄 License

MIT — 2026
