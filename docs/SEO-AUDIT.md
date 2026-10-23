# SEO-AUDIT：jichangshice.com.cn 技术与内容审核（2026-10-23）

审核分支：`seo-audit-2026-10-23`；备份标记：`backup-before-seo-audit-2026-10-23`（指向审核前的 main `e19701a`）。
框架：Astro 7 静态站（content collections + TypeScript + Tailwind 4），部署 Cloudflare Pages，输出 `dist/`，构建命令 `pnpm run build`（astro check + astro build + `scripts/postbuild-check.mjs`）。

状态标记：**已实际验证** = 本次用浏览器或脚本实测得到证据；**已修复** = 本分支已改代码并通过构建；**待网站后台确认** = 需要站长在 Cloudflare / Bing 后台操作或查看；**未能检查** = 本环境无法取得证据。

> 最重要的发现：**正式站点停在 2026-10-16 的版本**。Cloudflare Pages 项目仍连接已不存在的旧仓库 `wongkelvinhaha/jichangshice`，新仓库 `wongkelvin1995-star/jichangshice.com` 的推送不会触发部署；账号又已达到 Pages 项目数软上限。线上检测反映的是旧版本，本分支的修复要在重新接通部署后才会生效。

## 一、正式环境实测（2026-10-23 11:20–11:30，浏览器对线上站点请求）

| 项目 | 结果 | 证据 | 风险 | 状态 |
|---|---|---|---|---|
| robots.txt | 200，`User-agent: * / Allow: /`，`Sitemap: https://jichangshice.com.cn/sitemap-index.xml` | 线上原文 | 无 | 已实际验证 |
| Sitemap | `sitemap-index.xml` → `sitemap-0.xml`，104 条，71 条带 lastmod；逐条请求：全部 200、无 noindex、无 X-Robots-Tag、canonical 等于自身、每页 1 个 H1 | 脚本逐条请求 104 个 URL，异常 0 | 无 | 已实际验证 |
| HTTP → HTTPS | `http://…/airports/?x=1` 被转到 `https://…/airports/?x=1` | 浏览器导航结果 | 无法读取状态码，推测为 Cloudflare「始终使用 HTTPS」 | 已实际验证（状态码未能检查） |
| **www → 主域** | `https://www.jichangshice.com.cn/guides/` **直接返回页面，没有跳转** | 浏览器导航结果 | 两个主机名重复；canonical 指向主域，可减轻但不能替代 301 | 待网站后台确认（Cloudflare 重定向规则） |
| 无斜杠 / index.html | `/airports/lingdongyun`、`/airports/lingdongyun/index.html` 都重定向 | fetch redirect=manual | 无 | 已实际验证 |
| 404 | `/airports/notreal/`、`/posts/`、`/tags/`、`/page/2/` 返回真实 404 + noindex，不是软 404 | 状态码 404 | 无 | 已实际验证 |
| 大小写 | `/airports/LingDongYun/` 返回 404（不是重复页） | 状态码 404 | 无 | 已实际验证 |
| 参数页 | `/compare/?brands=…`、`/coupons/?sort=asc`、`/airports/?page=2`、`/?utm_source=…` 都返回 200，canonical 指向无参数地址；`/search/?q=…` 为 noindex | 页面 canonical / robots | 低：靠 canonical 合并 | 已实际验证 |
| X-Robots-Tag | 所有检查页面均无 | 响应头 | 无 | 已实际验证 |
| 压缩 / 缓存 | HTML 为 brotli；`cache-control: public, max-age=0, must-revalidate`；无 HSTS | 响应头 | 静态资源每次重新验证；无 HSTS | 已修复（`public/_headers`，部署后生效） |
| `/favicon.ico` | 404 | 状态码 | Bing 结果中的站点图标可能缺失 | 已修复（新增 favicon.ico、apple-touch-icon） |
| `/search-index.json` | 200，可被抓取（约 440 KB） | 状态码 | 可能被当作文档收录 | 已修复（`X-Robots-Tag: noindex`） |
| Bing 站点验证标签 | 首页没有 `msvalidate.01` | 页面源码 | 若 Bing 后台是用其他方式验证则无影响 | 待网站后台确认 |
| lang | 全部页面 `lang="zh-CN"`，正文为简体 | 108 页统计 | 无 | 已实际验证 |
| Bingbot 是否被 Cloudflare 拦截 | 浏览器访问正常；无法用 Bingbot IP / UA 测试 | — | 若开启 Bot Fight Mode 可能误拦 | 未能检查 → 用 Bing「URL 检查」实测 |
| 部署是否最新 | 线上首页没有 GitHub 图标、测试档案没有节点在线核验（这两项 10-21 已推送新仓库） | 页面源码 | 新内容、修复都不会上线 | 待网站后台确认（重新连接仓库） |

## 二、构建产物逐页审核（本分支 `dist/`，108 个 HTML）

脚本：逐页解析 title、description、canonical、robots、H1、lang、面包屑、JSON-LD、站内链接、推广链接 rel、正文长度、页面相似度。

