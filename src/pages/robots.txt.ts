import type { APIRoute } from "astro";

/** 允许抓取全部公开页面；搜索页用 noindex 元标签处理（不能在这里 Disallow，否则爬虫读不到 noindex） */
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`,
    {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }
  );
};
