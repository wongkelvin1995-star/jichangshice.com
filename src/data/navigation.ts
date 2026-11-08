/**
 * 页眉主导航：测速数据与在线测速排在最前（与首页的信息顺序一致）。
 * 桌面页眉的内容区最宽 1240px，放 6 个入口、搜索框和个人中心刚好；再多会把 logo 挤没（1536px 以上的宽屏也一样，
 * 因为内容区宽度不再增加）。使用教程、优惠码等其余栏目放在手机菜单和页脚（见 FULL_NAV）。
 */
export const MAIN_NAV: { href: string; label: string }[] = [
  { href: "/speedtest/", label: "机场测速" },
  { href: "/test-records/", label: "测试档案" },
  { href: "/recommendations/", label: "机场推荐" },
  { href: "/airports/", label: "机场目录" },
  { href: "/compare/", label: "套餐比较" },
  { href: "/testing-methodology/", label: "测试方法" },
];

/** 手机菜单与页脚的完整栏目 */
export const FULL_NAV = [
  { href: "/recommendations/", label: "机场推荐" },
  { href: "/airports/", label: "机场目录" },
  { href: "/coupons/", label: "优惠码" },
  { href: "/compare/", label: "套餐比较" },
  { href: "/testing-methodology/", label: "测试方法" },
  { href: "/test-records/", label: "测试档案" },
  { href: "/speedtest/", label: "机场测速" },
  { href: "/guides/", label: "新手教程" },
  { href: "/clients/", label: "客户端" },
  { href: "/routes/", label: "线路知识" },
  { href: "/troubleshooting/", label: "故障排查" },
  { href: "/ai/", label: "AI 使用" },
  { href: "/faq/", label: "常见问题" },
];

export const FOOTER_LINKS = [
  { href: "/about/", label: "关于本站" },
  { href: "/disclosure/", label: "合作说明" },
  { href: "/contact/", label: "联系" },
  { href: "/privacy/", label: "隐私说明" },
  { href: "/archives/", label: "文章归档" },
  { href: "/sitemap-index.xml", label: "站点地图" },
  { href: "/rss.xml", label: "RSS" },
];