| 检查 | 结果 | 状态 |
|---|---|---|
| 可索引页面 | 104 个（noindex：/search/、/user/、/test-records/submit/、404） | 已实际验证 |
| Title / Description | 104 个可索引页全部唯一；Title 都不超过 60 字；Description 最短 50 字（/archives/），中文字数在 Bing 摘要展示范围内 | 已实际验证 |
| H1 | 每页恰好 1 个 | 已实际验证 |
| Canonical | 全部等于自身规范 URL | 已实际验证 |
| 面包屑 | 除首页外全部有 BreadcrumbList，且页面上可见 | 已实际验证 |
| JSON-LD | BreadcrumbList 103、Article 65、ItemList 8、WebSite 1；全部可解析；**没有** Review / AggregateRating / Product 评分 | 已实际验证 |
| JSON-LD 与可见内容 | **问题**：34 个品牌页 Article 的 datePublished / dateModified 在页面上看不到（页面只显示套餐「最后核验」日期） | 已修复：品牌页首屏显示「测评更新 YYYY-MM-DD」（`<time datetime>`）；套餐日期按状态显示「结算页核验」或「套餐资料整理」 |
| 首屏可抓取内容 | 静态生成，正文、表格、链接都在初始 HTML；JS 只负责搜索、筛选、收藏、测速表和节点检测 | 已实际验证 |
| 推广链接 | 带 `code=` 的链接全部含 `sponsored nofollow`（并有 noopener noreferrer） | 已实际验证 |
| 站内链接 | 无断链；**问题**：16 个 `/test-records/<品牌>/` 页面只有 2 个站内入链 | 已修复：每个品牌测速页底部加「其他机场的测速记录」，入链 ≥ 3 |
| 内容重复 | 34 个品牌页两两相似度（8 字片段 Jaccard）最高 0.16，中位数 0.05；文章最高 0.18 | 已实际验证：没有只换品牌名的批量页 |
| 薄内容 | /contact/（323 字）、/privacy/、/disclosure/ 正文较短，属功能页 | 可接受，不改 |
| 图片 alt | 全部图片有 alt | 已实际验证 |

## 三、性能（本地实验室数据，不等于真实用户 CWV）

| 页面 | HTML（gzip） | LCP（本地，ms） | CLS | DOM 节点 |
|---|---|---|---|---|
| / | 15.5 KB | 352 | 0 | 767 |
| /compare/ | 20.0 KB | 484 | 0 | 4400 |
| /coupons/ | 19.1 KB | 624 | 0 | 1668 |
| /airports/lingdongyun/ | 18.3 KB | 588 | 0 | 1174 |

- CSS 1 个（gzip 12.7 KB），JS 合计 38 KB，按页面分块；不加载网络字体；背景动画遵守 `prefers-reduced-motion`。
- /compare/ 有 326 档套餐，DOM 4400 个节点，是全站最重的页面；目前 CLS 为 0、LCP 快，暂不拆分，以免影响比较功能。
- 真实 LCP / INP / CLS：**未能检查**（需要线上流量；Lighthouse 在本环境不可用）。上线后看 Bing Webmaster Tools 或 Cloudflare Web Analytics。

## 四、IndexNow

线上：**未配置**（已实际验证：`/c51aaf46ff4f886e1468286abf32ae35.txt` 线上 404）。本分支已加入，详见 SEO-FIXES.md 与 INDEXING-CHECKLIST.md。真实接口响应要部署后才有：**未能检查**。

## 五、内容可信度

| 检查 | 结果 | 状态 |
|---|---|---|
| 「本站测试」 | 只有 1 条：灵动云节点在线核验（2026-10-21，截图 4 张，57/57 在线；日本2、新加坡8、新加坡9 未在截图中）。没有本站测速数据 | 已实际验证 |
| 公开参考 | 37 批、21 家，逐条注明来源、日期、核对日期；不计入本站测试 | 已实际验证 |
| **灵动云 60 节点数据** | TowerNav「灵动云」、梯子云官方 GitHub、纳云「暮光加速」三处资料的时间、节点数和峰值完全一致；记录里已有 sharedData 说明，但灵动云测评标题、描述和两篇文章仍把它当作灵动云的测速记录 | 已修复：标题改为「附节点在线核验与公开测速参考」，正文与两篇文章加注「品牌归属未确认，只作参考」 |
| 其他重合 | 17 批 jichangtj.co 快照：测试端和工具相同，但各品牌数值没有重复；14 家只有这一来源 | 已实际验证：没有发现数值重合；单一来源依赖列入 CONTENT-GAPS |
| 「本站目前没有发布实测」等说法 | 推荐页（2 处）、合作说明的说法在节点核验上线后会过时 | 已修复：改为「只有节点在线核验，还没有本站测速数据」 |
| 优惠码 | 34 个全部显示「待验证」，没有任何「有效」「亲测」字样 | 已实际验证 |
| 套餐 | 326 档：51 档结算页核验（6 家），18 档来源不一致（6 家），其余为历史参考；页面按状态显示 | 已实际验证 |
| 日期 | 只有本次真实修改的页面更新了 modDatetime / updated；Sitemap lastmod 只取内容文件日期 | 已修复 |

## 六、仓库状态问题（本次发现）

| 问题 | 影响 | 处理 |
|---|---|---|
| `scripts/manual-plans.json` 是旧版本，缺少云界云的结算页登记 | 下次运行导入脚本会把云界云 6 档从「结算页核验」退回历史参考 | 已修复：恢复为与现有数据一致的版本 |
| `src/content/home/airport-testing-guide.md`、`src/components/HeroDiagram.astro` 是电脑同步留下的旧文件，没有被引用 | 不影响页面，但会误导维护 | 已修复：删除 |
| `public/favicon.svg`（10 KB）、`public/og-default.png` 被附加了文件元数据 | 图标体积从 432 B 变成 10 KB | 已修复：恢复原文件 |
| `docs/deploy.md` 仍写旧仓库名 | 部署说明错误 | 已修复 |
