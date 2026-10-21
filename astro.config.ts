import { defineConfig, envField, svgoOptimizer } from "astro/config";
import { readdirSync, readFileSync, statSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import config from "./astro-paper.config";
import {
  rehypeExternalLinks,
  rehypeTableScroll,
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
 * 不使用构建当天。没有对应内容文件的页面不输出 lastmod。
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
// 首页汇总最新文章与资料：lastmod 取全站内容中最新的真实日期
const homeDate = [...lastmod.values()].sort(
  (a, b) => Date.parse(a) - Date.parse(b)
).at(-1);
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
        const d = lastmod.get(item.url);
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
      rehypePlugins: [rehypeCallouts, rehypeExternalLinks, rehypeTableScroll],
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
