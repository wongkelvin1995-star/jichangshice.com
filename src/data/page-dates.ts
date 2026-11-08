/**
 * 没有 Markdown 内容文件的页面（首页、汇总页、测速页等）的“真实修改日期”，用作 Sitemap 的 lastmod。
 *
 * 规则：
 * - 只在页面内容有实质修改（新增/删除板块、数据口径或正文变化）时，手动改成修改当天的日期；
 *   不要写构建日期，也不要为了“显得新”而刷新。
 * - Sitemap 取这里的日期与页面所用数据的真实日期（来源核对日、节点核验与实测图发布时间）中较晚的一个。
 * - 有 Markdown 内容文件的页面（文章、机场测评、关于/FAQ 等）使用文件头里的 modDatetime / pubDatetime / updated，不在这里登记。
 *
 * 纯数据文件，不依赖 Astro：astro.config.ts 也会引用它。
 */
export const PAGE_REVISIONS: Record<string, string> = {
  // 2026-11-08：统一品牌名“机场实测”；首页改为测速数据优先；测试档案改为可筛选汇总页
  "/": "2026-11-08",
  "/test-records/": "2026-11-08",
  "/speedtest/": "2026-11-08",
  "/compare/": "2026-11-08",
  "/recommendations/": "2026-11-08",
  "/airports/": "2026-11-08",
};

/** 随测试档案一起改版的页面（含新增的地区专题页、各品牌测速记录页） */
export const REVISION_PATTERNS: [RegExp, string][] = [
  [/^\/test-records\/region\/[^/]+\/$/, "2026-11-08"],
  [/^\/test-records\/[^/]+\/$/, "2026-11-08"],
];

export function revisionOf(path: string): string | null {
  return (
    PAGE_REVISIONS[path] ??
    REVISION_PATTERNS.find(([re]) => re.test(path))?.[1] ??
    null
  );
}
