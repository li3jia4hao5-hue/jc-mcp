import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// ─── Constants ───────────────────────────────────────────
const API_BASE = "https://webapi.sporttery.cn/gateway/jc/football/";
const ALL_POOL_CODES = "hhad,had,crs,ttg,hafu";

// ─── Types ───────────────────────────────────────────────
interface OddsEntry {
  h: string; d: string; a: string;
  goalLine?: string;
  updateDate?: string; updateTime?: string;
  poolCode?: string;
}

interface CrsOdds {
  [score: string]: string;  // s01s02 -> "28.00"
}

interface TtgOdds {
  s0: string; s1: string; s2: string; s3: string;
  s4: string; s5: string; s6: string; s7: string;
}

interface HafuOdds {
  hh: string; hd: string; ha: string;
  dh: string; dd: string; da: string;
  ah: string; ad: string; aa: string;
}

interface MatchInfo {
  matchId: number;
  matchNumStr: string;
  matchNum: number;
  leagueAbbName: string;
  leagueAllName: string;
  homeTeamAbbName: string;
  awayTeamAbbName: string;
  matchDate: string;
  matchTime: string;
  matchStatus: string;
  had: OddsEntry | null;
  hhad: OddsEntry | null;
  crs: CrsOdds | null;
  ttg: TtgOdds | null;
  hafu: HafuOdds | null;
  oddsUpdateTime: string;
}

// ─── Helper: fetch odds ──────────────────────────────────
async function fetchOdds(): Promise<any> {
  const url = `${API_BASE}getMatchCalculatorV1.qry?poolCode=${ALL_POOL_CODES}&channel=c`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "jc-mcp/1.0" },
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data: any = await resp.json();
  if (!data.success || data.errorCode !== "0") {
    throw new Error(data.errorMessage || "API error");
  }
  return data.value;
}

// ─── Helper: format odds ─────────────────────────────────
function formatMatch(m: any): MatchInfo {
  const oddsTime =
    m.had?.updateTime || m.hhad?.updateTime ||
    m.ttg?.updateTime || m.crs?.updateTime || m.hafu?.updateTime || "?";

  return {
    matchId: m.matchId,
    matchNumStr: m.matchNumStr,
    matchNum: m.matchNum,
    leagueAbbName: m.leagueAbbName,
    leagueAllName: m.leagueAllName,
    homeTeamAbbName: m.homeTeamAbbName,
    awayTeamAbbName: m.awayTeamAbbName,
    matchDate: m.matchDate,
    matchTime: m.matchTime,
    matchStatus: m.matchStatus,
    had: m.had && Object.keys(m.had).length > 0 ? m.had : null,
    hhad: m.hhad && Object.keys(m.hhad).length > 0 ? m.hhad : null,
    crs: m.crs && Object.keys(m.crs).length > 0 ? m.crs : null,
    ttg: m.ttg && Object.keys(m.ttg).length > 0 ? m.ttg : null,
    hafu: m.hafu && Object.keys(m.hafu).length > 0 ? m.hafu : null,
    oddsUpdateTime: oddsTime,
  };
}

