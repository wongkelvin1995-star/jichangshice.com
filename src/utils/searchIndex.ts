/**
 * 站内搜索索引：构建时从真实内容自动生成，输出到 /search-index.json。
 * 新增文章、机场资料、套餐、FAQ 后重新构建即可自动进入索引，无需维护关键词表。
 */
import { getCollection, render, type CollectionEntry } from "astro:content";
import { CATEGORIES } from "@/data/categories";
import { getProviders, getPlans, priceLabel, trafficLabel } from "./plans";
import { getPublishedPosts, postUrl } from "./posts";
import { getVerifiedRuns, runsOf } from "./testRuns";
import { getTestRecords, recordsOf } from "./testRecords";

export type SearchSection = {
  /** 小节标题（空字符串表示正文开头） */
  h: string;
  /** 锚点 id（空字符串表示页面顶部） */
  a: string;
  /** 小节纯文本 */
  x: string;
};

export type SearchEntry = {
  /** 标题 */
  t: string;
  /** 页面路径，以 / 开头 */
  u: string;
  /** 所属分类 */
  c: string;
  /** 摘要 */
  d: string;
  /** 名称、别名、英文名、拼音、套餐名等（只取自真实数据） */
  k: string[];
  /** 正文小节 */
  s: SearchSection[];
};

/** Markdown → 纯文本（只用于检索和摘要） */
export function mdToText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^>\s*\[![^\]]+\]\s*/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\|?[\s:|-]+\|?$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type Heading = { depth: number; slug: string; text: string };

