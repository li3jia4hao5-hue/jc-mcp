# ⚽ World Cup 2026 Prediction — 自动调用配置

将此文件内容追加到你的项目 CLAUDE.md 中，AI会自动启用6层预测体系。

---

## 世界杯预测体系 (自动调用 — 6层数据交叉验证)

当用户问世界杯、足球比赛、比分预测、投注策略、赔率分析等足球问题时，按需调用以下数据源：

### 🔴 第一层: 竞彩官方赔率 — jc-mcp (投注决策基准)
- `get_jc_odds` — 当天全部比赛5种玩法赔率(胜平负/让球/比分/总进球/半全场)
- `get_jc_odds_simple` — 赔率速览(仅胜平负+让球)
- `get_jc_match_odds` — 指定两队深度分析(隐含概率+最佳赔率)
- 数据源: webapi.sporttery.cn 官方API 实时更新
- 隐含概率: P = 0.71 ÷ 赔率

### 🟠 第二层: AI预测模型 — onside-football-mcp
- `get_wc_match_prediction` — 单场胜率拆解(蒙特卡洛模型)
- `get_wc_champion_odds` — 冠军概率(5000次模拟)
- `get_wc_upset_watch` — 冷门预警
- `get_wc_live_scores` — 实时比分

### 🟡 第三层: 预测市场 — sports-skills polymarket/kalshi (真金白银)
- `PYTHONIOENCODING=utf-8 sports-skills polymarket get_todays_events --sport=fifwc` — 当天所有世界杯市场
- `sports-skills polymarket search_markets --query="<队名>"` — 搜特定比赛市场

### 🟢 第四层: 基本面信息 — wc26-mcp
- `what_to_know_now` — 今日简报(每次必调)
- `compare_teams` / `get_team_profile` — 球队对比
- `get_historical_matchups` — 历史交锋
- `get_injuries` — 伤病追踪

### 🔵 第五层: 博彩分析工具 — sports-skills betting (投注数学)
- `sports-skills betting kelly_criterion --fair_prob=<P> --market_prob=<P>` — 凯利公式下注比例
- `sports-skills betting find_edge --fair_prob=<P> --market_prob=<P>` — 寻找赔率偏差
- `sports-skills betting parlay_analysis --legs="<N>" --parlay_odds=<赔率> --odds_format="decimal"` — 串关数学分析

### ⚫ 第六层: 赛前情报 — WebSearch (实时)
- 搜索: "<队名> 首发 伤病 最新消息" 获取临场变阵/突发伤情
- 赛前1小时必搜首发名单

---

### 回答规则 (按问题类型)

**投注/赔率类** → 以jc-mcp竞彩赔率为准
```
① jc-mcp 竞彩赔率 (基准)
② sports-skills polymarket 预测市场赔率 (真实资金博弈)
③ sports-skills betting kelly_criterion/find_edge (数学验证)
④ wc26 + onside-football 作辅助参考
```

**比分预测类** →
```
① onside-football AI预测 + jc-mcp比分赔率 交叉验证
② sports-skills betting parlay_analysis 验证串关可行性
③ WebSearch 搜最新伤病/首发
```

**赛程/数据类** →
```
① wc26 基本信息
② sports-skills football 深度数据
```

**投注策略类** (如"100元怎么投") →
```
① jc-mcp 拉所有比赛5种玩法赔率
② sports-skills betting 凯利公式+串关分析
③ 给出保本区/博大奖区分区方案
④ 表格展示期望收益
```

### 常用命令速查
```bash
# 预测市场
PYTHONIOENCODING=utf-8 sports-skills polymarket get_todays_events --sport=fifwc
sports-skills polymarket search_markets --query="World Cup champion"

# 博彩数学
sports-skills betting kelly_criterion --fair_prob=0.40 --market_prob=0.30
sports-skills betting parlay_analysis --legs="3" --parlay_odds=133 --odds_format="decimal"

# 深度数据
sports-skills football get_season_schedule --season_id=world-cup-2026
```
