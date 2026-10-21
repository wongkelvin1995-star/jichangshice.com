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
  else if (desc.length < 40) warns.push(`${path}: description 偏短（${desc.length} 字符）`);
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
    } else if (href.startsWith(SITE)) {
      if (!resolves(href.slice(SITE.length) || "/")) err(path, `站内链接无效 ${href}`);
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
