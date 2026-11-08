/**
 * 站内三类测试数据的唯一统计口径。
 *
 * 首页、测试档案、品牌页、搜索索引和各专题页的数字都从这里取，不要在页面里自己相加：
 * - 速度实测：站长连上节点后实际测速、附原始截图并核验通过（src/data/test-runs/）
 * - 节点在线状态核验：对照服务商面板截图核对节点是否在线，不代表速度（src/data/node-checks.ts）
 * - 公开测速参考：他人公开发布的测速记录，本站只核对来源页面，不是本站实测（src/data/test-records.json）
 *
 * 三类数据口径不同，不能合并成一个“本站测试 N 条”。
 */
import { NODE_CHECKS, nodeChecksOf } from "@/data/node-checks";
import { getVerifiedRuns, runsOf } from "@/utils/testRuns";
import {
  getTestRecords,
  recordsOf,
  type TestRecord,
} from "@/utils/testRecords";

export const STAT_KINDS = {
  speed: {
    label: "速度实测",
    unit: "条",
    hint: "站长连上节点后实际测速，附原始截图，已核验",
  },
  node: {
    label: "节点在线状态核验",
    unit: "条",
    hint: "对照服务商面板截图核对节点是否在线，不代表速度",
  },
  public: {
    label: "公开测速参考",
    unit: "批",
    hint: "他人公开发布的测速，本站只核对来源页面，不是本站实测",
  },
} as const;

export type StatKind = keyof typeof STAT_KINDS;

/** “4 条速度实测” “1 条节点在线状态核验” “37 批公开测速参考” */
export const statPhrase = (kind: StatKind, n: number) =>
  `${n} ${STAT_KINDS[kind].unit}${STAT_KINDS[kind].label}`;

export type TestStats = {
  speed: number;
  node: number;
  public: number;
  /** 有速度实测的品牌数 */
  speedBrands: number;
  /** 有公开测速参考的品牌数 */
  publicBrands: number;
  /** 至少有一类测试数据的品牌数 */
  anyBrands: number;
  /** 公开测速参考里附 Speedtest 原始结果链接的行数 */
  publicEvidenceLinks: number;
};

export function computeTestStats(records: TestRecord[]): TestStats {
  const runs = getVerifiedRuns();
  const any = new Set<string>([
    ...runs.map(r => r.brandSlug),
    ...NODE_CHECKS.map(c => c.brandSlug),
    ...records.map(r => r.data.brandSlug),
  ]);
  return {
    speed: runs.length,
    node: NODE_CHECKS.length,
    public: records.length,
    speedBrands: new Set(runs.map(r => r.brandSlug)).size,
    publicBrands: new Set(records.map(r => r.data.brandSlug)).size,
    anyBrands: any.size,
    publicEvidenceLinks: records.reduce(
      (n, r) => n + r.data.rows.filter(x => x.evidenceUrl).length,
      0
    ),
  };
}

export async function getTestStats(): Promise<TestStats> {
  return computeTestStats(await getTestRecords());
}

/** 单个品牌三类数据各有多少 */
export function brandStats(slug: string, records: TestRecord[]) {
  return {
    speed: runsOf(getVerifiedRuns(), slug).length,
    node: nodeChecksOf(slug).length,
    public: recordsOf(records, slug).length,
  };
}

/** 一行文字：只列出有数据的类别，没有任何数据时返回 null */
export function brandStatsText(
  s: { speed: number; node: number; public: number },
  { sep = "；" }: { sep?: string } = {}
): string | null {
  const parts: string[] = [];
  if (s.speed) parts.push(statPhrase("speed", s.speed));
  if (s.node) parts.push(statPhrase("node", s.node));
  if (s.public) parts.push(statPhrase("public", s.public));
  return parts.length ? parts.join(sep) : null;
}

/**
 * 品牌测速记录专题的“内容充足”门槛：有速度实测，或公开测速参考至少 3 批且附至少 5 条原始结果链接。
 * 只影响档案总页的“品牌专题”入口；其余品牌的记录页照常存在（已收录的网址不删除），
 * 但页面会如实写明资料较少，不用估算数据填充。
 */
export const BRAND_TOPIC_MIN = { batches: 3, evidenceLinks: 5 } as const;

export function isBrandTopic(slug: string, records: TestRecord[]): boolean {
  if (runsOf(getVerifiedRuns(), slug).length > 0) return true;
  const rs = recordsOf(records, slug);
  const links = rs.reduce(
    (n, r) => n + r.data.rows.filter(x => x.evidenceUrl).length,
    0
  );
  return (
    rs.length >= BRAND_TOPIC_MIN.batches &&
    links >= BRAND_TOPIC_MIN.evidenceLinks
  );
}
