/**
 * 机场实测图：把站长一次真实测速的结果排版成汇总图，并附上原始测速截图。
 *
 * 规则：
 * - 每个数值都必须能在原始截图里找到；截图里没有的项目写「未测」，不要估算。
 * - 原始截图放 public/evidence/<id>/，发布前打码出口 IP、账号和订阅链接。
 * - 汇总图放 public/images/tests/，新的一条放在数组最前面。
 * - 测试时间确认后，再按 docs/test-record-template.md 导入 src/data/test-runs/，
 *   核验通过即计入「本站测试（已核验）」。
 */
export type TestPhotoMetric = { label: string; value: string };

export type TestPhoto = {
  id: string;
  brandSlug: string;
  /** 测试日期 YYYY-MM-DD（北京时间） */
  date: string;
  /** 测试时刻；截图里没有、站长也没提供时为 null */
  time: string | null;
  /** 发布到网站的时间（带时区），用作 Sitemap lastmod */
  publishedAt: string;
  /** 汇总图 */
  src: string;
  width: number;
  height: number;
  nodeRegion: string;
  /** 测速工具 / 网页 */
  tool: string;
  server: string | null;
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  jitterMs: number | null;
  packetLossPct: number | null;
  /** 其他截图上有的数值，按截图原样列出 */
  extra: TestPhotoMetric[];
  /** 原始测速截图（已打码） */
  evidence: string[];
  note: string;
};

export const TEST_PHOTOS: TestPhoto[] = [];

export const photosOf = (slug: string) =>
  TEST_PHOTOS.filter(p => p.brandSlug === slug);
