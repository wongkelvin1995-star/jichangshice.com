/**
 * 统一的「来源记录」字段。
 *
 * 站内几类资料（公开测速参考、本站节点在线核验、套餐、优惠码）原本各自记录来源，
 * 字段名不一样。这里给出一套共用字段，并提供转换函数，方便在页面、审核脚本和报告里
 * 用同一种方式回答：资料从哪来、是哪天的数据、本站哪天核对过、有什么证据、现在是什么状态。
 *
 * 新增任何数据来源时，请保证能转换成 SourceRecord，且不要为了凑齐字段而填写推测值：
 * 不知道的字段填 null。
 */
import type { TestRecord } from "./testRecords";
import type { NodeCheck } from "@/data/node-checks";
import type { Plan } from "./plans";
import { COUPON_VERIFIED } from "@/data/coupon-status";

export type SourceStatus =
  /** 本站自己取得原始证据并逐项核对 */
  | "site_verified"
  /** 站长提供的结算页截图已核对 */
  | "checkout_verified"
  /** 公开发布的第三方资料，本站只核对过来源页面 */
  | "public_reference"
  /** 服务商自己发布的资料 */
  | "vendor_claim"
  /** 历史整理的资料，尚未核验 */
  | "historical"
  /** 尚未核验（例如优惠码） */
  | "unverified";

export type SourceRecord = {
  /** 来源页面；本站自己的记录可为 null */
  sourceUrl: string | null;
  sourceName: string;
  /** 资料本身的日期（测试日期、截图日期），YYYY-MM-DD；不知道填 null */
  dataDate: string | null;
  /** 本站最后核对日期，YYYY-MM-DD；从未核对填 null */
  checkedAt: string | null;
  /** 站内可访问的证据文件或原始结果链接 */
  evidence: string[];
  status: SourceStatus;
  note: string | null;
};

export const STATUS_LABEL: Record<SourceStatus, string> = {
  site_verified: "本站已核验",
  checkout_verified: "结算页核验",
  public_reference: "公开参考",
  vendor_claim: "服务商公布",
  historical: "历史参考",
  unverified: "待验证",
};

export function fromTestRecord(r: TestRecord): SourceRecord {
  const d = r.data;
  return {
    sourceUrl: d.sourceUrl,
    sourceName: d.sourceName,
    dataDate: d.recordedAt,
    checkedAt: d.sourceCheckedAt,
    evidence: d.rows.map(x => x.evidenceUrl).filter((u): u is string => !!u),
    status:
      d.sourceType === "vendor_claim" ? "vendor_claim" : "public_reference",
    note: d.sharedData ?? null,
  };
}

export function fromNodeCheck(c: NodeCheck): SourceRecord {
  return {
    sourceUrl: null,
    sourceName: c.source,
    dataDate: c.date,
    checkedAt: c.publishedAt.slice(0, 10),
    evidence: c.evidence,
    status: "site_verified",
    note: c.notShown.length
      ? `截图中未出现：${c.notShown.map(m => m.name).join("、")}`
      : null,
  };
}

export function fromPlan(p: Plan): SourceRecord {
  return {
    sourceUrl: p.sourceUrls[0] ?? null,
    sourceName: p.sourceProjects.join("、") || "历史资料",
    dataDate: p.observedAt,
    checkedAt: p.currentVerified ? p.observedAt : null,
    evidence: p.sourceUrls,
    status: p.currentVerified ? "checkout_verified" : "historical",
    note: p.conflicts.length ? "来源之间数值不一致" : null,
  };
}

export function fromCoupon(slug: string, code: string): SourceRecord {
  const verifiedAt = COUPON_VERIFIED[slug] ?? null;
  return {
    sourceUrl: null,
    sourceName: `优惠码 ${code}（站长提供）`,
    dataDate: null,
    checkedAt: verifiedAt,
    evidence: [],
    status: verifiedAt ? "checkout_verified" : "unverified",
    note: verifiedAt ? null : "尚未在结算页确认，不能视为有效",
  };
}
