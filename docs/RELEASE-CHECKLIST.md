# RELEASE-CHECKLIST：部署前后验收与回滚

## 部署前（本分支已完成）

- [x] `pnpm run build`：类型检查 0 错误；postbuild 检查通过（108 页、104 可索引、Sitemap 104 条）
- [x] `pnpm run lint`、`pnpm exec prettier --check "src/**/*.{astro,ts}"`
- [x] Playwright 375 / 1440 px 全站无溢出、无脚本错误
- [x] 搜索、比较筛选、优惠码表、FAQ、收藏 / 个人中心、节点在线核验、推广链接 rel
- [x] 编辑精选前 5 家顺序：灵动云、暮光加速、飞猫云、大佬云、微风网络（首页、推荐、目录、优惠码四处一致）
- [ ] 站长确认后合并到 main 并推送（目前**未推送**）
- [ ] Cloudflare Pages 已连接 `wongkelvin1995-star/jichangshice.com`（见 INDEXING-CHECKLIST 第 0 步）

## 部署后（约 3 分钟后检查）

- [ ] `/deploy-id.txt` = main 最新提交号
- [ ] 首页、`/recommendations/`、`/compare/`、`/airports/lingdongyun/`、`/test-records/lingdongyun/` 返回 200，标题为新版本
- [ ] 页眉有 GitHub 图标；测试档案有「灵动云节点在线核验」
- [ ] `/favicon.ico` 返回 200；`/search-index.json` 响应头有 `x-robots-tag: noindex`；页面响应头有 `strict-transport-security`
- [ ] `/robots.txt`、`/sitemap-index.xml` 正常；随便输入一个不存在的地址返回 404
- [ ] 打开 `/speedtest/`，开着代理点「开始测速」：出口 IP 地区正确、六项数字都有值、连通性 15 项都有结果、能保存报告图
- [ ] GitHub Actions「IndexNow」成功，日志里的状态码为 200 或 202
- [ ] 手机上搜索、比较、优惠码复制、个人中心各点一次

## 回滚

| 情况 | 做法 |
|---|---|
| 新版本页面有问题 | Cloudflare Pages → 部署 → 选上一个成功的部署 →「回滚到此部署」（立即生效） |
| 要撤销代码 | `git revert <合并提交>` 后推送；或回到标记 `backup-before-seo-audit-2026-10-23` |
| HSTS 造成问题 | 删除 `public/_headers` 中的 Strict-Transport-Security 行；已访问过的浏览器会在 1 年内继续强制 HTTPS（全站本就使用 HTTPS，正常不会出问题） |
| IndexNow 提交出错 | 在 GitHub 停用 `.github/workflows/indexnow.yml`；IndexNow 只是通知，不会影响网站内容 |
| 新的 Pages 项目出问题 | 把自定义域移回旧项目（旧项目保留的部署仍可用） |

本次没有修改任何 URL 或路由，也没有新增重定向，所以不存在重定向回滚的问题。
