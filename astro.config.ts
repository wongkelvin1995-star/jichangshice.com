import { defineConfig, envField, svgoOptimizer } from "astro/config";
import { readdirSync, readFileSync, statSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import config from "./astro-paper.config";
import { NODE_CHECKS } from "./src/data/node-checks";
import { TEST_PHOTOS } from "./src/data/test-photos";
import { regionKey } from "./src/data/regions";
import { revisionOf } from "./src/data/page-dates";
import { regionOf as nodeRegionOf } from "./src/data/node-checks";
import {
  rehypeExternalLinks,
  rehypeTableScroll,
  rehypeTaskLabels,
} from "./src/utils/rehypeExternalLinks";

/**
 * 品牌资料页只有在 src/content/airports/ 里有人工撰写的分析时才进入 Sitemap，
 * 其余品牌页输出 noindex（见 src/pages/airports/[slug].astro），两边规则保持一致。
 */
const indexedAirports = new Set(
  readdirSync(new URL("./src/content/airports/", import.meta.url))
    .filter(f => /^[^_].*\.md$/.test(f))
    .map(f => f.replace(/\.md$/, ""))
);

/**
 * Sitemap lastmod：取内容文件 frontmatter 中真实的修改/发布日期（modDatetime > pubDatetime > updated），
 * 不使用构建当天。没有对应内容文件的页面，只在 src/data/page-dates.ts 登记了真实修改日期、
 * 或页面所用数据有真实日期（来源核对日、核验/实测图发布时间）时才输出 lastmod，否则不输出。
 */
const SITE = config.site.url.replace(/\/$/, "");
const lastmod = new Map<string, string>();
function frontDate(file: string): string | null {
  const fm = readFileSync(file, "utf-8").split("---")[1] ?? "";
  const pick = (k: string) =>
    fm.match(new RegExp(`^${k}:\\s*([0-9T:+\\-]+)`, "m"))?.[1] ?? null;
  return pick("modDatetime") ?? pick("pubDatetime") ?? pick("updated");
}
function walkMd(dir: URL, toPath: (rel: string) => string) {
  const walk = (d: string, rel = "") => {
    for (const f of readdirSync(d)) {
      const full = `${d}/${f}`;
      if (statSync(full).isDirectory()) walk(full, `${rel}${f}/`);
      else if (/^[^_].*\.md$/.test(f)) {
        const date = frontDate(full);
        if (date)
          lastmod.set(`${SITE}${toPath(rel + f.replace(/\.md$/, ""))}`, date);
      }
    }
  };
  walk(dir.pathname);
}
walkMd(new URL("./src/content/posts/", import.meta.url), r => `/${r}/`);
walkMd(
  new URL("./src/content/airports/", import.meta.url),
  r => `/airports/${r}/`
);
walkMd(new URL("./src/content/pages/", import.meta.url), r => `/${r}/`);
// 测试档案页：以本站核验记录真实发布到网站的时间作为 lastmod
for (const c of [...NODE_CHECKS, ...TEST_PHOTOS]) {
  for (const u of [
    `${SITE}/test-records/`,
    `${SITE}/test-records/${c.brandSlug}/`,
  ])
    if (
      !lastmod.get(u) ||
      Date.parse(c.publishedAt) > Date.parse(lastmod.get(u)!)
    )
      lastmod.set(u, c.publishedAt);
}
// 公开测速参考：以本站核对来源页面的日期（sourceCheckedAt）作为相关页面的 lastmod
const bump = (url: string, date: string) => {
  const cur = lastmod.get(url);
  if (!cur || Date.parse(date) > Date.parse(cur)) lastmod.set(url, date);
};
const publicRecords = JSON.parse(
  readFileSync(
    new URL("./src/data/test-records.json", import.meta.url),
    "utf-8"
  )
) as {
  brandSlug: string;
  sourceCheckedAt: string;
  rows: { node?: string | null; region?: string | null }[];
}[];
for (const r of publicRecords) {
  bump(`${SITE}/test-records/`, r.sourceCheckedAt);
  bump(`${SITE}/test-records/${r.brandSlug}/`, r.sourceCheckedAt);
  for (const row of r.rows) {
    const k = regionKey(row.node ?? row.region);
    if (k) bump(`${SITE}/test-records/region/${k}/`, r.sourceCheckedAt);
  }
}
// 地区专题页同时包含该地区的实测图与节点核验，取它们真实的发布时间
for (const t of TEST_PHOTOS) {
  const k = regionKey(t.nodeRegion);
  if (k) bump(`${SITE}/test-records/region/${k}/`, t.publishedAt);
}
for (const c of NODE_CHECKS) {
  for (const k of new Set(c.nodes.map(n => regionKey(nodeRegionOf(n.name)))))
    if (k) bump(`${SITE}/test-records/region/${k}/`, c.publishedAt);
}
// 没有内容文件的页面：取 src/data/page-dates.ts 登记的真实修改日期（与数据日期比，取较晚的）
const withRevision = (url: string) => {
  const rev = revisionOf(url.replace(SITE, ""));
  const cur = lastmod.get(url);
  if (rev && (!cur || Date.parse(rev) > Date.parse(cur))) return rev;
  return cur ?? null;
};
for (const p of [
  "/",
  "/test-records/",
  "/speedtest/",
  "/compare/",
  "/recommendations/",
  "/airports/",
]) {
  const d = withRevision(`${SITE}${p}`);
  if (d) lastmod.set(`${SITE}${p}`, d);
}
// 首页汇总最新文章与资料：lastmod 取全站内容中最新的真实日期
const homeDate = [...lastmod.values()]
  .sort((a, b) => Date.parse(a) - Date.parse(b))
  .at(-1);
if (homeDate) lastmod.set(`${SITE}/`, homeDate);

const NOT_IN_SITEMAP = [
  /\/search\/$/,
  /\/404\/?$/,
  /\/user\/$/,
  /\/test-records\/submit\/$/,
];

export default defineConfig({
  site: config.site.url,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    mdx(),
    sitemap({
      serialize: item => {
        const d = withRevision(item.url);
        if (d) item.lastmod = new Date(d).toISOString();
        return item;
      },
      filter: page => {
        if (NOT_IN_SITEMAP.some(re => re.test(page))) return false;
        const m = page.match(/\/airports\/([^/]+)\/$/);
        if (m) return indexedAirports.has(m[1]);
        return true;
      },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [],
      rehypePlugins: [
        rehypeCallouts,
        rehypeExternalLinks,
        rehypeTableScroll,
        rehypeTaskLabels,
      ],
    }),
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      PUBLIC_BING_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
