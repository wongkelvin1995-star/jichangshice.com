import { defineAstroPaperConfig } from "./src/types/config";

/**
 * 站点主配置。正式域名、站名、TG 入口都只在这里改。
 * 本项目基于 AstroPaper（MIT License）定制。
 */
export default defineAstroPaperConfig({
  site: {
    url: "https://jichangshice.com.cn",
    title: "机场测试",
    // 首页 <title>：品牌 + 核心主题
    homeTitle: "机场测试｜2026 机场测试与机场推荐、套餐比较与测速记录",
    description:
      "机场测试整理 34 家机场的套餐价格与每 GB 成本，按编辑精选顺序推荐机场，公开测速记录与测试方法，并提供 Clash 订阅导入教程和故障排查指南。",
    author: "机场测试编辑部",
    ogImage: "og-default.png",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  // 本站 Telegram 入口；留空字符串则页眉和页脚自动隐藏 TG 图标
  telegramUrl: "https://t.me/+rXmeYjh4Yv5hNjM1",
  // 本站 GitHub 入口（机场实测专题文章 Issue #1）；留空字符串则页眉自动隐藏 GitHub 图标
  githubUrl: "https://github.com/wongkelvin1995-star/jichangshice.com/issues/1",
  posts: {
    perPage: 12,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: false,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: false,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [],
  shareLinks: [],
});
