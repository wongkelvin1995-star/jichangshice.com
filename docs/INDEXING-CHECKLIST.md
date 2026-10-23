# INDEXING-CHECKLIST：Bing Webmaster Tools 检查与提交步骤

所有步骤都需要站长登录后台完成。不承诺收录时间或排名。

## 0. 先决条件：让正式站点重新部署（必须先做）

- [ ] Cloudflare → Workers 和 Pages → 现有项目 → 设置 → 构建：「Git 存储库」目前是已不存在的 `wongkelvinhaha/jichangshice`。
- [ ] 账号已达到 Pages 项目数软上限，先删除一个不用的项目，再「创建 → Pages → 连接到 Git」选 `wongkelvin1995-star/jichangshice.com`；构建命令 `pnpm run build`、输出 `dist`、变量 `NODE_VERSION=22`。
- [ ] 新项目部署成功后，把自定义域 `jichangshice.com.cn` 从旧项目移到新项目（中间可能有 1–2 分钟无法访问）。
- [ ] 打开 `https://jichangshice.com.cn/deploy-id.txt`，内容应等于 GitHub main 最新提交号。

## 1. Cloudflare 设置

- [ ] 规则 → 重定向规则 → 新建：主机名等于 `www.jichangshice.com.cn` → 动态 `concat("https://jichangshice.com.cn", http.request.uri.path)`，状态码 301，保留查询字符串。
- [ ] SSL/TLS → 边缘证书：「始终使用 HTTPS」保持开启。
- [ ] 安全性 → 机器人：如开启「Bot Fight Mode」，确认「已验证机器人」（Verified Bots）放行；不要对 Bingbot 设置质询。
- [ ] 部署后打开任意页面看响应头：应有 `strict-transport-security`；`/search-index.json` 应有 `x-robots-tag: noindex`。

## 2. Bing Webmaster Tools

- [ ] 站点验证：确认 `https://jichangshice.com.cn` 已验证。若要用 HTML 标签方式，在 Cloudflare Pages 环境变量加 `PUBLIC_BING_SITE_VERIFICATION=<代码>` 后重新部署。
- [ ] 站点地图：提交 `https://jichangshice.com.cn/sitemap-index.xml`；状态应为「成功」，已发现 URL 约 104 个。
- [ ] URL 检查：逐个检查并「请求编制索引」——`/`、`/recommendations/`、`/compare/`、`/test-records/`、`/airports/lingdongyun/`、`/coupons/`、`/guides/airport-runaway-signs/`。看「实时 URL」结果里能否读到正文、有没有被拦截。
- [ ] IndexNow：GitHub → Actions → IndexNow → Run workflow → 选 `all`，首次提交全部 URL；之后每次推送自动只提交有更新的地址。到 Bing 后台「IndexNow」页查看收到的提交。
- [ ] 站点扫描：运行一次「站点扫描」，处理报出的错误。
- [ ] 搜索效果：记录展示次数、点击次数、平均排名的起点数据。

## 3. 上线后 7 天观察

| 时间 | 检查 | 记录 |
|---|---|---|
| 第 1 天 | Actions 里 IndexNow 的状态码（200/202 = 已收到，不代表已收录）；URL 检查结果 | |
| 第 2–3 天 | 站点地图「已发现」数量；重点 URL 是否显示「已编入索引」 | |
| 第 4–7 天 | 「搜索效果」展示次数；「爬网信息」抓取错误；有新的真实测试时再发布并让 IndexNow 自动提交 | |