/** 按 H2–H4 把 Markdown 切成小节，锚点取渲染后的真实 heading id */
export function splitSections(body: string, headings: Heading[]) {
  const hs = headings.filter(h => h.depth >= 2 && h.depth <= 4);
  const out: SearchSection[] = [];
  let cur: SearchSection = { h: "", a: "", x: "" };
  let buf: string[] = [];
  let hi = 0;
  let inFence = false;
  const flush = () => {
    cur.x = mdToText(buf.join("\n"));
    if (cur.x || cur.h) out.push(cur);
  };
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const m = !inFence && /^(#{2,4})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      flush();
      const h = hs[hi++];
      cur = { h: mdToText(m[2]), a: h?.slug ?? "", x: "" };
      buf = [];
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

async function sectionsOf(
  entry:
    | CollectionEntry<"posts">
    | CollectionEntry<"airports">
    | CollectionEntry<"pages">
) {
  const { headings } = await render(entry);
  return splitSections(entry.body ?? "", headings);
}

const PAGE_ROUTES: Record<string, string> = {
  about: "/about/",
  contact: "/contact/",
  disclosure: "/disclosure/",
  faq: "/faq/",
  privacy: "/privacy/",
  "testing-methodology": "/testing-methodology/",
};

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const entries: SearchEntry[] = [];

  // 教程与测试文章
  for (const p of await getPublishedPosts()) {
    entries.push({
      t: p.data.title,
      u: postUrl(p),
      c: CATEGORIES[p.data.category].name,
      d: p.data.description,
      k: [p.data.shortTitle ?? ""].filter(Boolean),
      s: await sectionsOf(p),
    });
  }

  // 机场资料：名称、别名、英文名、拼音、优惠码、套餐、测评正文
  const providers = await getProviders();
  const plans = await getPlans();
  const analyses = new Map(
    (await getCollection("airports")).map(a => [a.id, a])
  );
  for (const p of providers) {
    const own = plans.filter(x => x.providerId === p.slug);
    const a = analyses.get(p.slug);
    const planText = own
      .map(
        x =>
          `${x.name ?? ""} ${priceLabel(x).main} ${x.billingCycle} ${trafficLabel(x).main}`
      )
      .join("；");
    const sections: SearchSection[] = [];
    if (a) sections.push(...(await sectionsOf(a)));
    if (own.length)
      sections.push({ h: `${p.name}套餐与价格`, a: "plans", x: planText });
    const url = p.hasProfile ? `/airports/${p.slug}/` : "/airports/";
    entries.push({
      t: a ? a.data.title : `${p.name}机场资料：套餐价格与优惠码`,
      u: url,
      c: "机场资料",
      d: a
        ? a.data.description
        : `${p.name}的套餐价格、付款周期、流量与优惠码${p.coupon ? ` ${p.coupon}` : ""}。`,
      k: [
        p.name,
        ...(p.englishName ? [p.englishName] : []),
        ...p.aliases,
        ...p.pinyin,
        ...(p.coupon ? [p.coupon] : []),
        ...own.map(x => x.name ?? "").filter(Boolean),
      ],
      s: sections,
    });
  }

  // 站点页面（含 FAQ 问答）
  for (const pg of await getCollection("pages")) {
    const route = PAGE_ROUTES[pg.id];
    if (!route) continue;
    entries.push({
      t: pg.data.title,
      u: route,
      c: pg.id === "faq" ? "常见问题" : "站点说明",
      d: pg.data.description,
      k: [],
      s: await sectionsOf(pg),
    });
  }

  // 栏目页
  for (const cat of Object.values(CATEGORIES)) {
    entries.push({
      t: cat.title,
      u: `/${cat.slug}/`,
      c: "栏目",
      d: cat.description,
      k: [cat.name],
      s: [{ h: "", a: "", x: cat.intro }],
    });
  }

  // 汇总页（标题与说明取自页面本身的用途，关键词取自真实数据）
  const names = providers.map(p => p.name);
  entries.push(
    {
      t: "机场推荐：编辑精选与选购参考",
      u: "/recommendations/",
      c: "汇总页",
      d: "按编辑顺序整理的机场推荐、预算与用途参考、精选机场优惠码。",
      k: ["机场推荐", ...names.slice(0, 10)],
      s: [],
    },
    {
      t: "机场目录：全部机场品牌资料",
      u: "/airports/",
      c: "汇总页",
      d: `收录 ${providers.length} 个机场品牌的资料、月付起步价与测评入口。`,
      k: ["机场目录", ...names],
      s: [],
    },
    {
      t: "套餐比较：按预算、周期、流量筛选",
      u: "/compare/",
      c: "汇总页",
      d: `${plans.length} 档机场套餐的价格、付款周期与流量比较表。`,
      k: ["套餐比较", "套餐价格"],
      s: [],
    },
    {
      t: "机场优惠码汇总",
      u: "/coupons/",
      c: "汇总页",
      d: `${providers.filter(p => p.coupon).length} 家机场优惠码速查表与使用方法。`,
      k: [
        "优惠码",
        ...providers.filter(p => p.coupon).map(p => `${p.name} ${p.coupon}`),
      ],
      s: [],
    }
  );

  // 机场测试档案：总页 + 每个有记录的品牌（数据来自 src/data/test-records.json）
  const records = await getTestRecords();
  const runs = getVerifiedRuns();
  const tested = providers.filter(
    p => recordsOf(records, p.slug).length || runsOf(runs, p.slug).length
  );
  entries.push({
    t: "机场测试档案：本站测试与公开测速参考",
    u: "/test-records/",
    c: "测试档案",
    d: `本站测试 ${runs.length} 条（已核验）；公开测速参考 ${records.length} 批，逐条注明来源；另有机场网速测试工具。`,
    k: [
      "机场测试",
      "测速记录",
      "测试档案",
      "本站测试",
      "公开测速参考",
      "Speedtest",
      ...tested.map(p => p.name),
    ],
    s: [],
  });
  for (const p of tested) {
    const rs = recordsOf(records, p.slug);
    const own = runsOf(runs, p.slug);
    entries.push({
      t: `${p.name}测速记录`,
      u: `/test-records/${p.slug}/`,
      c: "测试档案",
      d: `${p.name}：本站测试 ${own.length} 条，公开测速参考 ${rs.length} 批。`,
      k: [
        p.name,
        ...p.aliases,
        ...(p.englishName ? [p.englishName] : []),
        "测速",
      ],
      s: rs.map(r => ({
        h: `${r.data.recordedAt}${r.data.window ? ` ${r.data.window}` : ""}`,
        a: r.id,
        x: [
          r.data.sourceName,
          r.data.notes ?? "",
          ...r.data.rows.map(x =>
            [x.region, x.node, x.latency, x.download, x.ai, x.media, x.note]
              .filter(Boolean)
              .join(" ")
          ),
        ].join(" "),
      })),
    });
  }

  // 机场网速测试工具页
  entries.push({
    t: "机场网速测试：在线测速、延迟、满载延迟与网站连通性",
    u: "/speedtest/",
    c: "工具",
    d: "开着代理测出口 IP、空载延迟与抖动、下载和上传速度、满载延迟和 15 个网站的连通性，可生成打码的测速报告图。",
    k: [
      "网速测试",
      "机场测速",
      "机场网速测试",
      "测速",
      "在线测速",
      "节点测速",
      "延迟",
      "下载速度",
      "上传速度",
      "出口 IP",
      "连通性",
      "工具",
    ],
    s: [],
  });

  // 机场工具箱：节点可用性检测（在测试方法页标题下方）
  entries.push({
    t: "机场工具箱：节点可用性检测",
    u: "/testing-methodology/#node-check-title",
    c: "工具",
    d: "粘贴订阅内容或节点地址，在浏览器里检测节点服务器是否有响应和大致延迟。",
    k: [
      "机场工具箱",
      "节点检测",
      "节点可用性",
      "节点延迟",
      "ping",
      "订阅解析",
      "工具",
    ],
    s: [],
  });

  // 个人中心（noindex 页面，但站内搜索可以找到入口）
  entries.push({
    t: "个人中心：收藏、浏览历史与比较清单",
    u: "/user/",
    c: "个人中心",
    d: "查看收藏的机场、浏览历史和比较清单，设置浏览偏好；数据只保存在当前浏览器。",
    k: ["个人中心", "我的收藏", "浏览历史", "比较清单", "偏好设置"],
    s: [],
  });

  return entries;
}
