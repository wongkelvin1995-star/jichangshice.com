# 机场测试 · jichangshice.com.cn

[![网站](https://img.shields.io/badge/网站-jichangshice.com.cn-1a6dff)](https://jichangshice.com.cn)
[![Astro](https://img.shields.io/badge/Astro-7-0b1a33)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-0f9f8f)](https://tailwindcss.com)
[![部署](https://img.shields.io/badge/部署-Cloudflare_Pages-c27a05)](docs/deploy.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-5b6780)](LICENSE)

中文机场资料、套餐比较、测试方法与客户端教程网站。基于 [AstroPaper](https://github.com/satnaing/astro-paper)（MIT）定制，Astro 7 + TypeScript + Tailwind CSS 4 + 站内中文搜索（构建时生成 `search-index.json`），纯静态输出，部署在 Cloudflare Pages。

- 正式站点：<https://jichangshice.com.cn>
- Telegram：<https://t.me/+rXmeYjh4Yv5hNjM1>

## 目录

- [常用命令](#常用命令)
- [目录职责](#目录职责)
- [主题与设计](#主题与设计)
- [SEO](#seo)
- [数据原则](#数据原则)
- [日常维护](#日常维护)

## 常用命令

```bash
pnpm install --frozen-lockfile
pnpm run dev          # 本地开发 http://localhost:4321（搜索需先 build 一次）
pnpm run build        # 类型检查 + 构建（含搜索索引）+ 构建后 SEO/死链检查
pnpm run preview      # 预览生产构建
pnpm run import:data  # 从历史资料重新生成品牌与套餐数据（仅站长本地可用）
pnpm run check:dist   # 单独运行构建后检查
pnpm run lint
pnpm run format       # Prettier 格式化
```

需要 Node.js ≥ 22.12，pnpm 10+（`packageManager` 固定为 pnpm@10.28.0）。

## 目录职责

| 路径                                      | 内容                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `astro-paper.config.ts`                   | 站名、正式域名、首页标题、描述、OG 图、TG 入口等全站配置（只改这里）                        |
| `src/content/posts/<栏目>/`               | 文章 Markdown（栏目：methods、guides、clients、routes、troubleshooting、ai）                |
| `src/content/airports/<slug>.md`          | 品牌人工分析；有此文件的品牌页才会被索引                                                    |
| `src/content/pages/`                      | 关于、合作说明、联系、隐私、测试方法、FAQ                                                   |
| `src/data/editorial-order.ts`             | 编辑精选顺序与首页精选家数（唯一来源）                                                      |
| `src/data/coupon-status.ts`               | 已在结算页核验的优惠码                                                                      |
| `src/data/providers.json`                 | 品牌资料（由脚本生成，勿手改）                                                              |
| `src/data/plan-snapshots.json`            | 套餐历史快照（由脚本生成，勿手改）                                                          |
| `src/data/test-runs/`                     | 本站真实测试记录（目前为空，模板见 `docs/test-record-template.md`）                         |
| `src/data/categories.ts`、`navigation.ts` | 栏目定义（标题、描述、导语）与导航                                                          |
| `src/styles/`                             | 主题变量 `theme.css`、全局样式 `global.css`、正文排版 `typography.css`                      |
| `src/components/`                         | 页眉、页脚、搜索、套餐表、测速、目录等组件                                                  |
| `src/layouts/`                            | 基础布局（SEO 头部）与说明页布局                                                            |
| `src/utils/jsonld.ts`                     | 结构化数据（JSON-LD）生成函数                                                               |
| `src/pages/`                              | 路由：`/`、`/airports/`、`/airports/[slug]/`、`/compare/`、`/[栏目]/`、`/[栏目]/[文章]/` 等 |
| `scripts/provider-registry.json`          | 品牌名单、别名、入口链接（站长提供）                                                        |
| `scripts/import-history.py`               | 历史资料导入、去重、冲突标注（仅在站长本地，不进公开仓库）                                  |
| `scripts/import-test.mjs`                 | 导入并核验本站测速记录                                                                      |
| `scripts/postbuild-check.mjs`             | 构建后检查（title/description/canonical/死链/Sitemap/robots/推广 rel）                      |
| `private-imports/`                        | 原始历史资料与导入报告（仅在站长本地，不进公开仓库，不会被打包或发布）                      |
| `docs/`                                   | 关键词地图、内容计划、部署说明、SEO 运营手册、GSC 检查清单、验收报告、TG 文案               |

## 主题与设计

### 视觉方向

深海军蓝 + 信号蓝，冷灰底 + 白色卡片。版式为两层页眉 / 深色精选区 / 卡片式品牌榜 / 文章三栏。目前只启用浅色模式（`features.lightAndDarkMode: false`，`<html data-theme="light">`）。

### 色板

所有颜色定义在 `src/styles/theme.css` 的 CSS 变量里，并通过 `@theme inline` 映射成 Tailwind 工具类（如 `bg-card`、`text-accent`、`border-border`）。改色只改变量，不要在组件里写死色值。

| 变量                  | 色值      | Tailwind 类           | 用途                     |
| --------------------- | --------- | --------------------- | ------------------------ |
| `--background`        | `#f3f7fd` | `bg-background`       | 页面底色                 |
| `--card`              | `#ffffff` | `bg-card`             | 卡片                     |
| `--surface`           | `#f1f6fe` | `bg-surface`          | 次级区块                 |
| `--foreground`        | `#111c33` | `text-foreground`     | 正文文字                 |
| `--muted-foreground`  | `#5b6780` | `text-muted-foreground` | 辅助文字               |
| `--ink` / `--ink-soft`| `#0b1a33` / `#14284a` | `bg-ink`  | 深色精选区、页眉         |
| `--accent`            | `#1a6dff` | `text-accent`         | 主色：链接、按钮、焦点框 |
| `--accent-strong`     | `#0f55d8` | `bg-accent-strong`    | 按钮悬停                 |
| `--accent-soft`       | `#e8f1ff` | `bg-accent-soft`      | 主色浅底                 |
| `--signal`            | `#0f9f8f` | `text-signal`         | 测速、已验证等正向状态   |
| `--gold`              | `#c27a05` | `text-gold`           | 编辑精选、优惠标记       |
| `--warn`              | `#9a5b00` | `text-warn`           | 待验证、来源冲突提示     |
| `--border`            | `#e1e9f5` | `border-border`       | 分割线与边框             |

`--signal`、`--gold`、`--warn` 各有对应的 `-soft` 浅底色。

### 字体与排版

- 正文：`PingFang SC`、`Hiragino Sans GB`、`Microsoft YaHei`、`Noto Sans SC` 等系统中文字体（不加载网络字体），工具类 `font-app`。
- 数字与代码：`JetBrains Mono` → `Consolas` 等等宽字体，工具类 `font-num`；代码高亮主题 `github-light`（Shiki，自动换行）。
- 长文：`.app-prose`（`src/styles/typography.css`，基于 `@tailwindcss/typography`），正文 17px、行高 1.85，阅读宽度 `max-w-read`（760px）。
- 用户可在个人中心把字号调为“较大”（112.5%），偏好存在本地浏览器，首屏前应用避免闪烁。

### 布局尺寸

| 项目       | 值                                              |
| ---------- | ----------------------------------------------- |
| 内容最大宽 | `max-w-app` 1240px，左右留白 16px / 24px（sm+） |
| 页眉高度   | 68px（手机 60px），锚点跳转自动留出页眉高度     |
| 圆角       | `--radius` 16px；按钮 10px                      |
| 卡片阴影   | `--shadow-card`（蓝灰双层阴影）                 |
| 按钮       | `.btn`，最小高度 44px（触屏可点）               |

### 移动端与无障碍

- Markdown 表格自动包在 `.table-scroll` 容器中，只在表格内横向滑动；320px 宽度下整页无横向溢出。
- 所有链接、按钮键盘聚焦时显示主色焦点框（`focus-visible`）。
- 站外链接新窗口打开并带 `noopener noreferrer`（`src/utils/rehypeExternalLinks.ts`）。

## SEO

### 全站配置

在 `astro-paper.config.ts` 中修改：

| 字段               | 当前值                                                        |
| ------------------ | ------------------------------------------------------------- |
| `site.url`         | `https://jichangshice.com.cn`                                 |
| `site.title`       | 机场测试                                                      |
| `site.homeTitle`   | 机场测试｜2026 机场测试与机场推荐、套餐比较与测速记录         |
| `site.description` | 机场测试整理 34 家机场的套餐价格与每 GB 成本……（首页与 RSS）  |
| `site.author`      | 机场测试编辑部                                                |
| `site.ogImage`     | `public/og-default.png`（1200×630）                           |
| `site.lang`        | `zh-CN`，时区 `Asia/Shanghai`                                 |

### 页面头部（`src/layouts/Layout.astro`）

每个页面都通过 `Layout` 的 props 输出：

- `<title>` 与 `meta description`：每页独立撰写；文章、栏目、说明页的 description 在内容文件里写（schema 要求文章至少 40 字，建议 70–120 个汉字）。
- `canonical`：正式域名 + 带结尾斜杠的路径（`trailingSlash: "always"`）。
- Open Graph / Twitter Card：`og:title`、`og:description`、`og:url`、`og:image`（1200×630）、`summary_large_image`；文章页另有 `article:published_time` / `modified_time`。
- `noindex, follow`：搜索页、404、个人中心、测速提交页，以及没有人工分析的品牌页。
- 站长验证：环境变量 `PUBLIC_GOOGLE_SITE_VERIFICATION`、`PUBLIC_BING_SITE_VERIFICATION`（用 HTML 标签方式验证时填写；推荐直接用 DNS 验证）。
- 另输出 RSS、Sitemap、favicon 与站内搜索索引的 `<link>`。

### 结构化数据（`src/utils/jsonld.ts`）

| 页面            | 类型                         |
| --------------- | ---------------------------- |
| 首页            | `WebSite` + `Organization`   |
| 文章、品牌分析  | `Article`                    |
| 全站            | `BreadcrumbList`             |
| FAQ 页          | `FAQPage`（仅用于正文完整展示的问答） |
| 目录、推荐列表  | `ItemList`                   |

不使用 `Review` / `AggregateRating`：本站暂无本站实测评分，结构化数据必须与页面内容一致。

### 抓取与索引

- **Sitemap**：`@astrojs/sitemap` 生成 `/sitemap-index.xml`。排除搜索页、404、个人中心、测速提交页，以及 `src/content/airports/` 里没有分析文件的品牌页（与页面 noindex 规则一致）。`lastmod` 取内容 front matter 的真实日期（`modDatetime` > `pubDatetime` > `updated`），不用构建日期；首页取全站最新内容日期。
- **robots.txt**：`Allow: /` 并指向 Sitemap；不 Disallow noindex 页面，保证爬虫能读到 noindex。
- **RSS**：`/rss.xml`，包含全部已发布文章。
- **推广链接**：只由 `<EntryLink>` 组件输出，统一 `rel="sponsored nofollow noopener noreferrer"`，新窗口打开；Markdown 正文里不写推广链接。
- **内链**：面包屑、文章相关阅读、品牌页“怎么读 / 购买后怎么用”、首页导读、FAQ 互链；正文 H2/H3 自动生成目录。

### 构建后检查

`pnpm run build` 的最后一步运行 `scripts/postbuild-check.mjs`，有错误时构建失败：

- title / description 缺失或重复（description 少于 40 字符给出警告）
- 每页必须恰好 1 个 `<h1>`
- canonical 缺失或与实际地址不一致
- 站内死链、不存在的锚点、`href="#"` 假链接
- 推广入口缺少 `sponsored/nofollow`，新窗口链接缺少 `noopener`
- JSON-LD 无法解析
- 残留旧站域名或模板字样
- Sitemap：非正式域名、指向不存在页面、包含 noindex 页面、漏收可索引页面
- robots.txt：Sitemap 地址错误或禁止全站抓取
- 站内搜索索引：文件缺失、条目过少、结果指向的页面或锚点不存在

### 关键词与运营

- `docs/keyword-map.csv`：关键词簇 → 搜索意图 → 主页面 / 辅助页面，坚持“一个搜索意图一个主页面”，避免多页互相竞争。
- `docs/seo-operations.md`：站外曝光节奏与 Search Console 每周优化流程。
- `docs/gsc-checklist.md`：上线后的索引检查清单。
- 不做：购买外链、站群互链、批量留言等链接操纵。

### 写新文章的 SEO 清单

1. 放在对应栏目目录：`src/content/posts/<栏目>/<英文-slug>.md`，slug 用小写英文和连字符。
2. front matter 填 `title`、`description`（针对这篇正文单独写）、`pubDatetime`。
3. 正文只用 H2/H3 分节（H1 由页面模板输出）。
4. 先查 `keyword-map.csv`，确认没有和已有页面抢同一个搜索意图。
5. 至少链接 1–2 篇相关文章或品牌页。
6. 实质修改时填 `modDatetime`；改错别字不改日期。
7. `pnpm run build` 通过后再推送。

## 数据原则

- 历史资料只作参考：`currentVerified` 一律为 `false`，不生成任何测速、评分或排名。
- 价格为空不当 0；付款周期与流量周期分开；年付显示总额 + 折算月均；一次性包不折算成月度额度。
- 来源不一致的记录两边都保留并标注，不计入最低价（见 `docs/plan-conflicts-audit.md`）。
- 本站测速只计入核验过的记录；公开测速参考只写来源名称与链接。
- 推广入口只来自 `provider-registry.json`。

## 日常维护

| 要做的事               | 改哪里                                                                     |
| ---------------------- | -------------------------------------------------------------------------- |
| 调整编辑精选顺序或家数 | `src/data/editorial-order.ts`（`EDITORIAL_ORDER`、`FEATURED_COUNT`）       |
| 新增品牌               | `scripts/provider-registry.json` → `pnpm run import:data` → 加进 `editorial-order.ts` |
| 优惠码核验通过         | `src/data/coupon-status.ts`                                                |
| 让品牌页进入索引       | 新建 `src/content/airports/<slug>.md`                                      |
| 发布本站测速           | `node scripts/import-test.mjs`，加 `--verify` 核验                         |
| 改主题颜色             | `src/styles/theme.css`                                                     |
| 改站名、首页标题、描述 | `astro-paper.config.ts`                                                    |

部署、Search Console 与 Bing 提交步骤见 [`docs/deploy.md`](docs/deploy.md)。

## 许可

代码基于 [AstroPaper](https://github.com/satnaing/astro-paper)，以 [MIT License](LICENSE) 发布。
