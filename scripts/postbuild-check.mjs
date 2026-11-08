#!/usr/bin/env node
/* eslint-disable no-console -- CLI 脚本需要输出检查结果 */
/**
 * 构建后检查（无额外依赖）：pnpm run check:dist
 * 检查 dist/ 中的：
 *  - 每页唯一 <title>、meta description、恰好一个 <h1>
 *  - canonical 指向正式域名且与页面路径一致
 *  - 站内链接都能找到对应文件（404 检测）、没有 href="#" 假链接
 *  - 推广入口带 rel="sponsored nofollow"，新窗口链接带 noopener
 *  - JSON-LD 可解析
 *  - Sitemap 只含可索引页面，且所有可索引页面都在 Sitemap 中
 *  - robots.txt 指向正确的 Sitemap；没有残留旧域名
 *  - 测试数据口径：首页与测试档案的“速度实测 / 节点在线状态核验 / 公开测速参考”数字一致，
 *    且等于档案表格行数和各品牌页之和；不得再出现“本站测试 N 条”的合并口径
 *  - 站名统一为“机场实测”；“编辑精选 No.n”只用于前几名；品牌头像不得重复品牌首字
 *  - 可横向滚动的表格容器必须可聚焦并有名称；进度条要有名称；图片要有 alt
 *  - 站内链接的 #锚点在目标页面上真实存在；各页面 JSON-LD 的类型与页面内容相符（无评分/评价类）
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
const SITE = "https://jichangshice.com.cn";
// 需要拦截的旧站域名与模板字样保存在私有文件中（不进入公开仓库）
const BLOCK_FILE = new URL("../private-imports/blocked-domains.json", import.meta.url).pathname;
const OLD_DOMAINS = [
  "astro-paper.pages.dev",
  "satnaing",
  ...(existsSync(BLOCK_FILE) ? JSON.parse(readFileSync(BLOCK_FILE, "utf-8")) : []),
];

const errors = [];
const warns = [];
const err = (f, m) => errors.push(`${f}: ${m}`);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "pagefind") continue;
      walk(p, out);
    } else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter(f => f.endsWith(".html"));
const pathOf = f => {
  const r = "/" + relative(DIST, f).split(sep).join("/");
  return r.endsWith("/index.html") ? r.slice(0, -"index.html".length) : r;
};

function resolves(urlPath) {
  const clean = decodeURI(urlPath.split("#")[0].split("?")[0]);
  if (clean === "" || clean === "/") return existsSync(join(DIST, "index.html"));
  const p = join(DIST, clean);
  if (existsSync(p) && statSync(p).isFile()) return true;
  return existsSync(join(p, "index.html"));
}

const titles = new Map();
const descs = new Map();
const crossAnchors = [];
const indexable = new Set();
const textOf = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  const path = pathOf(f);
  const is404 = path === "/404.html" || path === "/404/";
  const noindex = /<meta name="robots" content="noindex/.test(html);

  const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) ?? [])[1];
  if (!title) err(path, "缺少 <title>");
  if (!desc) err(path, "缺少 meta description");
  else if (!noindex) {
    // 只提示、不拦截构建：必应的 SEO 建议会把过短的描述列为“描述太短”，过长则会在搜索结果里被截断。
    const descLen = [...desc.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, "x")].length;
    if (descLen < 120 || descLen > 160)
      warns.push(`${path}: description ${descLen} 字符，建议 120–160 字`);
  }
  if (!noindex) {
    if (titles.has(title)) err(path, `title 与 ${titles.get(title)} 重复`);
    titles.set(title, path);
    if (descs.has(desc)) err(path, `description 与 ${descs.get(desc)} 重复`);
    descs.set(desc, path);
    indexable.add(path);
  }

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) err(path, `应有 1 个 <h1>，实际 ${h1} 个`);

  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) ?? [])[1];
  if (!is404) {
    if (!canon) err(path, "缺少 canonical");
    else if (canon !== SITE + path) err(path, `canonical 不一致：${canon}`);
  }

  if (/href="#"/.test(html)) err(path, '存在 href="#" 假链接');

  for (const m of html.matchAll(/<a\b[^>]*>/g)) {
    const tag = m[0];
    const href = (tag.match(/href="([^"]*)"/) ?? [])[1];
    if (href === undefined) continue;
    if (href.startsWith("/") && !href.startsWith("//")) {
      if (!resolves(href)) err(path, `站内链接无效 ${href}`);
      else crossAnchors.push([path, href]);
    } else if (href.startsWith(SITE)) {
      if (!resolves(href.slice(SITE.length) || "/")) err(path, `站内链接无效 ${href}`);
      else crossAnchors.push([path, href.slice(SITE.length) || "/"]);
    } else if (href.startsWith("#")) {
      const id = decodeURIComponent(href.slice(1));
      if (id && !html.includes(`id="${id}"`)) err(path, `锚点不存在 ${href}`);
    }
    if (/data-entry=/.test(tag) && !/rel="[^"]*sponsored[^"]*nofollow|rel="[^"]*nofollow[^"]*sponsored/.test(tag))
      err(path, `推广入口缺少 sponsored/nofollow：${href}`);
    if (/target="_blank"/.test(tag) && !/noopener/.test(tag)) err(path, `新窗口链接缺少 noopener：${href}`);
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      err(path, "JSON-LD 无法解析");
    }
  }

  for (const d of OLD_DOMAINS) if (html.includes(d)) err(path, `残留旧域名/模板字样：${d}`);

  if (path === "/") void textOf;
}

// Sitemap
const smFiles = files.filter(f => /sitemap-\d+\.xml$/.test(f));
if (!existsSync(join(DIST, "sitemap-index.xml")) || smFiles.length === 0) err("sitemap", "缺少 sitemap-index.xml");
const smUrls = new Set();
for (const f of smFiles) for (const m of readFileSync(f, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) smUrls.add(m[1]);
for (const u of smUrls) {
  if (!u.startsWith(SITE + "/")) err("sitemap", `非正式域名 ${u}`);
  const p = u.slice(SITE.length);
  if (!resolves(p)) err("sitemap", `指向不存在的页面 ${u}`);
  if (!indexable.has(p)) err("sitemap", `包含 noindex 页面 ${u}`);
}
for (const p of indexable) if (p !== "/404.html" && !smUrls.has(SITE + p)) err("sitemap", `可索引页面未收录 ${p}`);

// robots
const robots = existsSync(join(DIST, "robots.txt")) ? readFileSync(join(DIST, "robots.txt"), "utf8") : "";
if (!robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)) err("robots.txt", "Sitemap 地址不正确");
if (/Disallow:\s*\/\s*$/m.test(robots)) err("robots.txt", "禁止了全站抓取");

// ---- 其他页面上的锚点：/path/#id 的 id 必须在目标页面真实存在 ----
const pageHtml = new Map();
const htmlOfPath = p => {
  const clean = decodeURI(p.split("#")[0].split("?")[0]);
  if (!pageHtml.has(clean)) {
    const f = clean.endsWith("/") ? join(DIST, clean, "index.html") : join(DIST, clean);
    pageHtml.set(clean, existsSync(f) && statSync(f).isFile() ? readFileSync(f, "utf8") : null);
  }
  return pageHtml.get(clean);
};
const seenAnchor = new Set();
// 用户中心的标签页由脚本根据 URL 的 # 切换，页面里没有同名 id，所以改为对照页面源码里登记的标签名
const userTabs = [
  ...readFileSync(new URL("../src/pages/user/index.astro", import.meta.url), "utf8").matchAll(/\{ id: "(\w+)", label:/g),
].map(m => m[1]);
for (const [from, href] of crossAnchors) {
  const [target, frag] = href.split("#");
  if (!frag || target === from) continue;
  const id = decodeURIComponent(frag);
  if (!id || id.startsWith(":~:")) continue;
  if (target === "/user/") {
    if (!userTabs.includes(id)) err(from, `用户中心没有标签“${id}”：${href}`);
    continue;
  }
  const key = `${target}#${id}`;
  if (seenAnchor.has(key)) continue;
  seenAnchor.add(key);
  const html = htmlOfPath(target);
  if (html !== null && !html.includes(`id="${id}"`)) err(from, `链接的锚点在目标页面不存在 ${href}`);
}

// ---- 测试数据口径：三类数据分开统计，全站数字一致 ----
const statsOf = html =>
  Object.fromEntries(
    [...html.matchAll(/data-stat="(speed|node|public)"[\s\S]*?data-stat-value[^>]*>\s*(\d+)\s*</g)].map(m => [m[1], Number(m[2])])
  );
const archiveHtml = htmlOfPath("/test-records/");
const homeHtml = htmlOfPath("/");
const statLabel = { speed: "条速度实测", node: "条节点在线状态核验", public: "批公开测速参考" };
let statInfo = "";
if (!archiveHtml || !homeHtml) {
  err("stats", "缺少首页或 /test-records/ 页面，无法核对测试数据口径");
} else {
  const A = statsOf(archiveHtml);
  const H = statsOf(homeHtml);
  for (const k of Object.keys(statLabel)) {
    if (A[k] === undefined) err("/test-records/", `缺少统计卡片 data-stat="${k}"`);
    if (H[k] === undefined) err("/", `缺少统计卡片 data-stat="${k}"`);
    if (A[k] !== undefined && H[k] !== undefined && A[k] !== H[k])
      err("/", `${statLabel[k]}数量 ${H[k]} 与测试档案的 ${A[k]} 不一致`);
  }
  // 表格/卡片行数 = 统计数字
  for (const k of Object.keys(statLabel)) {
    const n = [...archiveHtml.matchAll(new RegExp(`data-filter-item="row"[^>]*?data-kind="${k}"`, "g"))].length;
    if (A[k] !== undefined && n !== A[k]) err("/test-records/", `${statLabel[k]}统计为 ${A[k]}，但页面实际列出 ${n} 行`);
  }
  // 各品牌记录页之和 = 统计数字（三类各自相加，不混合）
  const sum = { speed: 0, node: 0, public: 0 };
  const brandRe = /^\/test-records\/(?!region\/|submit\/)[^/]+\/$/;
  for (const p of indexable) {
    if (!brandRe.test(p)) continue;
    const html = htmlOfPath(p) ?? "";
    sum.speed += Number((html.match(/速度实测（(\d+) 条）/) ?? [])[1] ?? 0);
    sum.node += Number((html.match(/节点在线状态核验（(\d+) 条）/) ?? [])[1] ?? 0);
    sum.public += Number((html.match(/公开测速参考（(\d+) 批）/) ?? [])[1] ?? 0);
  }
  for (const k of Object.keys(statLabel))
    if (A[k] !== undefined && sum[k] !== A[k]) err("/test-records/", `各品牌记录页的${statLabel[k]}合计 ${sum[k]}，与统计 ${A[k]} 不一致`);
  // 全站汇总处写出的数字都必须等于统计：首页全文、测试档案的 meta description。
  // 品牌、地区各自的数字口径不同（例如某品牌“1 条速度实测”），已由上面的“行数 = 统计”“品牌页合计 = 统计”保证，这里不逐句核对。
  const metaDescOf = h => (h.match(/<meta name="description" content="([^"]*)"/) ?? [])[1] ?? "";
  for (const [path, html] of [["/", homeHtml], ["/test-records/", metaDescOf(archiveHtml)]]) {
    for (const k of Object.keys(statLabel)) {
      const unit = k === "public" ? "批" : "条";
      const label = statLabel[k].slice(1);
      for (const m of html.matchAll(new RegExp(`(\\d+) ?${unit}${label}`, "g")))
        if (A[k] !== undefined && Number(m[1]) !== A[k]) err(path, `写的是“${m[0]}”，统计应为 ${A[k]}`);
    }
  }
  statInfo = `测试数据口径：${A.speed} 条速度实测 / ${A.node} 条节点在线状态核验 / ${A.public} 批公开测速参考（首页、档案表格、品牌页合计一致）。`;
}

// ---- 站名、编号、头像、可访问性等规则（逐页） ----
const cfgSrc = readFileSync(new URL("../astro-paper.config.ts", import.meta.url), "utf8");
const SITE_TITLE = (cfgSrc.match(/^\s*title:\s*"([^"]+)"/m) ?? [])[1] ?? "";
const FEATURED = Number(
  (readFileSync(new URL("../src/data/editorial-order.ts", import.meta.url), "utf8").match(/FEATURED_COUNT\s*=\s*(\d+)/) ?? [])[1] ?? 5
);
const typesOf = obj => {
  const out = [];
  const visit = v => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === "object") {
      if (v["@type"]) out.push(...[].concat(v["@type"]));
      Object.values(v).forEach(visit);
    }
  };
  visit(obj);
  return out;
};
const EXPECT_TYPES = {
  "/": ["WebSite", "Organization"],
  "/speedtest/": ["WebApplication", "FAQPage"],
  "/test-records/": ["CollectionPage"],
  "/compare/": ["CollectionPage"],
  "/testing-methodology/": ["WebPage"],
  "/about/": ["AboutPage"],
  "/contact/": ["ContactPage"],
};
const FORBIDDEN_TYPES = ["Review", "AggregateRating", "Rating", "Product", "Recipe", "Event", "JobPosting"];
const RANK_WORDS = /最快|第一名|排名第一|速度冠军|平均速度|平均下载/;
for (const f of htmlFiles) {
  const path = pathOf(f);
  const html = readFileSync(f, "utf8");
  const noindex = /<meta name="robots" content="noindex/.test(html);

  if (html.includes("机场测试档案")) err(path, "仍使用旧名称“机场测试档案”，应为“机场实测档案”");
  if (/本站测试 ?\d+ ?条/.test(html)) err(path, "出现合并口径“本站测试 N 条”，应分开写速度实测 / 节点在线状态核验 / 公开测速参考");
  for (const m of html.matchAll(/编辑精选 No\.(\d+)/g))
    if (Number(m[1]) > FEATURED) err(path, `“${m[0]}”超出编辑精选范围（前 ${FEATURED} 名），应写“目录第 n 位”`);

  // 品牌头像只放图标，不放文字（避免与旁边品牌名的首字重复）
  for (const m of html.matchAll(/<span aria-hidden="true" class="[^"]*\bsize-(?:8|11|14)\b[^"]*"[^>]*>([\s\S]*?)<\/span>/g)) {
    const inner = m[1].replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/\s+/g, "");
    if (inner) err(path, `品牌头像里有文字“${inner.slice(0, 6)}”，会造成品牌首字重复`);
  }

  // 可横向滚动的容器必须可聚焦、有名称
  for (const m of html.matchAll(/<div\b[^>]*\btable-scroll\b[^>]*>/g)) {
    const tag = m[0];
    if (!/tabindex="0"/.test(tag) || !/role="region"/.test(tag) || !/aria-label="[^"]+"/.test(tag))
      err(path, `表格滚动容器缺少 tabindex/role/aria-label：${tag.slice(0, 80)}`);
  }
  // 同一页内可聚焦的表格区域（role="region"）名称不能重复，读屏软件的地标列表里才分得清；表头单元格不能是空的
  const regionNames = [...html.matchAll(/<div\b[^>]*\brole="region"[^>]*>/g)]
    .map(m => (m[0].match(/aria-label="([^"]*)"/) ?? [])[1])
    .filter(Boolean);
  const dupRegions = [...new Set(regionNames.filter((n, i) => regionNames.indexOf(n) !== i))];
  if (dupRegions.length) err(path, `表格区域名称重复：${dupRegions.join("、").slice(0, 90)}`);
  if (/<th\b[^>]*>\s*<\/th>/.test(html)) err(path, "存在空白的表头单元格 <th></th>");
  for (const m of html.matchAll(/<div\b[^>]*role="progressbar"[^>]*>/g))
    if (!/aria-label="[^"]+"/.test(m[0])) err(path, "进度条缺少 aria-label");
  for (const m of html.matchAll(/<img\b[^>]*>/g))
    if (!/\balt=/.test(m[0])) err(path, `图片缺少 alt：${m[0].slice(0, 80)}`);
  // 复选框要有名称：自带 aria-label / aria-labelledby，或被 <label> 包住（含可见文字）
  for (const m of html.matchAll(/<input\b[^>]*type="checkbox"[^>]*>/g)) {
    if (/aria-label="[^"]+"|aria-labelledby=/.test(m[0])) continue;
    const before = html.slice(0, m.index);
    const wrapped = before.lastIndexOf("<label") > before.lastIndexOf("</label>");
    const idMatch = m[0].match(/\bid="([^"]+)"/);
    const labelled = idMatch && html.includes(`for="${idMatch[1]}"`);
    if (!wrapped && !labelled) err(path, `复选框没有名称：${m[0].slice(0, 80)}`);
  }

  // 标题以站名结尾（首页、404 除外）
  if (!noindex && path !== "/" && path !== "/404.html" && SITE_TITLE) {
    const title = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? "";
    if (!title.endsWith(`｜${SITE_TITLE}`)) warns.push(`${path}: <title> 没有以“｜${SITE_TITLE}”结尾`);
  }

  // 结构化数据：类型必须与页面内容相符，不输出评分/评价类
  const types = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      types.push(...typesOf(JSON.parse(m[1])));
    } catch {
      /* 解析错误已在前面报告 */
    }
  }
  for (const t of types) if (FORBIDDEN_TYPES.includes(t)) err(path, `JSON-LD 使用了页面上没有的类型 ${t}`);
  for (const t of EXPECT_TYPES[path] ?? []) if (!types.includes(t)) err(path, `JSON-LD 缺少 ${t}`);
  if (/^\/test-records\/region\/[^/]+\/$/.test(path) && !types.includes("CollectionPage")) err(path, "地区专题页缺少 CollectionPage");

  // 测速档案与地区专题页只列数据，不出现排名/平均式结论
  if (/^\/test-records\//.test(path) && !/^\/test-records\/submit\//.test(path)) {
    // 记录备注（data-record-note）是对来源数据的说明，例如“来源页给出的平均速度超过 1000 Mbps，与标称环境矛盾，本站未收录”，
    // 不是本站自己给出排名或平均值，所以不在此检查范围内。
    const t = html
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "")
      .replace(/<p\b[^>]*data-record-note[^>]*>[\s\S]*?<\/p>/g, " ")
      .replace(/<[^>]+>/g, " ");
    const m = t.match(RANK_WORDS);
    if (m) err(path, `测速档案页出现排名/平均式用语“${m[0]}”`);
  }
}

