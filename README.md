# ⚽ World Cup 2026 Prediction Suite

> 6层数据交叉验证 · AI预测 + 竞彩赔率 + 预测市场 + 博彩数学 · 一键部署

世界杯2026 AI预测完整工具链 — 六层数据源同时调用，交叉验证，消除单一来源偏差。

---

## 🎯 核心能力

| 能力 | 工具 | 说明 |
|------|------|------|
| 🏆 **冠军预测** | 蒙特卡洛5000次模拟 | 逐队夺冠概率，逐轮晋级概率 |
| 📊 **单场预测** | AI模型 + 竞彩赔率交叉 | 胜平负概率 + 比分预测 + 冷门预警 |
| 🎰 **实时赔率** | 竞彩官方API | 5种玩法(胜平负/让球/比分/总进球/半全场) |
| 💰 **投注策略** | 凯利公式 + 串关分析 | 自动生成保本+博大奖分区方案 |
| 🏟 **赛程数据** | 48队/16场馆/104场 | 球队档案、历史交锋、伤病追踪 |
| 📈 **预测市场** | Polymarket真金白银 | 与竞彩赔率对比找偏差 |

---

## 🔬 6层数据交叉验证

```
用户提问
  │
  ├─ 🔴 竞彩赔率 (jc-mcp) ──────── 官方法定赔率，投注基准
  ├─ 🟠 AI模型 (onside-football) ──── 蒙特卡洛模拟，胜率拆解
  ├─ 🟡 预测市场 (polymarket) ───── 真金白银，真实概率信号
  ├─ 🟢 基本信息 (wc26) ───────── 球队/赛程/伤病/历史
  ├─ 🔵 博彩数学 (betting) ─────── 凯利公式/串关/找优势
  └─ ⚫ 赛前情报 (WebSearch) ───── 首发/突发伤病/天气
       │
       ▼
  交叉验证结论 + 投注建议
```

---

## 🚀 一键部署

### 前置要求
- Node.js ≥ 18
- Python ≥ 3.10
- Claude Code / Claude Desktop / Cursor

### 安装全部组件

```bash
# 1. 克隆本仓库（竞彩赔率核心）
git clone git@github.com:li3jia4hao5-hue/jc-mcp.git
cd jc-mcp
npm install && npm run build

# 2. 安装AI预测 & 基本信息 MCP
# （npx自动拉取，不需要clone）

# 3. 安装预测市场 & 博彩分析 CLI
pip install git+https://github.com/machina-sports/sports-skills.git

# 4. 注册到 Claude Code（一键）
claude mcp add jc-mcp -- node "$(pwd)/dist/index.js"
claude mcp add wc26 -- npx -y wc26-mcp
claude mcp add onside-football -- npx -y onside-football-mcp
```

---

## 🛠 工具清单

### 🔴 jc-mcp — 竞彩实时赔率（本仓库核心）

| 工具 | 用途 |
|------|------|
| `get_jc_odds` | 当天全部比赛5种玩法赔率 |
| `get_jc_odds_simple` | 胜平负+让球速览 |
| `get_jc_match_odds` | 指定两队深度分析（隐含概率+最佳选项） |

数据来源：中国竞彩网 webapi.sporttery.cn 官方API，实时更新。

### 🟠 onside-football-mcp — AI蒙特卡洛预测

| 工具 | 用途 |
|------|------|
| `get_wc_champion_odds` | 5000次蒙特卡洛夺冠概率 |
| `get_wc_match_prediction` | 任意对阵胜率拆解 |
| `get_wc_upset_watch` | 冷门预警 |
| `get_wc_live_scores` | 实时比分 |

### 🟡 sports-skills — 预测市场 & 博彩分析

| 模块 | 用途 |
|------|------|
| `polymarket` | 真金白银预测市场赔率 |
| `kalshi` | 另一预测市场数据源 |
| `betting` | 凯利公式/找优势/串关分析 |
| `football` | 比赛详情/球队数据/历史战绩 |

### 🟢 wc26-mcp — 赛事基础数据

| 工具 | 用途 |
|------|------|
| `what_to_know_now` | 今日智能简报 |
| `compare_teams` | 两队全方位对比 |
| `get_team_profile` | 球队深度档案 |
| `get_injuries` | 伤病追踪 |
| `get_bracket` | 淘汰赛对阵图 |

---

## 💬 使用示例

在 Claude Code 中直接用自然语言提问：

```
"明天揭幕战墨西哥vs南非，帮我预测一下"
"法国和西班牙谁更可能夺冠？"
"我有100元想投比分，帮我设计一个保本+博大奖的方案"
"分析今天全部世界杯比赛，找出赔率最有价值的"
"英格兰vs克罗地亚，竞彩赔率和AI预测有没有偏差？"
```

AI 会自动调用6层数据交叉验证，给出：
- 📊 三方预测对比表（竞彩/AI/预测市场）
- 💰 投注策略建议（凯利公式计算最优下注比例）
- 🚑 伤病/首发情报
- ⚠️ 冷门风险预警

---

## 📐 竞彩基础知识

### 五种玩法

| 玩法 | 选项数 | 说明 |
|------|:---:|------|
| 胜平负 | 3 | 猜主队胜/平/负，入门首选 |
| 让球胜平负 | 3 | 官方设让球后再猜 |
| 比分 | 31 | 精确猜最终比分 |
| 总进球数 | 8 | 猜总进球 0/1/2/3/4/5/6/7+ |
| 半全场 | 9 | 同时猜上半场+全场 |

### 隐含概率

竞彩返奖率约71%：`P = 0.71 ÷ 赔率`

### 串关返奖率

| 串关 | 返奖率 |
|:---:|:---:|
| 2串1 | ~79% |
| 3串1 | ~71% |
| 4串1 | ~63% |
| 6串1 | ~50% |

---

## 🏗 架构

```
Claude Code / Cursor
  │
  ├─ MCP (stdio JSON-RPC)
  │   ├── jc-mcp ──────► webapi.sporttery.cn      (竞彩赔率)
  │   ├── wc26-mcp ─────► 内置数据                 (赛事信息)
  │   └── onside-football ► onsidearena.com/api/v1 (AI预测)
  │
  ├─ Bash CLI
  │   └── sports-skills ► ESPN/Polymarket/Kalshi  (预测市场)
  │
  └─ WebSearch ────────► 实时新闻/首发/伤病
```

---

## ⚠️ 理性购彩

- 🏪 竞彩唯一合法渠道：**线下中国体育彩票实体店**
- 🔞 未满18周岁不得购买
- 📌 固定奖金制：出票即锁定
- ⏱️ 淘汰赛只计90分钟+伤停补时
- 💰 中奖超1万元：20%个税
- 🧠 **本工具提供数据和分析，不构成投注建议。请理性购彩，量力而行。**

---

## 📄 License

MIT — 2026
