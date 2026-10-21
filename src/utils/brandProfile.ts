/**
 * 优惠码资料表的行数据：每 GB 单价 + 品牌资料（成立年份、协议、付款方式、解锁、特色）。
 * 只使用站内已保存的数据；没有可靠资料的字段返回 null / 空数组，页面显示“—”。
 */
import profilesFile from "@/data/provider-profiles.json";
import { startingMonthly, type Plan, type Provider } from "./plans";

type Profile = {
  founded: string | null;
  freeAccess: boolean | null;
  protocols: string[];
  payments: string[];
  ownClient: boolean;
  unlock: string[];
  source: string;
};
const PROFILES = profilesFile.profiles as Record<string, Profile>;
export const PROFILE_CHECKED_AT = profilesFile.checkedAt;

/** 表格只列这四项，保持各行整齐 */
const UNLOCK_ORDER = ["ChatGPT", "Netflix", "Disney+", "TikTok"];
const PROTOCOL_ORDER = ["VLESS", "Trojan", "Shadowsocks", "Hysteria2"];
/** 站长 2026-10-15 确认：付款方式统一显示“支付宝” */
export const PAYMENTS_ALL = ["支付宝"];

const uniq = (xs: string[], order: string[]) =>
  [...new Set(xs)].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

export type BrandRow = {
  slug: string;
  name: string;
  search: string;
  url: string | null;
  entryUrl: string | null;
  coupon: string | null;
  couponNote: string | null;
  /** 每 GB 单价（元），按最低价月付档、每月流量计算；无准确数据为 null */
  perGB: number | null;
  /** 计算依据，如 “¥20 / 100GB 月付” */
  perGBBasis: string | null;
  perGBObservedAt: string | null;
  perGBVerified: boolean;
  founded: string | null;
  freeAccess: boolean | null;
  protocols: string[];
  payments: string[];
  unlock: string[];
  features: string[];
};

export function brandRows(providers: Provider[], plans: Plan[]): BrandRow[] {
  return providers.map(p => {
    const prof = PROFILES[p.slug];
    const s: Plan | null = startingMonthly(plans, p.slug);
    const perGB =
      s && s.paymentAmount && s.trafficGB
        ? Math.round((s.paymentAmount / s.trafficGB) * 100) / 100
        : null;
    const claims = p.claims;
    const features = [
      ...(claims?.lineTypes ?? []),
      ...(prof?.ownClient ? ["自研客户端"] : []),
    ];
    return {
      slug: p.slug,
      name: p.name,
      search: [p.name, p.englishName ?? "", ...p.aliases, ...p.pinyin]
        .join(" ")
        .toLowerCase(),
      url: p.hasProfile ? `/airports/${p.slug}/` : null,
      entryUrl: p.entryUrl,
      coupon: p.coupon,
      couponNote: p.couponNote,
      perGB,
      perGBBasis: s ? `¥${s.paymentAmount} / ${s.trafficGB}GB 月付` : null,
      perGBObservedAt: s?.observedAt ?? null,
      perGBVerified: s?.currentVerified ?? false,
      founded: prof?.founded ?? null,
      freeAccess: prof?.freeAccess ?? null,
      protocols: uniq(
        [...(claims?.protocols ?? []), ...(prof?.protocols ?? [])],
        PROTOCOL_ORDER
      ),
      payments: PAYMENTS_ALL,
      unlock: uniq(
        [
          ...(claims?.ai ?? []),
          ...(claims?.streaming ?? []),
          ...(prof?.unlock ?? []),
        ].filter(x => UNLOCK_ORDER.includes(x)),
        UNLOCK_ORDER
      ),
      features: [...new Set(features)],
    };
  });
}
