/**
 * 本站实测记录（first-party）。
 *
 * 每条记录一个文件：src/data/test-runs/<id>.json，由 scripts/import-test.mjs 生成。
 * - 导入后状态为 pending（待核验），不公开、不计数；
 * - 站长对照原始结果核对无误后执行 `node scripts/import-test.mjs --verify <id>`，状态变为 verified；
 * - 只有 verified 记录出现在网站上，并计入「本站测试」。
 *
 * 字段缺失一律为 null，不得估算或补填。
 */
import { z } from "astro/zod";

export const TOOL_LABEL = {
  speedtest: "Speedtest by Ookla",
  cloudflare: "Cloudflare Speed Test",
  other: "其他工具",
} as const;

export const DATA_SOURCE_LABEL = {
  speedtest_link: "Speedtest 分享链接",
  cloudflare_export: "Cloudflare 测速导出数据",
  screenshot: "测速截图",
} as const;

const evidenceFile = z.object({
  /** public/ 下的公开路径（以 /evidence/ 开头），或 evidence-private/ 下的私有路径 */
  path: z.string(),
  public: z.boolean(),
  kind: z.enum(["screenshot", "export", "other"]),
});

export const testRunSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    brandSlug: z.string(),
    nodeRegion: z.string().min(1),
    nodeName: z.string().nullable().default(null),
    /** ISO 8601，带时区偏移，如 2026-10-15T21:30:00+08:00 */
    testedAt: z.string().refine(v => !Number.isNaN(Date.parse(v)), "时间无效"),
    /** 时间说明：确切时刻未记录时注明，例如「前」表示 testedAt 是上限 */
    timeNote: z.string().nullable().default(null),
    downloadMbps: z.number().positive(),
    uploadMbps: z.number().positive(),
    latencyMs: z.number().positive(),
    jitterMs: z.number().nonnegative().nullable().default(null),
    packetLossPct: z.number().min(0).max(100).nullable().default(null),
    tool: z.enum(["speedtest", "cloudflare", "other"]),
    toolName: z.string().nullable().default(null),
    dataSource: z.enum(["speedtest_link", "cloudflare_export", "screenshot"]),
    evidenceUrl: z.url().nullable().default(null),
    evidenceFiles: z.array(evidenceFile).default([]),
    /** 测速服务器（如 Speedtest 的赞助商节点名） */
    server: z.string().nullable().default(null),
    /** 本地网络：运营商 / 地区 / 带宽 / 设备 / 客户端 / 协议 */
    isp: z.string().nullable().default(null),
    location: z.string().nullable().default(null),
    bandwidth: z.string().nullable().default(null),
    device: z.string().nullable().default(null),
    client: z.string().nullable().default(null),
    protocol: z.string().nullable().default(null),
    notes: z.string().nullable().default(null),
    importedAt: z.string(),
    verification: z.object({
      status: z.enum(["pending", "verified", "rejected"]),
      verifiedAt: z.string().nullable().default(null),
      notes: z.string().nullable().default(null),
    }),
  })
  .refine(r => r.evidenceUrl || r.evidenceFiles.length > 0, {
    message: "缺少原始证据（结果链接或截图/导出文件）",
  })
  .refine(
    r =>
      r.dataSource !== "speedtest_link" ||
      /^https:\/\/(www\.)?speedtest\.net\/(my-)?result\//.test(
        r.evidenceUrl ?? ""
      ),
    { message: "Speedtest 记录必须附 speedtest.net 结果链接" }
  )
  .refine(r => Date.parse(r.testedAt) <= Date.now() + 5 * 60_000, {
    message: "测试时间晚于当前时间",
  });

export type TestRun = z.infer<typeof testRunSchema>;

const files = import.meta.glob<{ default: unknown }>(
  "/src/data/test-runs/[!_]*.json",
  { eager: true }
);

/** 全部记录（含待核验），校验失败会让构建报错，避免错误数据静默上线 */
function loadAll(): TestRun[] {
  return Object.entries(files).map(([file, mod]) => {
    const parsed = testRunSchema.safeParse(mod.default);
    if (!parsed.success) {
      throw new Error(
        `测速记录 ${file} 格式错误：${parsed.error.issues
          .map(i => `${i.path.join(".") || "(记录)"} ${i.message}`)
          .join("；")}`
      );
    }
    const expected = file
      .split("/")
      .pop()!
      .replace(/\.json$/, "");
    if (parsed.data.id !== expected) {
      throw new Error(`测速记录 ${file} 的 id 应为 ${expected}`);
    }
    return parsed.data;
  });
}

const ALL = loadAll();

/** 已核验的本站实测记录，按测试时间从新到旧 */
export function getVerifiedRuns(): TestRun[] {
  return ALL.filter(r => r.verification.status === "verified").sort((a, b) =>
    b.testedAt.localeCompare(a.testedAt)
  );
}

export function runsOf(all: TestRun[], slug: string): TestRun[] {
  return all.filter(r => r.brandSlug === slug);
}

/** 显示用时间：按记录自带的时区偏移输出 YYYY-MM-DD HH:mm（UTC+8） */
export function runTime(r: TestRun): string {
  const m = r.testedAt.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/
  );
  if (!m) return r.testedAt;
  const tz = !m[3] || m[3] === "Z" ? "UTC" : `UTC${m[3].replace(":00", "")}`;
  return `${m[1]} ${m[2]}（${tz}）`;
}

export function runHour(r: TestRun): number | null {
  const m = r.testedAt.match(/T(\d{2}):/);
  return m ? Number(m[1]) : null;
}

export const fmtNum = (n: number) =>
  n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
