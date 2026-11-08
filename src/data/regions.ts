/**
 * 测速地区的归类规则（纯数据，不依赖 Astro，astro.config.ts 也会引用它来计算地区专题页的 lastmod）。
 *
 * “香港”“香港 01”“香港（20）”“美国（10）”都归到对应地区；
 * “新加坡、日本”“英/德/法/泰/韩”这类多地区汇总行无法归属单个地区，返回 null。
 */
export const REGIONS = [
  { slug: "hong-kong", name: "香港" },
  { slug: "japan", name: "日本" },
  { slug: "singapore", name: "新加坡" },
  { slug: "us", name: "美国" },
  { slug: "taiwan", name: "台湾" },
] as const;

export type RegionSlug = (typeof REGIONS)[number]["slug"];

export function regionKey(text: string | null | undefined): RegionSlug | null {
  if (!text) return null;
  const s = text.replace(/[（(][^）)]*[）)]/g, "").trim();
  if (/[、/，,]/.test(s)) return null;
  return REGIONS.find(r => s.startsWith(r.name))?.slug ?? null;
}

export function regionName(slug: RegionSlug): string {
  return REGIONS.find(r => r.slug === slug)!.name;
}
