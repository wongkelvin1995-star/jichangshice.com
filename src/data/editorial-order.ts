/**
 * 编辑精选顺序：全站唯一来源。
 * 首页精选、机场推荐、机场目录、套餐比较、优惠码表和品牌页的“编辑精选 No.x”都按这里的顺序。
 * 这是编辑安排，不是测速排名。调整顺序只改这个数组；新增品牌时必须加进来，否则构建报错。
 */
export const EDITORIAL_ORDER = [
  "lingdongyun", // 1. 灵动云
  "muguang", // 2. 暮光加速
  "feimaoyun", // 3. 飞猫云
  "dalaoyun", // 4. 大佬云
  "breezenet", // 5. 微风网络
  "flyv", // 6. 飞V
  "laddercloud", // 7. 梯子云
  "wavenet", // 8. 浪网
  "yinxingren", // 9. 隐形人
  "stardream", // 10. 星岛梦
  "lightspeed", // 11. 光速云
  "v2yun", // 12. 唯兔云
  "u1s1", // 13. U1S1
  "jilianyun", // 14. 极连云
  "quanqiuyun", // 15. 全球云
  "guangnianti", // 16. 光年梯
  "sogoyun", // 17. Sogo云
  "yuzhouyun", // 18. 宇宙云
  "ermaoyun", // 19. 二猫云
  "yifanyun", // 20. 一翻云
  "edgenova", // 21. 边缘节点
  "kexinyun", // 22. 可信云
  "sujie", // 23. 速界
  "kuaili", // 24. 快狸
  "wuyou", // 25. 无忧
  "lingmao", // 26. 灵猫
  "flashleap", // 27. 闪跃
  "firefly", // 28. 飞为
  "kuajie", // 29. 跨界
  "liulianyun", // 30. 榴莲云
  "shandianyun", // 31. 闪电云
  "huanqiuyun", // 32. 环球云
  "shenxingyun", // 33. 神行云
  "yunjieyun", // 34. 云界云
] as const;

/** 首页与目录顶部展示的“编辑精选”家数（站长 2026-10-16 确认为 5 家） */
export const FEATURED_COUNT = 5;
