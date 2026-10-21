/**
 * 本站节点在线核验（已核验）。
 *
 * 数据逐条转录自服务商用户面板「节点状态」页的截图，截图原图保存在 public/evidence/ 下，
 * 已逐个核对节点名、节点 ID、状态、倍率和最后检查时间。
 * 在线状态只说明节点在检查时刻可以连接，不代表速度；截图里没有出现的节点不推定状态。
 */
export type NodeCheckItem = {
  id: number;
  name: string;
  status: "online" | "offline";
  multiplier: string;
  /** 面板显示的最后检查时间（HH:mm:ss，北京时间） */
  checkedAt: string;
};

export type NodeCheck = {
  id: string;
  brandSlug: string;
  /** 检查日期 YYYY-MM-DD（北京时间） */
  date: string;
  /** 截图里出现的最早、最晚检查时间 */
  from: string;
  to: string;
  source: string;
  /** 截图中没有出现的节点（只列出名称和 ID，不推定状态） */
  notShown: { id: number; name: string }[];
  evidence: string[];
  /** 发布到网站的时间，用作 Sitemap lastmod */
  publishedAt: string;
  nodes: NodeCheckItem[];
};

export const NODE_CHECKS: NodeCheck[] = [
  {
    id: "lingdongyun-nodes-2026-10-21",
    brandSlug: "lingdongyun",
    date: "2026-10-21",
    from: "18:57:32",
    to: "18:58:30",
    source: "灵动云用户面板 · 节点状态页",
    notShown: [
      { id: 31, name: "日本2" },
      { id: 47, name: "新加坡8" },
      { id: 48, name: "新加坡9" },
    ],
    evidence: [1, 2, 3, 4].map(
      n => `/evidence/lingdongyun-nodes-2026-10-21/panel-${n}.webp`
    ),
    publishedAt: "2026-10-21T20:55:00+08:00",
    nodes: [
      {
        id: 1,
        name: "香港01",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:43",
      },
      {
        id: 2,
        name: "香港02",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:42",
      },
      {
        id: 3,
        name: "香港03",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:41",
      },
      {
        id: 4,
        name: "香港04",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:39",
      },
      {
        id: 5,
        name: "香港05",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:41",
      },
      {
        id: 6,
        name: "香港06",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:42",
      },
      {
        id: 7,
        name: "香港08",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:43",
      },
      {
        id: 8,
        name: "香港09",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:44",
      },
      {
        id: 9,
        name: "香港10",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:42",
      },
      {
        id: 10,
        name: "香港11",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:43",
      },
      {
        id: 11,
        name: "香港12",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:41",
      },
      {
        id: 12,
        name: "香港13",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:43",
      },
      {
        id: 13,
        name: "香港14",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:42",
      },
      {
        id: 14,
        name: "香港15",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:44",
      },
      {
        id: 15,
        name: "香港16",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:43",
      },
      {
        id: 16,
        name: "香港17",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:43",
      },
      {
        id: 17,
        name: "香港18",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:44",
      },
      {
        id: 18,
        name: "香港19",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:42",
      },
      {
        id: 19,
        name: "香港20",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:44",
      },
      {
        id: 20,
        name: "台湾1",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:38",
      },
      {
        id: 21,
        name: "台湾2",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:38",
      },
      {
        id: 22,
        name: "台湾3",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:33",
      },
      {
        id: 23,
        name: "台湾4",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:40",
      },
      {
        id: 24,
        name: "台湾5",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:30",
      },
      {
        id: 25,
        name: "台湾6",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:34",
      },
      {
        id: 26,
        name: "台湾7",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:04",
      },
      {
        id: 27,
        name: "台湾8",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:27",
      },
      {
        id: 28,
        name: "台湾9",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:44",
      },
      {
        id: 29,
        name: "台湾10",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:41",
      },
      {
        id: 30,
        name: "日本1",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:39",
      },
      {
        id: 32,
        name: "日本3",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:32",
      },
      {
        id: 33,
        name: "日本4",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:40",
      },
      {
        id: 34,
        name: "日本5",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:34",
      },
      {
        id: 35,
        name: "日本6",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:42",
      },
      {
        id: 36,
        name: "日本7",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:34",
      },
      {
        id: 37,
        name: "日本8",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:40",
      },
      {
        id: 38,
        name: "日本9",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:47",
      },
      {
        id: 39,
        name: "日本10",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:43",
      },
      {
        id: 40,
        name: "新加坡1",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:06",
      },
      {
        id: 41,
        name: "新加坡2",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:40",
      },
      {
        id: 42,
        name: "新加坡3",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:41",
      },
      {
        id: 43,
        name: "新加坡4",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:17",
      },
      {
        id: 44,
        name: "新加坡5",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:25",
      },
      {
        id: 45,
        name: "新加坡6",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:23",
      },
      {
        id: 46,
        name: "新加坡7",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:01",
      },
      {
        id: 49,
        name: "新加坡10",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:26",
      },
      {
        id: 50,
        name: "美国1",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:00",
      },
      {
        id: 51,
        name: "美国2",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:52",
      },
      {
        id: 52,
        name: "美国3",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:58",
      },
      {
        id: 53,
        name: "美国4",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:03",
      },
      {
        id: 54,
        name: "美国5",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:54",
      },
      {
        id: 55,
        name: "美国6",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:00",
      },
      {
        id: 56,
        name: "美国7",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:00",
      },
      {
        id: 57,
        name: "美国8",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:02",
      },
      {
        id: 58,
        name: "美国9",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:58:03",
      },
      {
        id: 59,
        name: "美国10",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:58",
      },
      {
        id: 60,
        name: "香港07",
        status: "online",
        multiplier: "1x",
        checkedAt: "18:57:44",
      },
    ],
  },
];

export const nodeChecksOf = (slug: string) =>
  NODE_CHECKS.filter(c => c.brandSlug === slug);

/** 节点名去掉编号得到地区，如「香港07」→「香港」 */
export const regionOf = (name: string) => name.replace(/\d+$/, "");