function formatOddsText(matches: MatchInfo[], filterDesc: string): string {
  if (matches.length === 0) return `## 竞彩实时赔率 (${filterDesc})\n\n暂无匹配的比赛数据。`;

  let out = `## 🎰 竞彩实时赔率 (${filterDesc})\n`;
  out += `> 共 ${matches.length} 场比赛 | 数据来源: sporttery.cn | 更新: ${matches[0]?.oddsUpdateTime || "实时"}\n\n`;

  for (const m of matches) {
    out += `### ${m.homeTeamAbbName} vs ${m.awayTeamAbbName}\n`;
    out += `- 🏟 ${m.leagueAllName} | ⏰ ${m.matchDate} ${m.matchTime} | 编号: ${m.matchNumStr} | 状态: ${m.matchStatus}\n`;

    // 胜平负 HAD
    if (m.had) {
      out += `- **胜平负**: 主胜 **${m.had.h}** | 平 **${m.had.d}** | 主负 **${m.had.a}**`;
      if (m.had.updateTime) out += ` (${m.had.updateTime})`;
      out += `\n`;
    }

    // 让球胜平负 HHAD
    if (m.hhad && m.hhad.goalLine) {
      const gl = m.hhad.goalLine;
      const glLabel = Number(gl) < 0 ? `主队让${Math.abs(Number(gl))}球` : `主队受让${gl}球`;
      out += `- **让球胜平负** (${glLabel}): 让胜 **${m.hhad.h}** | 让平 **${m.hhad.d}** | 让负 **${m.hhad.a}**`;
      if (m.hhad.updateTime) out += ` (${m.hhad.updateTime})`;
      out += `\n`;
    }

    // 总进球数 TTG
    if (m.ttg && m.ttg.s0) {
      out += `- **总进球数**: 0球${m.ttg.s0} | 1球${m.ttg.s1} | 2球${m.ttg.s2} | 3球${m.ttg.s3} | 4球${m.ttg.s4} | 5球${m.ttg.s5} | 6球${m.ttg.s6} | 7+球${m.ttg.s7}\n`;
    }

    // 半全场 HAFU (abbreviated)
    if (m.hafu && m.hafu.hh) {
      out += `- **半全场**: 胜胜${m.hafu.hh} | 胜平${m.hafu.hd} | 胜负${m.hafu.ha} | 平胜${m.hafu.dh} | 平平${m.hafu.dd} | 平负${m.hafu.da} | 负胜${m.hafu.ah} | 负平${m.hafu.ad} | 负负${m.hafu.aa}\n`;
    }

    // 比分 CRS (top 10 most likely)
    if (m.crs) {
      const scores = Object.entries(m.crs)
        .filter(([k]) => k.startsWith("s") && !k.endsWith("f") && k.length === 6)
        .map(([k, v]) => {
          const h = k.substring(1, 3);
          const a = k.substring(4, 6);
          return { score: `${parseInt(h)}:${parseInt(a)}`, odds: v as string };
        })
        .filter(s => s.odds && s.odds !== "-1")
        .sort((a, b) => parseFloat(a.odds) - parseFloat(b.odds))
        .slice(0, 8);

      const scoreStrs = scores.map(s => `${s.score}(${s.odds})`).join(" | ");
      out += `- **比分(低赔前8)**: ${scoreStrs}\n`;
    }

    out += `\n`;
  }

  out += `---\n> ⚠️ 赔率为竞彩固定奖金，出票即锁定。淘汰赛只计90分钟+补时。请理性购彩。\n`;
  out += `> 📍 唯一合法渠道: 线下体彩实体店 | 数据源: webapi.sporttery.cn\n`;
  return out;
}

