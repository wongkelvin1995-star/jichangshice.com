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

export const TEST_PHOTOS: TestPhoto[] = [
  {
    id: "lingdongyun-hk-2026-10-23",
    brandSlug: "lingdongyun",
    date: "2026-10-23",
    time: "13:53 前",
    publishedAt: "2026-10-23T13:55:00+08:00",
    src: "/images/tests/lingdongyun-hk-2026-10-23.webp",
    width: 1200,
    height: 1943,
    nodeRegion: "香港",
    tool: "IPCheck.ing 网速测试（代理开启状态）",
    server: "HKG（Hong Kong，中国香港）",
    downloadMbps: 22.35,
    uploadMbps: 16.82,
    latencyMs: 52.39,
    jitterMs: 10.89,
    packetLossPct: null,
    extra: [
      { label: "出口地区", value: "中国香港（出口 IP 已打码）" },
      { label: "下载时延迟", value: "84.67 ms" },
      { label: "上传时延迟", value: "439.72 ms" },
      { label: "测试流量", value: "下载 50 MB · 上传 15 MB" },
      {
        label: "工具质量评分",
        value: "在线视频 差 · 在线游戏 差 · 视频会议 较差",
      },
      {
        label: "网站连通性（10 个均可连接）",
        value:
          "Google 51 · YouTube 56 · Cloudflare 74 · Claude 71 · ChatGPT 54 · Spotify 164 · Twitch 86 · Disney+ 67 · HBO Max 71 · Apple TV+ 55（ms）",
      },
    ],
    evidence: [
      "/evidence/lingdongyun-hk-2026-10-23/speedtest.webp",
      "/evidence/lingdongyun-hk-2026-10-23/connectivity.webp",
    ],
    note: "单次测试，测速流量经由代理；网站连通性只表示能连上及连接延迟，不代表流媒体或账号地区解锁；质量评分由 IPCheck.ing 自动给出。",
  },
  {
    id: "lingdongyun-us-2026-10-23",
    brandSlug: "lingdongyun",
    date: "2026-10-23",
    time: "12:15",
    publishedAt: "2026-10-23T12:25:00+08:00",
    src: "/images/tests/lingdongyun-us-2026-10-23.webp",
    width: 1200,
    height: 1742,
    nodeRegion: "美国",
    tool: "IPCheck.ing 网速测试（代理开启状态）",
    server: "SLC（Salt Lake City，美国）",
    downloadMbps: 16.83,
    uploadMbps: 14.04,
    latencyMs: 204.05,
    jitterMs: 3.39,
    packetLossPct: null,
    extra: [
      { label: "出口地区", value: "美国（出口 IP 已打码）" },
      { label: "下载时延迟", value: "267 ms" },
      { label: "上传时延迟", value: "754.95 ms" },
      { label: "测试流量", value: "下载 50 MB · 上传 15 MB" },
      {
        label: "工具质量评分",
        value: "在线视频 差 · 在线游戏 差 · 视频会议 差",
      },
    ],
    evidence: ["/evidence/lingdongyun-us-2026-10-23/speedtest.webp"],
    note: "单次测试，测速流量经由代理；质量评分由 IPCheck.ing 自动给出，不代表流媒体解锁情况。",
  },
];

export const photosOf = (slug: string) =>
  TEST_PHOTOS.filter(p => p.brandSlug === slug);