// ---- Sitemap lastmod：格式有效、不在未来；地区专题页都在 Sitemap 且有 lastmod ----
for (const f of smFiles) {
  const xml = readFileSync(f, "utf8");
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) ?? [])[1];
    const lm = (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) ?? [])[1];
    if (lm) {
      const t = Date.parse(lm);
      if (Number.isNaN(t)) err("sitemap", `lastmod 无法解析 ${loc} ${lm}`);
      else if (t > Date.now() + 5 * 60_000) err("sitemap", `lastmod 晚于当前时间 ${loc} ${lm}`);
    } else if (/\/test-records\//.test(loc)) err("sitemap", `测试档案相关页面缺少 lastmod ${loc}`);
  }
}
for (const p of indexable)
  if (/^\/test-records\/region\//.test(p) && !smUrls.has(SITE + p)) err("sitemap", `地区专题页未收录 ${p}`);

// 文章字数（参考，不是硬性要求）
const articleRe = /^\/(methods|guides|clients|routes|troubleshooting|ai)\/[^/]+\/$/;
const counts = [];
for (const f of htmlFiles) {
  const p = pathOf(f);
  if (!articleRe.test(p)) continue;
  const html = readFileSync(f, "utf8");
  const body = (html.match(/<div class="app-prose[^"]*" id="article">([\s\S]*?)<\/div>\s*(<!--|<div class="bg-background mt-10|<aside|<section|<\/article>)/) ?? [])[1] ?? "";
  const text = body.replace(/<[^>]+>/g, "");
  // 按中文编辑习惯计数：汉字 + 中文标点 + 英文/数字词
  const n =
    (text.match(/[\u4e00-\u9fff]/g) ?? []).length +
    (text.match(/[，。、；：？！“”（）《》—…]/g) ?? []).length +
    (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  counts.push([p, n]);
}

