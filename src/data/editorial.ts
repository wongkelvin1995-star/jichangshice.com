/** 编辑短评：只写资料里能核对的事实，不写测速结论 */
export const BRAND_BLURBS: Record<string, string> = {
  lingdongyun:
    "月付三档 ¥20/100GB、¥50/300GB、¥100/700GB 在多份资料中写法一致，另有大流量月付、年付与一次性流量包。",
  muguang:
    "月付 ¥20 起，¥40 档流量有 240GB 与 300GB 两种记录；另有年付轻量版与三档不限时流量包。",
  feimaoyun:
    "月付四档覆盖 150GB 到 1000GB，年付 ¥84 为每月 50GB 额度，另有不限时套餐。",
  dalaoyun:
    "结算页核验：¥19.99/月 100GB 起，月付各档每 30 天重置，另有年付活动包和不限时流量包。",
  breezenet:
    "月付乘风 ¥27/200GB 起，破风、御风两档到 1200GB；年付清风 ¥137，每月 100GB。",
};

/** 首页按用途导读（链接到对应文章） */
export const USE_CASES = [
  {
    title: "AI 工具与办公",
    text: "ChatGPT、Claude 等工具能不能用，要按节点逐项检查：打开、登录、完成任务。",
    href: "/methods/ai-streaming-checks/",
    cta: "查看检查方法",
    icon: "ai",
  },
  {
    title: "高清视频与晚高峰",
    text: "看视频先关注晚上 8 点到 11 点的表现，单次测速说明不了长期稳定。",
    href: "/methods/peak-hour-testing/",
    cta: "了解晚高峰测试",
    icon: "video",
  },
  {
    title: "预算有限、追求性价比",
    text: "先估算每月流量，再在够用的档位里比较每 GB 成本，新用户先月付。",
    href: "/guides/how-to-choose-plan/",
    cta: "按预算选套餐",
    icon: "wallet",
  },
  {
    title: "手机与平板",
    text: "Android 与 iOS 的客户端、订阅格式和后台策略不同，导入前先对一遍。",
    href: "/clients/android-ios-import/",
    cta: "手机导入教程",
    icon: "phone",
  },
];

/** 首页“机场资料”列表一行短句（事实型） */
export const BRAND_TAGLINES: Record<string, string> = {
  lingdongyun: "月付三档梯度清楚 · 另有一次性流量包",
  muguang: "¥20 档每月 120GB · 有年付与不限时包",
  feimaoyun: "年付折合约 ¥7/月 · 月付四档可选",
  dalaoyun: "¥19.99 档每 30 天 100GB · 结算页核验",
  breezenet: "入门档每月 200GB · 年付清风 100GB/月",
};
