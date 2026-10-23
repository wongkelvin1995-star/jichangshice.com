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
    id: "lingdongyun-us-2026-10-23",
    brandSlug: "lingdongyun",
    date: "2026-10-23",
    time: "14:30 前",
    publishedAt: "2026-10-23T14:31:00+08:00",
    src: "/images/tests/lingdongyun-us-2026-10-23.webp",
    width: 1200,
    height: 2191,
    nodeRegion: "美国",
    tool: "IPCheck.ing 网速测试（代理开启状态）",
    server: "SLC（Salt Lake City，美国）",
    downloadMbps: 18.25,
    uploadMbps: 15.52,
    latencyMs: 203.95,
    jitterMs: 11.98,
    packetLossPct: null,
    extra: [
      { label: "测试地点", value: "中国大陆 · 广东省广州市天河区" },
      {
        label: "出口 IP 归属",
        value: "美国 犹他州德雷珀 · Komi LLC（AS401243），IP 已打码",
      },
      { label: "下载时延迟", value: "276.8 ms" },
      { label: "上传时延迟", value: "306.3 ms" },
      { label: "测试流量", value: "下载 50 MB · 上传 15 MB" },
      {
        label: "工具质量评分",
        value: "在线视频 差 · 在线游戏 差 · 视频会议 差",
      },
      {
        label: "网站连通性（15 个均可连接，较慢）",
        value:
          "Google 210 · YouTube 216 · Cloudflare 217 · Claude 213 · ChatGPT 207 · Spotify 215 · Twitch 211 · Disney+ 280 · HBO Max 239 · Apple TV+ 216 · Steam 236 · PlayStation 227 · Xbox 224 · Nintendo 219 · EA 225（ms）",
      },
    ],
    evidence: [
      "/evidence/lingdongyun-us-2026-10-23/speedtest.webp",
      "/evidence/lingdongyun-us-2026-10-23/connectivity.webp",
      "/evidence/lingdongyun-us-2026-10-23/ip-info.webp",
    ],
    note: "单次测试，测速流量经由代理；网站连通性只表示能连上及连接延迟，不代表流媒体或账号地区解锁；质量评分由 IPCheck.ing 自动给出。",
  },
  {
    id: "lingdongyun-hk-2026-10-23",
    brandSlug: "lingdongyun",
    date: "2026-10-23",
    time: "14:22 前",
    publishedAt: "2026-10-23T14:27:00+08:00",
    src: "/images/tests/lingdongyun-hk-2026-10-23.webp",
    width: 1200,
    height: 2191,
    nodeRegion: "香港",
    tool: "IPCheck.ing 网速测试（代理开启状态）",
    server: "HKG（Hong Kong，中国香港）",
    downloadMbps: 24.1,
    uploadMbps: 12.96,
    latencyMs: 58.35,
    jitterMs: 12.07,
    packetLossPct: null,
    extra: [
      { label: "测试地点", value: "中国大陆 · 广东省广州市天河区" },
      {
        label: "出口 IP 归属",
        value: "中国香港 中西区 · Lshiy LLC（AS32167），IP 已打码",
      },
      { label: "下载时延迟", value: "130.9 ms" },
      { label: "上传时延迟", value: "625.75 ms" },
      { label: "测试流量", value: "下载 50 MB · 上传 15 MB" },
      {
        label: "工具质量评分",
        value: "在线视频 差 · 在线游戏 差 · 视频会议 差",
      },
      {
        label: "网站连通性（15 个均可连接）",
        value:
          "Google 52 · YouTube 53 · Cloudflare 66 · Claude 65 · ChatGPT 64 · Spotify 166 · Twitch 90 · Disney+ 74 · HBO Max 69 · Apple TV+ 91 · Steam 96 · PlayStation 68 · Xbox 71 · Nintendo 85 · EA 79（ms）",
      },
    ],
    evidence: [
      "/evidence/lingdongyun-hk-2026-10-23/speedtest.webp",
      "/evidence/lingdongyun-hk-2026-10-23/connectivity.webp",
      "/evidence/lingdongyun-hk-2026-10-23/ip-info.webp",
    ],
    note: "单次测试，测速流量经由代理；网站连通性只表示能连上及连接延迟，不代表流媒体或账号地区解锁；质量评分由 IPCheck.ing 自动给出。",
  },
  {
    id: "lingdongyun-sg-2026-10-23",
    brandSlug: "lingdongyun",
    date: "2026-10-23",
    time: "14:19 前",
    publishedAt: "2026-10-23T14:21:00+08:00",
    src: "/images/tests/lingdongyun-sg-2026-10-23.webp",
    width: 1200,
    height: 2191,
    nodeRegion: "新加坡",
    tool: "IPCheck.ing 网速测试（代理开启状态）",
    server: "SIN（Singapore，新加坡）",
    downloadMbps: 18.14,
    uploadMbps: 13.93,
    latencyMs: 26.33,
    jitterMs: 9,
    packetLossPct: null,
    extra: [
      { label: "测试地点", value: "中国大陆 · 广东省广州市天河区" },
      {
        label: "出口 IP 归属",
        value:
          "新加坡 South West · SOUTHEAST ASIA TELECOM（AS9664），IP 已打码",
      },
      { label: "下载时延迟", value: "131.2 ms" },
      { label: "上传时延迟", value: "291.7 ms" },
      { label: "测试流量", value: "下载 50 MB · 上传 15 MB" },
      {
        label: "工具质量评分",
        value: "在线视频 较差 · 在线游戏 较差 · 视频会议 一般",
      },
      {
        label: "网站连通性（15 个均可连接）",
        value:
          "Google 22 · YouTube 27 · Cloudflare 216 · Claude 48 · ChatGPT 44 · Spotify 113 · Twitch 21 · Disney+ 54 · HBO Max 53 · Apple TV+ 26 · Steam 49 · PlayStation 35 · Xbox 47 · Nintendo 24 · EA 53（ms）",
      },
    ],
    evidence: [
      "/evidence/lingdongyun-sg-2026-10-23/speedtest.webp",
      "/evidence/lingdongyun-sg-2026-10-23/connectivity.webp",
      "/evidence/lingdongyun-sg-2026-10-23/ip-info.webp",
    ],
    note: "单次测试，测速流量经由代理；网站连通性只表示能连上及连接延迟，不代表流媒体或账号地区解锁；质量评分由 IPCheck.ing 自动给出。",
  },
  {
    id: "lingdongyun-jp-2026-10-23",
    brandSlug: "lingdongyun",
    date: "2026-10-23",
    time: "14:14 前",
    publishedAt: "2026-10-23T14:16:00+08:00",
    src: "/images/tests/lingdongyun-jp-2026-10-23.webp",
    width: 1200,
    height: 2191,
    nodeRegion: "日本",
    tool: "IPCheck.ing 网速测试（代理开启状态）",
    server: "NRT（Tokyo，日本）",
    downloadMbps: 24.92,
    uploadMbps: 21.49,
    latencyMs: 100,
    jitterMs: 17.95,
    packetLossPct: null,
    extra: [
      { label: "测试地点", value: "中国大陆 · 广东省广州市天河区" },
      {
        label: "出口 IP 归属",
        value: "日本 千叶县船桥市 · Dodo K.K.（AS45691），IP 已打码",
      },
      { label: "下载时延迟", value: "175 ms" },
      { label: "上传时延迟", value: "751.45 ms" },
      { label: "测试流量", value: "下载 50 MB · 上传 15 MB" },
      {
        label: "工具质量评分",
        value: "在线视频 差 · 在线游戏 差 · 视频会议 差",
      },
      {
        label: "网站连通性（15 个均可连接）",
        value:
          "Google 92 · YouTube 93 · Cloudflare 113 · Claude 115 · ChatGPT 103 · Spotify 159 · Twitch 89 · Disney+ 101 · HBO Max 131 · Apple TV+ 88 · Steam 114 · PlayStation 102 · Xbox 116 · Nintendo 89 · EA 123（ms）",
      },
    ],
    evidence: [
      "/evidence/lingdongyun-jp-2026-10-23/speedtest.webp",
      "/evidence/lingdongyun-jp-2026-10-23/connectivity.webp",
      "/evidence/lingdongyun-jp-2026-10-23/ip-info.webp",
    ],
    note: "单次测试，测速流量经由代理；网站连通性只表示能连上及连接延迟，不代表流媒体或账号地区解锁；质量评分由 IPCheck.ing 自动给出。",
  },
];

export const photosOf = (slug: string) =>
  TEST_PHOTOS.filter(p => p.brandSlug === slug);
