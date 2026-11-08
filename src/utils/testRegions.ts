/**
 * 地区维度的测速数据整理。
 *
 * 只做“归类和列出”，不换算单位、不求平均、不排名：
 * - 公开测速参考的每一行（node / region 字段）归到一个地区；
 *   “新加坡、日本”“英/德/法/泰/韩”这类多地区汇总行无法归属单个地区，不进入地区页；
 * - 本站速度实测按 nodeRegion 归类，节点在线状态核验按节点名去掉编号后的地区归类；
 * - 只有数据足够的地区才有独立专题页（见 REGION_PAGE_MIN），其余地区只出现在测试档案的筛选里。
 */
import { NODE_CHECKS, regionOf as nodeRegionOf } from "@/data/node-checks";
import { getVerifiedRuns, type TestRun } from "@/utils/testRuns";
import type { TestRecord } from "@/utils/testRecords";

import {
  REGIONS,
  regionKey,
  regionName,
  type RegionSlug,
} from "@/data/regions";

export { REGIONS, regionKey, regionName };
export type { RegionSlug };

/**
 * 地区专题页的最低门槛（全部满足才生成独立页面）：
 * 行数够多、涉及多个品牌，并且有一定数量能点开核对的原始结果链接，避免用几行转录数据撑出一个页面。
 */
export const REGION_PAGE_MIN = {
  rows: 20,
  brands: 5,
  evidenceLinks: 5,
} as const;

export type PublicRow = {
  region: RegionSlug;
  record: TestRecord;
  /** 记录内的行（原样，不改写数值） */
  row: TestRecord["data"]["rows"][number];
  /** 来源写的节点/地区原文，如“香港（20）” */
  label: string;
};

export type RegionData = {
  slug: RegionSlug;
  name: string;
  rows: PublicRow[];
  batches: TestRecord[];
  brands: string[];
  evidenceLinks: number;
  peakRows: number;
  runs: TestRun[];
  /** 节点在线状态核验：该地区在截图里的节点数 / 在线数 */
  nodeChecks: {
    brandSlug: string;
    date: string;
    from: string;
    to: string;
    total: number;
    online: number;
    notShown: number;
  }[];
  /** 满足门槛时才有独立专题页 */
  hasPage: boolean;
};

export function collectRegions(records: TestRecord[]): RegionData[] {
  const runs = getVerifiedRuns();
  return REGIONS.map(({ slug, name }) => {
    const rows: PublicRow[] = [];
    for (const record of records) {
      for (const row of record.data.rows) {
        const label = row.node ?? row.region ?? null;
        if (regionKey(label) === slug)
          rows.push({ region: slug, record, row, label: label! });
      }
    }
    const batches = [
      ...new Map(rows.map(r => [r.record.id, r.record])).values(),
    ];
    const brands = [...new Set(rows.map(r => r.record.data.brandSlug))];
    const evidenceLinks = rows.filter(r => r.row.evidenceUrl).length;
    const peakRows = rows.filter(r =>
      (r.row.window ?? r.record.data.window ?? "").includes("晚高峰")
    ).length;
    const regionRuns = runs.filter(r => regionKey(r.nodeRegion) === slug);
    const nodeChecks = NODE_CHECKS.map(c => {
      const nodes = c.nodes.filter(
        n => regionKey(nodeRegionOf(n.name)) === slug
      );
      const missing = c.notShown.filter(
        n => regionKey(nodeRegionOf(n.name)) === slug
      );
      return {
        brandSlug: c.brandSlug,
        date: c.date,
        from: c.from,
        to: c.to,
        total: nodes.length,
        online: nodes.filter(n => n.status === "online").length,
        notShown: missing.length,
      };
    }).filter(c => c.total > 0);
    const hasPage =
      rows.length >= REGION_PAGE_MIN.rows &&
      brands.length >= REGION_PAGE_MIN.brands &&
      evidenceLinks >= REGION_PAGE_MIN.evidenceLinks;
    return {
      slug,
      name,
      rows,
      batches,
      brands,
      evidenceLinks,
      peakRows,
      runs: regionRuns,
      nodeChecks,
      hasPage,
    };
  });
}

/** 一批记录覆盖的地区（只含能单独归类的行） */
export function regionsOfRecord(r: TestRecord): RegionSlug[] {
  const set = new Set<RegionSlug>();
  for (const row of r.data.rows) {
    const k = regionKey(row.node ?? row.region);
    if (k) set.add(k);
  }
  return [...set];
}
