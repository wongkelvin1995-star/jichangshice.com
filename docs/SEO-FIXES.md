# SEO-FIXES：本次已修复的问题与修改文件（2026-10-23）

分支 `seo-audit-2026-10-23`，**未推送正式环境**。回滚：`git checkout main`，或在合并后 `git revert <合并提交>`；审核前的状态打了标记 `backup-before-seo-audit-2026-10-23`。

| # | 问题 | 修改文件 | 差异摘要 | 验证 |
|---|---|---|---|---|
| 1 | 品牌页 JSON-LD 的发布/修改日期在页面上看不到 | `src/pages/airports/[slug].astro` | 首屏新增「测评更新 <time>」；「最后核验」改为按状态显示「结算页核验 / 套餐资料整理」 | 构建通过；脚本复查 JSON-LD 日期均可见 |
| 2 | 灵动云 60 节点公开数据被写成灵动云自己的测速记录 | `src/content/airports/lingdongyun.md`、`src/content/posts/ai/ai-airports-2026.md`、`src/content/posts/routes/hk-jp-sg-nodes.md` | 标题改为「附节点在线核验与公开测速参考」；新增节点在线核验段落；三处加注「数据与梯子云、暮光加速重合，品牌归属未确认」；modDatetime 2026-10-23 | 全站搜索「60 节点」均带说明 |
| 3 | 「本站目前没有发布实测」等说法会与节点核验矛盾 | `src/pages/recommendations/index.astro`、`src/content/pages/disclosure.md` | 改为「只有节点在线核验，还没有本站测速数据」；合作说明 updated 2026-10-23 | — |
| 4 | 测试方法类页面关键词互相竞争（「测速方法」出现在 3 个标题） | `src/content/pages/testing-methodology.md`、`src/content/posts/methods/airport-testing-guide.md`、`src/content/posts/methods/peak-hour-testing.md` | 方法页→「本站测试标准与节点检测工具」；指南→主攻「机场测试指南 / 节点延迟」；晚高峰→「晚高峰稳定性怎么测」；URL 不变 | 标题唯一；见 KEYWORD-MAP |
| 5 | 品牌测速页站内入链只有 2 个 | `src/pages/test-records/[slug].astro` | 底部新增「其他机场的测速记录」导航；有节点核验但无公开记录的品牌也会生成页面 | 每页入链 ≥ 3 |
| 6 | `/favicon.ico` 404 | `public/favicon.ico`、`public/apple-touch-icon.png`（新）、`src/layouts/Layout.astro` | 由现有 favicon.svg 生成；head 增加 icon 与 apple-touch-icon | 构建产物存在 |
| 7 | 缺 HSTS、静态资源不缓存、搜索索引可被收录 | `public/_headers`（新） | 全站 HSTS（1 年，不含子域、不 preload）；`/_astro/*` 长期缓存；`search-index.json`、`deploy-id.txt`、IndexNow 密钥文件 `X-Robots-Tag: noindex` | 部署后用浏览器查看响应头 |
| 8 | 未配置 IndexNow | `public/c51aaf46ff4f886e1468286abf32ae35.txt`、`scripts/indexnow.mjs`、`src/pages/deploy-id.txt.ts`、`.github/workflows/indexnow.yml`（新） | 推送 main → 等线上 `/deploy-id.txt` 等于本次提交 → 只提交 lastmod 晚于上一次提交的 URL；打印真实状态码；429/5xx 重试 3 次；手动运行可选 `all` | 本地用模拟接口测过筛选与重试；真实响应待部署 |
| 9 | 缺统一的来源记录字段 | `src/utils/sourceRecord.ts`（新） | `SourceRecord`：sourceUrl、sourceName、dataDate、checkedAt、evidence、status、note；提供公开测速、节点核验、套餐、优惠码四种转换；状态含「本站已核验 / 结算页核验 / 公开参考 / 服务商公布 / 历史参考 / 待验证」 | 通过类型检查 |
| 10 | 导入脚本配置是旧版本 | `scripts/manual-plans.json` | 恢复云界云结算页登记，与现有数据一致 | JSON 比对 |
| 11 | 旧文件残留 | 删除 `src/content/home/airport-testing-guide.md`、`src/components/HeroDiagram.astro` | 都没有被引用 | 构建通过 |
| 12 | 图标文件被附加元数据 | `public/favicon.svg`、`public/og-default.png` | 恢复原文件 | 432 B / 67 KB |
| 13 | 部署说明写旧仓库 | `docs/deploy.md` | 改为 `wongkelvin1995-star/jichangshice.com` | — |

## 未改动（有意保留）

- 34 家品牌资料、326 档套餐、全部推广链接与邀请码、编辑精选前 5 家顺序、全部文章 URL。
- 文章内指向「晚高峰测试如何安排」等的锚文本：它们是自然描述，不需要与新标题一致，改动会让多篇文章无谓地更新日期。
- 比较页 326 档表格：没有性能问题证据，拆分会影响比较功能。

## 检查结果（本分支）

- `pnpm run build`：astro check 0 错误 0 警告；108 页、104 可索引、Sitemap 104 条；postbuild 检查全部通过。
- `pnpm run lint`、`prettier --check`：通过。
- Playwright 375 px / 1440 px 全站 107 页：无横向溢出、无脚本错误、无 4xx 资源；导航 23 个链接全部可用。
- 功能：中文搜索（灵动云、暮光、梯子云、机场测试、晚高峰、Clash、拂风、ldy88、lingdong、无结果、Enter、Esc）、比较页 `?brands=` 筛选（18 / 326 档）、优惠码表排序/协议筛选/搜索/复制、FAQ 104 问、收藏与个人中心、节点在线核验图表（57 行、4 张截图）、推广链接 rel、页眉 GitHub 图标 —— 全部正常。
