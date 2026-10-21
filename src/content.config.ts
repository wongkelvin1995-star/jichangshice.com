import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

/** 文章分类 = URL 第一段。新增分类时同时修改 src/data/categories.ts */
export const CATEGORY_SLUGS = [
  "methods",
  "guides",
  "clients",
  "routes",
  "troubleshooting",
  "ai",
] as const;

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: z.object({
    title: z.string(),
    /** 列表、侧栏用的短标题；H1 始终用完整 title */
    shortTitle: z.string().optional(),
    /** meta description：按正文单独撰写，建议 70–120 个汉字 */
    description: z.string().min(40),
    category: z.enum(CATEGORY_SLUGS),
    author: z.string().default(config.site.author),
    pubDatetime: z.date(),
    /** 只有实质修改才填写 */
    modDatetime: z.date().optional().nullable(),
    draft: z.boolean().optional(),
    featured: z.boolean().optional(),
    /** 内部关键词规划用，不输出 meta keywords */
    primaryKeyword: z.string().optional(),
    /** 关联文章（同分类或跨分类的 slug，格式 category/slug） */
    related: z.array(z.string()).default([]),
    /** “适合谁阅读”，不填则使用栏目默认说明 */
    audience: z.string().optional(),
    /** 关联品牌 slug */
    providers: z.array(z.string()).default([]),
    timezone: z.string().optional(),
  }),
});

/** 品牌人工分析：存在文件的品牌页才会被索引 */
const airports = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/airports" }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(40),
    pubDatetime: z.date(),
    modDatetime: z.date().optional().nullable(),
  }),
});

/** 关于、披露、联系、隐私、测试方法、FAQ 等独立页面 */
const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(30),
    updated: z.date(),
    showToc: z.boolean().default(false),
    /** FAQ 页输出 FAQPage 结构化数据所需的问答（必须与正文一致） */
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }),
});

const claimList = z.array(z.string()).default([]);

const providers = defineCollection({
  loader: file("src/data/providers.json"),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    englishName: z.string().nullable(),
    aliases: z.array(z.string()),
    pinyin: z.array(z.string()),
    editorialOrder: z.number().int(),
    entryUrl: z.url().nullable(),
    entryIsAffiliate: z.boolean(),
    coupon: z.string().nullable(),
    couponNote: z.string().nullable(),
    couponCheckedAt: z.string().nullable(),
    claims: z
      .object({
        lineTypes: claimList,
        protocols: claimList,
        ai: claimList,
        streaming: claimList,
        evidence: z.enum([
          "third_party_claim",
          "provider_claim",
          "official_verified",
          "site_tested",
        ]),
      })
      .nullable(),
    sourceUrls: z.array(z.string()),
    historicalPlanCount: z.number().int(),
    hasProfile: z.boolean(),
    reviewStatus: z.enum(["reference_analysis", "listing_only", "site_tested"]),
    updatedAt: z.string(),
  }),
});

const plans = defineCollection({
  loader: file("src/data/plan-snapshots.json"),
  schema: z.object({
    planId: z.string(),
    providerId: z.string(),
    name: z.string().nullable(),
    altNames: z.array(z.string()),
    currency: z.literal("CNY"),
    /** 付款金额；null = 来源不一致，不能当 0，也不参与最低价 */
    paymentAmount: z.number().nullable(),
    amountOptions: z.array(z.number()).nullable(),
    /** 0 = 一次性/不限时 */
    paymentMonths: z.number().int(),
    billingCycle: z.string(),
    /** 仅多月付款时计算的折算月均；不是实际月付价 */
    monthlyAverage: z.number().nullable(),
    trafficGB: z.number().nullable(),
    /** monthly 每月重置；yearly 全年总量；total 一次性总量；days30 每 30 天；unspecified/unknown 来源未写明 */
    trafficPeriod: z.enum([
      "monthly",
      "yearly",
      "total",
      "days30",
      "unspecified",
      "unknown",
    ]),
    rawTrafficTexts: z.array(z.string()),
    rawPriceTexts: z.array(z.string()),
    sourceUrls: z.array(z.string()),
    sourceProjects: z.array(z.string()),
    observedAt: z.string().nullable(),
    importedAt: z.string(),
    evidenceStatus: z.enum([
      "historical_reference",
      "provider_claim",
      "official_verified",
      "site_tested",
      "conflicting",
      "expired",
    ]),
    currentVerified: z.boolean(),
    conflicts: z.array(z.string()),
    /** 编辑备注：如结算页卡片标签与说明文字不一致 */
    notes: z.array(z.string()).default([]),
  }),
});

/**
 * 公开测速记录档案（src/data/test-records.json）。
 * 这里只放「公开测速参考」：public_record = 公开测速记录；vendor_claim = 服务商公布的测速。
 * 本站实测不放这里，见 src/data/test-runs/ 与 src/utils/testRuns.ts。methodology = 仅方法说明。未记录的字段为 null，不得猜测。
 */
const nullableStr = z.string().nullable().optional();
const testRecords = defineCollection({
  loader: file("src/data/test-records.json"),
  schema: z.object({
    brandSlug: z.string(),
    sourceType: z.enum([
      "first_party",
      "public_record",
      "vendor_claim",
      "methodology",
    ]),
    sourceName: z.string(),
    sourceUrl: z.url(),
    recordedAt: z.string(),
    time: nullableStr,
    window: nullableStr,
    timezone: nullableStr,
    testLocation: nullableStr,
    carrier: nullableStr,
    bandwidthMbps: z.number().nullable().optional(),
    device: nullableStr,
    client: nullableStr,
    tool: nullableStr,
    protocol: nullableStr,
    latencyMethod: nullableStr,
    unit: z.string(),
    nodeCount: z.number().int().nullable().optional(),
    rows: z.array(
      z.object({
        region: nullableStr,
        node: nullableStr,
        time: nullableStr,
        window: nullableStr,
        latency: nullableStr,
        download: nullableStr,
        upload: nullableStr,
        ai: nullableStr,
        media: nullableStr,
        note: nullableStr,
        evidenceUrl: z.url().nullable().optional(),
      })
    ),
    ai: nullableStr,
    media: nullableStr,
    notes: nullableStr,
    /** 与其他来源数据重合（疑似同一次测试）的披露说明 */
    sharedData: nullableStr,
    limitations: z.array(z.string()),
    sourceCheckedAt: z.string(),
  }),
});

/** 本站实测记录（src/data/test-runs/*.json）不在内容集合中：由 src/utils/testRuns.ts 读取并校验，
 * 只有 verification.status = "verified" 的记录会公开展示和计数。导入方法见 docs/test-record-template.md。 */

export const collections = {
  posts,
  airports,
  pages,
  providers,
  plans,
  testRecords,
};
