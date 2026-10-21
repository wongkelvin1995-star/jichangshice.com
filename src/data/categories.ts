import type { CATEGORY_SLUGS } from "@/content.config";

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Category = {
  slug: CategorySlug;
  name: string;
  /** 栏目页 <title> */
  title: string;
  description: string;
  /** 栏目页正文导语（真实内容，不是占位） */
  intro: string;
};

export const CATEGORIES: Record<CategorySlug, Category> = {
  methods: {
    slug: "methods",
    name: "测试方法",
    title: "机场测试方法：测速、延迟、丢包与晚高峰记录",
    description:
      "机场测试方法栏目：怎样记录一次可复核的节点测速，延迟、下载速度、丢包和可用率分别说明什么，晚高峰与长期测试如何安排。",
    intro:
      "测速截图本身不能说明一个机场好不好，关键是记录了什么条件。这个栏目讲清楚各项指标的含义、一次测试应该写下哪些信息，以及单次结果能推出什么、不能推出什么。",
  },
  guides: {
    slug: "guides",
    name: "新手教程",
    title: "机场新手教程：概念、选购与套餐比较",
    description:
      "机场新手教程：机场、订阅、节点是什么，和商业 VPN 有什么区别；按流量、预算和付款周期选择套餐，购买前需要核对的条款。",
    intro:
      "第一次接触机场，最容易被各种名词和价格表绕晕。这里从概念讲起，再到怎么估算流量、怎么比较月付和年付，最后是付款前值得逐条确认的规则。",
  },
  clients: {
    slug: "clients",
    name: "客户端",
    title: "客户端教程：Clash、v2rayN、sing-box 订阅导入",
    description:
      "客户端使用教程：Windows、macOS、Android、iOS 上导入订阅的步骤，Clash 类客户端的规则模式、系统代理与 TUN 区别。",
    intro:
      "机场提供的是订阅，真正让设备用上线路的是客户端。按操作系统选择客户端、找到正确的订阅格式，是避免大部分连接问题的第一步。",
  },
  routes: {
    slug: "routes",
    name: "线路知识",
    title: "线路知识：IPLC、IEPL、BGP 与协议区别",
    description:
      "线路知识栏目：IPLC、IEPL、BGP、中转、直连分别描述什么，VLESS、Trojan 等协议和线路的区别，节点地区与本地网络为何影响体验。",
    intro:
      "套餐介绍里常见的 IPLC、IEPL、BGP 和 VLESS 并不是同一层面的概念。弄清楚它们分别描述什么，才能读懂宣传，也知道哪些说法需要自己验证。",
  },
  troubleshooting: {
    slug: "troubleshooting",
    name: "故障排查",
    title: "故障排查：订阅更新失败、节点超时与连接问题",
    description:
      "机场故障排查：订阅更新失败、节点全部超时、客户端显示已连接却无法上网等问题，按账号、网络、客户端、订阅、节点的顺序逐项排查。",
    intro:
      "遇到连不上，先别急着换机场。多数问题出在订阅过期、客户端版本、系统代理冲突或本地网络上，按固定顺序排查通常几分钟就能定位。",
  },
  ai: {
    slug: "ai",
    name: "AI 使用",
    title: "AI 机场使用：ChatGPT、Claude、Gemini 访问测试与排查",
    description:
      "AI 使用栏目：怎样选择适合 ChatGPT、Claude、Gemini 的机场与节点，网页、登录、对话、API 分别怎么测，AI 平台不可用时如何区分 IP 限制和账号限制。",
    intro:
      "能打开 AI 网站不等于能正常使用。这个栏目讲清楚 AI 平台对网络地区的要求、怎样一步步验证节点是否真正可用，以及遇到地区限制、登录循环时按什么顺序排查。",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
