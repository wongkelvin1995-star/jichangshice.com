# 部署与搜索引擎提交说明

> 本地构建与干净克隆后的构建均已验证通过。代码仓库：`wongkelvin1995-star/jichangshice.com`（main 分支）。

## 1. 本地运行

需要 Node.js ≥ 22.12、pnpm 10（`package.json` 的 `packageManager` 固定为 pnpm@10.28.0）。

```bash
pnpm install --frozen-lockfile   # 安装依赖（锁文件已提交）
pnpm run dev                     # 本地开发 http://localhost:4321（搜索需先 build 一次）
pnpm run build                   # 类型检查 + 构建（含搜索索引）+ 构建后检查
pnpm run preview                 # 预览生产构建
```

`pnpm run build` 最后一步 `scripts/postbuild-check.mjs` 会检查 title/description 唯一性、canonical、站内死链、Sitemap、robots、推广链接 rel 属性，有错误时构建失败。

## 2. Cloudflare Pages

1. 代码已在 GitHub 仓库 `wongkelvin1995-star/jichangshice.com`（不要推到旧站仓库）。
2. Cloudflare 控制台 → Workers & Pages → 创建 → Pages → 连接该仓库。
3. 构建设置：
   - 框架预设：Astro
   - 构建命令：`pnpm run build`
   - 输出目录：`dist`
   - 环境变量：`NODE_VERSION` = `22`（或更高的 LTS）
   - 可选：`PUBLIC_GOOGLE_SITE_VERIFICATION`、`PUBLIC_BING_SITE_VERIFICATION`（用 HTML 标签方式验证时填写）
4. 部署成功后，在“自定义域”中绑定 `jichangshice.com.cn`，并把 `www` 子域 301 跳转到主域（Cloudflare“重定向规则”）。
5. 打开以下地址确认：`/`、`/airports/lingdongyun/`、`/compare/`、`/robots.txt`、`/sitemap-index.xml`、一个不存在的地址（应显示 404 页面并返回 404 状态码）。

Cloudflare Pages 会自动使用 `dist/404.html` 作为 404 页面，并把 `/about` 跳转到 `/about/`，与站内 canonical 一致。

> 域名是 .com.cn，托管在境外服务时通常不涉及 ICP 备案，但域名本身需完成实名认证；国内访问速度和可达性取决于托管线路。具体合规要求请以注册商和主管部门说明为准。

## 3. Google Search Console

1. 打开 https://search.google.com/search-console ，添加“网域”资源 `jichangshice.com.cn`。
2. 按提示在 DNS（Cloudflare）中添加 TXT 记录完成验证。
3. 左侧“站点地图” → 提交 `sitemap-index.xml`。
4. “网址检查”中依次检查并“请求编入索引”：首页、`/airports/`、`/compare/`、`/testing-methodology/`、各栏目页。
5. 1–2 周后查看“网页”报告：未编入索引的原因、被 noindex 排除的品牌页（这是预期行为）。

## 4. Bing Webmaster Tools

https://www.bing.com/webmasters → 选择“从 Google Search Console 导入”，即可同步站点与 Sitemap。

## 5. 发布新文章 / 更新数据

- 新文章：在 `src/content/posts/<栏目>/` 新建 Markdown，填写 front matter（参考已有文章），`pnpm run build` 通过后推送即可。
- 实质修改文章：填写 `modDatetime`；错别字等小改动不要改日期。
- 更新套餐（只在站长电脑上可用，导入脚本和原始资料不在公开仓库）：修改历史资料或新增来源后运行 `pnpm run import:data`，检查 `private-imports/import-report.json` 中的冲突数，再构建。
- 调整编辑精选顺序或首页精选家数：只改 `src/data/editorial-order.ts`（`EDITORIAL_ORDER` 与 `FEATURED_COUNT`），首页、机场推荐、目录、比较表、优惠码表和品牌编号会一起更新。
- 新增品牌入口：修改 `scripts/provider-registry.json` 并运行 `pnpm run import:data`，再把新品牌的 slug 加进 `editorial-order.ts`（漏加会构建报错）。
- 优惠码在结算页确认可用后，登记到 `src/data/coupon-status.ts`，页面会从“待验证”变为“已验证”。
- 让某个品牌页进入索引：在 `src/content/airports/<slug>.md` 写一篇基于资料的分析。
- 发布本站测速：按 `docs/test-record-template.md` 用 `node scripts/import-test.mjs` 导入并 `--verify` 核验，构建后推送。