// ─── Main Server ─────────────────────────────────────────
async function main() {
  const server = new McpServer({
    name: "jc-mcp",
    version: "1.0.0",
    description: "中国体育彩票竞彩足球实时赔率 MCP 服务器",
  });

  // ── Tool: get_jc_odds ──────────────────────────────────
  server.tool(
    "get_jc_odds",
    "获取竞彩足球实时赔率。返回当天所有比赛的全部5种玩法赔率：胜平负(HAD)、让球胜平负(HHAD)、比分(CRS)、总进球数(TTG)、半全场(HAFU)。数据来源: sporttery.cn 官方API。",
    {
      date: z.string().optional().describe("日期 YYYY-MM-DD，默认当天"),
      team: z.string().optional().describe("按队名筛选（模糊匹配，中文简写如'阿根廷'、'葡萄牙'）"),
      league: z.string().optional().describe("按联赛筛选（如'世界杯'、'英超'）"),
      play_type: z.enum(["HAD", "HHAD", "CRS", "TTG", "HAFU", "all"]).optional().default("all")
        .describe("玩法类型: HAD=胜平负, HHAD=让球胜平负, CRS=比分, TTG=总进球数, HAFU=半全场, all=全部"),
    },
    async (params) => {
      try {
        const value = await fetchOdds();
        let matches: MatchInfo[] = [];

        for (const dayData of value.matchInfoList || []) {
          for (const m of dayData.subMatchList || []) {
            matches.push(formatMatch(m));
          }
        }

        // Apply filters
        if (params.date) {
          matches = matches.filter(m => m.matchDate === params.date);
        }
        if (params.team) {
          const q = params.team.toLowerCase();
          matches = matches.filter(m =>
            m.homeTeamAbbName.toLowerCase().includes(q) ||
            m.awayTeamAbbName.toLowerCase().includes(q)
          );
        }
        if (params.league) {
          const q = params.league.toLowerCase();
          matches = matches.filter(m =>
            m.leagueAllName.toLowerCase().includes(q) ||
            m.leagueAbbName.toLowerCase().includes(q)
          );
        }

        // Sort by date+time
        matches.sort((a, b) =>
          (a.matchDate + a.matchTime).localeCompare(b.matchDate + b.matchTime)
        );

        const desc = [
          params.date || "全部日期",
          params.team || "",
          params.league || "",
        ].filter(Boolean).join(" / ") || "全部比赛";

        return {
          content: [{ type: "text", text: formatOddsText(matches, desc) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `❌ 获取赔率失败: ${err.message}\n可能原因: 非销售时段或网络问题。请稍后重试。` }],
          isError: true,
        };
      }
    }
  );

  // ── Tool: get_jc_odds_simple ────────────────────────────
  server.tool(
    "get_jc_odds_simple",
    "快速获取竞彩赔率摘要 — 只返回胜平负+让球胜平负，适合快速扫描。数据来源: sporttery.cn。",
    {
      team: z.string().optional().describe("按队名筛选"),
      league: z.string().optional().describe("按联赛筛选（如输入'世界杯'筛世界杯比赛）"),
      date: z.string().optional().describe("日期 YYYY-MM-DD"),
    },
    async (params) => {
      try {
        const value = await fetchOdds();
        let lines: string[] = [];

        for (const dayData of value.matchInfoList || []) {
          for (const m of dayData.subMatchList || []) {
            const info = formatMatch(m);
            // Apply filters
            if (params.date && info.matchDate !== params.date) continue;
            if (params.team) {
              const q = params.team.toLowerCase();
              if (!info.homeTeamAbbName.toLowerCase().includes(q) &&
                  !info.awayTeamAbbName.toLowerCase().includes(q)) continue;
            }
            if (params.league) {
              const q = params.league.toLowerCase();
              if (!info.leagueAllName.toLowerCase().includes(q) &&
                  !info.leagueAbbName.toLowerCase().includes(q)) continue;
            }

            let line = `⚽ ${info.homeTeamAbbName} vs ${info.awayTeamAbbName} | ${info.leagueAbbName} | ${info.matchDate} ${info.matchTime}`;
            if (info.had) {
              line += ` | 胜平负: ${info.had.h}/${info.had.d}/${info.had.a}`;
            }
            if (info.hhad?.goalLine) {
              const gl = Number(info.hhad.goalLine) < 0 ? `主让${Math.abs(Number(info.hhad.goalLine))}` : `主受${info.hhad.goalLine}`;
              line += ` | 让球(${gl}): ${info.hhad.h}/${info.hhad.d}/${info.hhad.a}`;
            }
            line += ` | ⏱${info.oddsUpdateTime}`;
            lines.push(line);
          }
        }

        if (lines.length === 0) {
          return { content: [{ type: "text", text: "暂无匹配的竞彩赔率数据。" }] };
        }

        return {
          content: [{ type: "text", text: `## 🎰 竞彩赔率速览\n> 共 ${lines.length} 场 | 更新于 ${new Date().toLocaleString("zh-CN")} | 数据: sporttery.cn\n\n${lines.join("\n\n")}\n\n---\n⚠️ 赔率为竞彩固定奖金，出票即锁定。请去线下实体店购彩。` }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `❌ 获取赔率失败: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  // ── Tool: get_jc_match_odds ─────────────────────────────
  server.tool(
    "get_jc_match_odds",
    "针对特定比赛（两队队名）获取详细的赔率对比分析，包括隐含概率、返奖率、最佳赔率选项。适合做投注决策前深入分析。",
    {
      home_team: z.string().describe("主队名称（中文简写，如'墨西哥'、'葡萄牙'）"),
      away_team: z.string().describe("客队名称（中文简写，如'南非'、'尼日利亚'）"),
    },
    async (params) => {
      try {
        const value = await fetchOdds();
        let bestMatch: MatchInfo | null = null;

        for (const dayData of value.matchInfoList || []) {
          for (const m of dayData.subMatchList || []) {
            const info = formatMatch(m);
            const homeMatch = info.homeTeamAbbName.includes(params.home_team) ||
                              params.home_team.includes(info.homeTeamAbbName);
            const awayMatch = info.awayTeamAbbName.includes(params.away_team) ||
                              params.away_team.includes(info.awayTeamAbbName);
            if (homeMatch && awayMatch) {
              bestMatch = info;
              break;
            }
          }
          if (bestMatch) break;
        }

        if (!bestMatch) {
          return {
            content: [{ type: "text", text: `❌ 未找到 "${params.home_team} vs ${params.away_team}" 的竞彩数据。\n请使用中文简写（如'葡萄牙'、'阿根廷'），或先用 get_jc_odds 查看所有比赛。` }],
          };
        }

        const m = bestMatch;
        let out = `## 🎯 竞彩深度分析: ${m.homeTeamAbbName} vs ${m.awayTeamAbbName}\n`;
        out += `> ${m.leagueAllName} | ${m.matchDate} ${m.matchTime} | 编号: ${m.matchNumStr} | 赔率更新: ${m.oddsUpdateTime}\n\n`;

        // HAD analysis
        if (m.had) {
          out += `### 📊 胜平负 (HAD)\n`;
          out += `| 选项 | 赔率 | 隐含概率 |\n|------|------|------|\n`;
          const hProb = (0.71 / parseFloat(m.had.h) * 100).toFixed(1);
          const dProb = (0.71 / parseFloat(m.had.d) * 100).toFixed(1);
          const aProb = (0.71 / parseFloat(m.had.a) * 100).toFixed(1);
          out += `| 主胜(${m.homeTeamAbbName}) | **${m.had.h}** | ${hProb}% |\n`;
          out += `| 平局 | **${m.had.d}** | ${dProb}% |\n`;
          out += `| 主负(${m.awayTeamAbbName}) | **${m.had.a}** | ${aProb}% |\n\n`;
          out += `> 隐含概率 = 71%返奖率 ÷ 赔率，仅供参考\n\n`;
        }

        // HHAD analysis
        if (m.hhad?.goalLine) {
          const gl = Number(m.hhad.goalLine);
          const glLabel = gl < 0 ? `${m.homeTeamAbbName}让${Math.abs(gl)}球` : `${m.homeTeamAbbName}受让${gl}球`;
          out += `### 📊 让球胜平负 (${glLabel})\n`;
          out += `| 选项 | 赔率 |\n|------|------|\n`;
          out += `| 让胜 | **${m.hhad.h}** |\n`;
          out += `| 让平 | **${m.hhad.d}** |\n`;
          out += `| 让负 | **${m.hhad.a}** |\n\n`;
        }

        // Best value picks
        out += `### 💡 最佳赔率选项 (赔率最低=概率最高)\n`;
        const allOdds: { label: string; odds: number; pool: string }[] = [];
        if (m.had) {
          allOdds.push({ label: `主胜`, odds: parseFloat(m.had.h), pool: "胜平负" });
          allOdds.push({ label: `平局`, odds: parseFloat(m.had.d), pool: "胜平负" });
          allOdds.push({ label: `主负`, odds: parseFloat(m.had.a), pool: "胜平负" });
        }
        if (m.hhad?.goalLine) {
          allOdds.push({ label: `让胜`, odds: parseFloat(m.hhad.h), pool: "让球" });
          allOdds.push({ label: `让平`, odds: parseFloat(m.hhad.d), pool: "让球" });
          allOdds.push({ label: `让负`, odds: parseFloat(m.hhad.a), pool: "让球" });
        }
        allOdds.sort((a, b) => a.odds - b.odds);
        for (const o of allOdds.slice(0, 3)) {
          out += `- 🥇 ${o.label}(${o.pool}): **${o.odds}**\n`;
        }

        out += `\n---\n> ⚠️ 以上为竞彩固定奖金，出票即锁定。理性购彩！\n`;
        return { content: [{ type: "text", text: out }] };
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `❌ 获取赔率失败: ${err.message}` }],
          isError: true,
        };
      }
    }
  );

  // ── Start ────────────────────────────────────────────────
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[jc-mcp] 竞彩足球MCP服务器已启动");
}

main().catch((err) => {
  console.error("[jc-mcp] Fatal error:", err);
  process.exit(1);
});
