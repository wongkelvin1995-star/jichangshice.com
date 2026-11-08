import { defineAstroPaperConfig } from "./src/types/config";

/**
 * 站点主配置。正式域名、站名、TG 入口都只在这里改。
 * 本项目基于 AstroPaper（MIT License）定制。
 */
export default defineAstroPaperConfig({
  site: {
    url: "https://jichangshice.com.cn",
    // 主品牌名：机场实测。“机场测试”是读者常用的搜索说法，作为相关搜索词保留（见 altNames 与各页正文）
    title: "机场实测",
    altNames: ["机场测试"],
    // 首页 <title>：品牌 + 首页最先展示的内容（测速数据、测试档案、在线测速）
    homeTitle: "机场实测｜2026 机场测速数据、测试档案与在线测速工具",
    // 不写具体数量：数量会变化，首页 description 另按真实统计生成
    description:
      "机场实测（也称机场测试）公开机场测速数据与测试档案，注明每条数据的测试地点、运营商、工具和原始证据；提供在线机场测速工具，并整理各家机场的套餐价格、每 GB 成本与编辑精选资料。",
    author: "机场实测编辑部",
    ogImage: "og-default.png",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
    // 只放真实存在的官方页面
    sameAs: ["https://github.com/wongkelvin1995-star/jichangshice.com"],
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
