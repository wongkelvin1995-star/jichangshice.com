/**
 * 优惠码核验状态。
 * 只有在服务商结算页实际输入并看到折扣生效的优惠码，才登记在这里（品牌 slug → 核验日期）。
 * 未登记的优惠码一律显示“待验证”：由站长提供，尚未经结算页确认折扣幅度与适用范围。
 */
export const COUPON_VERIFIED: Record<string, string> = {};

export function couponVerifiedAt(slug: string): string | null {
  return COUPON_VERIFIED[slug] ?? null;
}
