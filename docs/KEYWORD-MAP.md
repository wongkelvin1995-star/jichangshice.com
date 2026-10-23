# KEYWORD-MAP：重要 URL 与主要关键词对应（2026-10-23）

原则：一个主要关键词只对应一个主页面；其他页面用描述性锚文本链接过去，不再用同一个词做标题核心。URL 一律不改。
搜索量：本站没有取得关键词工具或 Bing / GSC 的数据，**下表不写搜索量**；上线后用 Bing Webmaster Tools「关键词研究」和「搜索效果」补充。

## 主题与主页面

| 主题 | 主要关键词 | 主页面 | 辅助页面（链接到主页面） | 本次调整 |
|---|---|---|---|---|
| 网站总主题 | 机场测试 | `/` | `/methods/`、`/test-records/` | — |
| 2026 机场推荐 | 机场推荐、2026 机场推荐、稳定机场 | `/recommendations/` | `/airports/`、各品牌页 | — |
| 性价比机场 | 性价比机场、便宜机场推荐 | `/guides/value-airports-2026/` | `/recommendations/`、`/compare/` | — |
| 机场套餐比较 | 机场套餐比较、机场套餐价格 | `/compare/` | `/guides/how-to-choose-plan/`、`/guides/annual-vs-monthly-vs-onetime/` | — |
| 机场优惠码 | 机场优惠码、品牌名+优惠码 | `/coupons/` | 各品牌页 | — |
| 测试与测速记录 | 机场测速记录、机场测试档案 | `/test-records/` | 各品牌测速页 | 品牌测速页互相链接 |
| 测试标准 / 工具 | 节点检测工具、机场测速标准 | `/testing-methodology/` | `/methods/record-node-speed-test/` | 标题去掉「机场测速方法」，避免与指南竞争 |
| 测试方法总览 | 机场测试方法 | `/methods/` | 各方法文章 | — |
| 入门指南 / 节点延迟 | 机场测试指南、节点延迟多少算正常 | `/methods/airport-testing-guide/` | `/methods/metrics-speed-latency-loss/` | 标题改为「测哪些指标、节点延迟多少算正常」；primaryKeyword 改为「机场测试指南」 |
| 测速结果解读 | 机场测速教程、Speedtest 结果 | `/methods/speedtest-results-explained/` | `/methods/record-node-speed-test/` | — |
| 晚高峰稳定性 | 晚高峰稳定性、机场晚高峰 | `/methods/peak-hour-testing/` | `/routes/node-region-isp/`、`/troubleshooting/subscription-update-failed/` | 标题改为「晚高峰稳定性怎么测」 |
| Clash 机场推荐 | Clash 机场推荐 | `/clients/clash-airports-2026/` | `/clients/clash-subscription-import/` | — |
| Clash 订阅导入 | Clash 订阅导入、Clash Verge Rev | `/clients/clash-subscription-import/` | `/clients/windows-setup/`、`/clients/macos-setup/` | — |
| 客户端安装 | Windows / macOS / Android / iOS 客户端 | `/clients/` 及 3 篇平台文章 | `/faq/` | — |
| AI 机场 | AI 机场推荐、ChatGPT / Claude 访问 | `/ai/ai-airports-2026/` | `/ai/`、`/ai/chatgpt-ok-claude-blocked/` | — |
| AI 测试方案 | AI 网络测试 | `/ai/ai-network-test-plan/` | `/methods/ai-streaming-checks/` | — |
| 线路知识 | IPLC 和 IEPL 区别、BGP、VLESS | `/routes/iplc-iepl-bgp-vless/` | `/routes/verify-line-claims/` | — |
| 节点地区 | 香港 / 日本 / 新加坡节点怎么选 | `/routes/hk-jp-sg-nodes/` | `/routes/exit-ip-native-ip/` | — |
| 故障排查 | 订阅更新失败、节点超时、开了代理打不开 | `/troubleshooting/` 及 5 篇文章 | `/faq/` | — |
| 风险避坑 | 机场跑路 | `/guides/airport-runaway-signs/` | `/guides/check-before-buying/` | — |
| 入门概念 | 机场是什么、机场和 VPN 区别 | `/guides/what-is-airport/` | `/faq/` | — |
| 品牌词 | 品牌名+机场 / 测评 / 价格 / 套餐 | `/airports/<slug>/`（34 页） | `/test-records/<slug>/`、`/coupons/` | 品牌页显示测评更新日期 |

## 互相竞争检查结果

| 词 | 原来出现在标题里的页面 | 处理 |
|---|---|---|
| 测速方法 | `/testing-methodology/`、`/methods/airport-testing-guide/`、`/methods/`（「机场测试方法」） | 前两页改标题，各自主攻「测试标准与工具」「测试指南 / 节点延迟」 |
| 机场测试 | `/`、`/methods/airport-testing-guide/`（primaryKeyword 同为「机场测试」） | 指南改为「机场测试指南」 |
| 晚高峰 | `/methods/peak-hour-testing/`；首页与指南正文提到 | 晚高峰文章独占「晚高峰稳定性」 |
| 机场推荐 | `/`（站名副标题）、`/recommendations/` | 保留：首页主攻「机场测试」，推荐页主攻「机场推荐」；首页「机场推荐」链接指向推荐页 |
| 便宜 / 性价比 | `/recommendations/`（副标题「便宜机场」）、`/guides/value-airports-2026/` | 保留：推荐页是总入口，性价比文章是细分页，二者互相链接 |

## 内链原则

- 锚文本用读者能看懂的描述（例如「IPLC 和 IEPL 的区别」「Clash 订阅导入教程」），不堆叠关键词，不在一段里重复同一个锚文本。
- 每篇文章至少链接到 1 个同栏目页面和 1 个相关主页面（本次检查 30 篇全部满足）。
- 品牌页 ↔ 品牌测速页 ↔ 优惠码页互链；品牌测速页之间互链（本次新增）。
