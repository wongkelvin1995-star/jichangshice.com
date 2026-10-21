import { getCollection, type CollectionEntry } from "astro:content";
import { fmtGB, fmtMoney } from "./format";
import { EDITORIAL_ORDER } from "@/data/editorial-order";

export type Plan = CollectionEntry<"plans">["data"];
export type Provider = CollectionEntry<"providers">["data"];

/** 全部品牌，按 src/data/editorial-order.ts 的编辑顺序排列，editorialOrder 以该文件为准 */
export async function getProviders(): Promise<Provider[]> {
  const all = (await getCollection("providers")).map(e => e.data);
  const order: readonly string[] = EDITORIAL_ORDER;
  const missing = all.filter(p => !order.includes(p.slug)).map(p => p.slug);
  if (missing.length)
    throw new Error(
      `editorial-order.ts 缺少品牌：${missing.join(", ")}（新增品牌需加入编辑顺序）`
    );
  return all
    .map(p => ({ ...p, editorialOrder: order.indexOf(p.slug) + 1 }))
    .sort((a, b) => a.editorialOrder - b.editorialOrder);
}

export async function getPlans(): Promise<Plan[]> {
  return (await getCollection("plans")).map(e => e.data);
}

/** 价格文本：付款金额 + 付款周期；多月付款另给折算月均 */
export function priceLabel(p: Plan): { main: string; note?: string } {
  if (p.paymentAmount === null) {
    const opts = (p.amountOptions ?? []).map(fmtMoney).join(" / ");
    return { main: opts || "—", note: "来源记录不一致" };
  }
  const amt = fmtMoney(p.paymentAmount);
  switch (p.paymentMonths) {
    case 0:
      return { main: amt, note: "一次性付款" };
    case 1:
      return { main: `${amt}/月` };
    case 12:
      return {
        main: `${amt}/年`,
        note: p.monthlyAverage
          ? `折合约 ${fmtMoney(p.monthlyAverage)}/月`
          : undefined,
      };
    default:
      return {
        main: `${amt}/${p.paymentMonths}个月`,
        note: p.monthlyAverage
          ? `折合约 ${fmtMoney(p.monthlyAverage)}/月`
          : undefined,
      };
  }
}

export const PERIOD_TEXT: Record<Plan["trafficPeriod"], string> = {
  monthly: "每月重置",
  yearly: "全年总量",
  total: "总量（用完即止）",
  days30: "每 30 天",
  unspecified: "周期未注明",
  unknown: "口径不明",
};

/** 流量文本：保留原口径，年度总量与每月额度严格区分 */
export function trafficLabel(p: Plan): { main: string; note?: string } {
  if (p.trafficGB === null) {
    return { main: p.rawTrafficTexts[0] ?? "—", note: "口径待确认" };
  }
  const gb = fmtGB(p.trafficGB);
  switch (p.trafficPeriod) {
    case "monthly":
      return { main: `${gb}/月` };
    case "yearly":
      return { main: `${gb}/年`, note: "全年总量，非每月" };
    case "total":
      return { main: gb, note: "总量，不按月重置" };
    case "days30":
      return { main: `${gb}/30天` };
    default:
      return { main: gb, note: "重置周期未注明" };
  }
}

/** 用于筛选的“折算月度金额”；一次性包和价格不明返回 null */
export function monthlyEquivalent(p: Plan): number | null {
  if (p.paymentAmount === null || p.paymentMonths === 0) return null;
  return p.paymentAmount / p.paymentMonths;
}

/** 用于筛选的“每月流量”；只有每月重置的方案才有意义 */
export function monthlyTraffic(p: Plan): number | null {
  if (p.trafficGB === null) return null;
  if (p.trafficPeriod === "monthly" || p.trafficPeriod === "days30")
    return p.trafficGB;
  return null;
}

export function budgetBucket(p: Plan): string {
  if (p.paymentMonths === 0) return "onetime";
  const m = monthlyEquivalent(p);
  if (m === null) return "unknown";
  if (m <= 20) return "le20";
  if (m <= 50) return "le50";
  if (m <= 100) return "le100";
  return "gt100";
}

export function trafficBucket(p: Plan): string {
  const t = monthlyTraffic(p);
  if (t === null) return "other";
  if (t < 100) return "lt100";
  if (t <= 300) return "le300";
  if (t <= 700) return "le700";
  return "gt700";
}

export function cycleBucket(p: Plan): string {
  const m = p.paymentMonths;
  if (m === 0) return "onetime";
  if (m === 1) return "monthly";
  if (m === 3 || m === 6) return "quarter";
  if (m === 12) return "annual";
  return "multiyear";
}

/** 每 GB 月成本（元），仅对“月付/多月付 + 每月重置流量”且无冲突的方案计算 */
export function costPerGB(p: Plan): number | null {
  const m = monthlyEquivalent(p);
  const t = monthlyTraffic(p);
  if (m === null || t === null || t === 0 || p.conflicts.length) return null;
  return m / t;
}

export function sortPlans(a: Plan, b: Plan) {
  const ma = a.paymentMonths === 0 ? 999 : a.paymentMonths;
  const mb = b.paymentMonths === 0 ? 999 : b.paymentMonths;
  if (ma !== mb) return ma - mb;
  return (a.paymentAmount ?? 1e9) - (b.paymentAmount ?? 1e9);
}

/** 只有“每月 / 每 30 天”写法不同、价格与流量一致的冲突，不影响起步价判断 */
export function periodOnlyConflict(p: Plan): boolean {
  return (
    p.conflicts.length > 0 && p.conflicts.every(c => c.startsWith("流量周期"))
  );
}

/** 品牌的“月付起步参考”：价格与流量明确、按月或每 30 天重置的最低月付方案 */
export function startingMonthly(
  plans: Plan[],
  providerId: string
): Plan | null {
  const list = plans
    .filter(
      p =>
        p.providerId === providerId &&
        p.paymentMonths === 1 &&
        p.paymentAmount !== null &&
        (p.trafficPeriod === "monthly" || p.trafficPeriod === "days30") &&
        p.trafficGB !== null &&
        (!p.conflicts.length || periodOnlyConflict(p))
    )
    .sort((a, b) => a.paymentAmount! - b.paymentAmount!);
  return list[0] ?? null;
}

export function cycleList(plans: Plan[], providerId: string): string[] {
  const order = [
    "月付",
    "季付",
    "半年付",
    "年付",
    "两年付",
    "三年付",
    "一次性",
  ];
  const set = new Set(
    plans.filter(p => p.providerId === providerId).map(p => p.billingCycle)
  );
  return order.filter(c => set.has(c));
}

/** 起步价来源标签：结算页截图核验 / 历史参考 */
export function evidenceLabel(p: Plan): string {
  return p.currentVerified
    ? `结算页核验 ${p.observedAt ?? ""}`.trim()
    : "历史参考";
}

/** 流量单位后缀：每 30 天重置的写成 /30天，其余月付写 /月 */
export function trafficSuffix(p: Plan): string {
  return p.trafficPeriod === "days30" ? "/30天" : "/月";
}
