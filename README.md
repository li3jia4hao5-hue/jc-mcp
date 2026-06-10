# jc-mcp 🎰 中国竞彩足球 MCP 服务器

实时获取[中国体育彩票竞彩足球](https://www.sporttery.cn)官方赔率的 MCP (Model Context Protocol) 服务器。支持全部5种玩法，专为 Claude Code / Cursor / Windsurf 等 AI 编程助手打造。

## 数据来源

**中国竞彩网官方 API** (`webapi.sporttery.cn`) — 实时、权威、零延迟。

## 支持的玩法

| 玩法 | 代码 | 说明 |
|------|------|------|
| 胜平负 | HAD | 猜90分钟主队胜/平/负 |
| 让球胜平负 | HHAD | 官方设定让球数后再猜 |
| 比分 | CRS | 精确猜中90分钟最终比分（31个选项） |
| 总进球数 | TTG | 猜总进球区间（0/1/2/3/4/5/6/7+） |
| 半全场 | HAFU | 同时猜上半场+全场（9种组合） |

## 安装

### 前置要求
- Node.js >= 18
- Claude Code / Claude Desktop / Cursor / 其他 MCP 客户端

### 步骤 1: 克隆并安装

```bash
git clone https://github.com/YOUR_USERNAME/jc-mcp.git
cd jc-mcp
npm install
npm run build
```

### 步骤 2: 配置 MCP 客户端

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

## 工具

### `get_jc_odds`
获取当天所有比赛的全部5种玩法赔率。

**参数:**
- `date` (可选) — 日期 YYYY-MM-DD，默认当天
- `team` (可选) — 按队名模糊筛选，如"阿根廷"
- `league` (可选) — 按联赛筛选，如"世界杯"
- `play_type` (可选) — HAD/HHAD/CRS/TTG/HAFU/all，默认all

### `get_jc_odds_simple`
快速赔率速览 — 只返回胜平负+让球胜平负。

**参数:** `team`, `league`, `date` (均可选)

### `get_jc_match_odds`
针对特定两队的深度赔率分析，包括隐含概率、返奖率、最佳赔率选项。

**参数:**
- `home_team` (必填) — 主队中文简写
- `away_team` (必填) — 客队中文简写

## 使用示例

```
# 查看今天所有世界杯比赛赔率
"帮我查一下今天世界杯的竞彩赔率"

# 深度分析某场比赛
"分析一下墨西哥vs南非的竞彩赔率，给出最佳投注选项"

# 快速扫描
"快速扫一眼今天有哪些比赛可以投"
```

## 隐含概率计算

竞彩返奖率约71%，隐含概率公式:
```
P = 0.71 ÷ 赔率
```

例如赔率2.00 → 隐含概率 = 0.71/2.00 = 35.5%

## ⚠️ 重要提醒

- 竞彩唯一合法渠道：**线下中国体育彩票实体店**
- 未满18周岁不得购买
- 理性购彩，量力而行
- 赔率为固定奖金制，出票即锁定
- 淘汰赛只计90分钟常规时间+伤停补时

## 技术栈

- TypeScript
- @modelcontextprotocol/sdk
- Zod (参数验证)
- 中国竞彩网 webapi.sporttery.cn

## 同类项目

搭配以下 MCP 服务器使用效果更佳:
- [wc26-mcp](https://github.com/jordanlyall/wc26-mcp) — 2026世界杯18个数据工具
- [onside-football-mcp](https://www.npmjs.com/package/onside-football-mcp) — 蒙特卡洛AI预测
- [sports-skills](https://github.com/machina-sports/sports-skills) — 通用体育数据CLI

## License

MIT