// ---- 站内搜索索引：文件存在，且每条结果的页面与锚点都真实存在 ----
const idxFile = join(DIST, "search-index.json");
let idxInfo = "";
if (!existsSync(idxFile)) {
  err("search-index.json", "搜索索引未输出到部署产物");
} else {
  const idx = JSON.parse(readFileSync(idxFile, "utf8"));
  const entries = idx.entries ?? [];
  let anchors = 0;
  const htmlCache = new Map();
  const htmlFor = path => {
    if (!htmlCache.has(path)) {
      const f = join(DIST, path.replace(/^\//, ""), "index.html");
      htmlCache.set(path, existsSync(f) ? readFileSync(f, "utf8") : null);
    }
    return htmlCache.get(path);
  };
  const checkUrl = (u, where) => {
    const [path, hash] = u.split("#");
    const html = htmlFor(path);
    if (html === null) return err("search-index.json", `${where} → ${path} 页面不存在`);
    if (hash) {
      anchors++;
      if (!html.includes(`id="${hash}"`)) err("search-index.json", `${where} → ${u} 锚点不存在`);
    }
  };
  for (const e of entries) {
    checkUrl(e.u, e.t);
    for (const s of e.s ?? []) if (s.a) checkUrl(`${e.u.split("#")[0]}#${s.a}`, `${e.t} / ${s.h || "开头"}`);
  }
  if (entries.length < 10) err("search-index.json", `条目过少（${entries.length}）`);
  const sections = entries.reduce((n, e) => n + (e.s?.length ?? 0), 0);
  idxInfo = `搜索索引 ${entries.length} 条（小节 ${sections} 个，锚点校验 ${anchors} 个），${(statSync(idxFile).size / 1024).toFixed(0)} KB。`;
}

console.log(`检查页面 ${htmlFiles.length} 个，可索引 ${indexable.size} 个，Sitemap ${smUrls.size} 条。`);
if (idxInfo) console.log(idxInfo);
if (statInfo) console.log(statInfo);
if (counts.length) {
  console.log("\n文章正文字数（汉字+标点+英文词，编辑参考，非排名门槛）：");
  for (const [p, n] of counts.sort((a, b) => a[1] - b[1])) console.log(`  ${String(n).padStart(5)}  ${p}`);
}
if (warns.length) console.log(`\n提示 ${warns.length} 条：\n  ` + warns.join("\n  "));
if (errors.length) {
  console.error(`\n错误 ${errors.length} 条：\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("\n全部检查通过。");
