# 验收报告（2026-10-15）

执行环境：云端 Linux 容器，Node.js 22.22.0，pnpm 10.28.0，Astro 7.0.3，Pagefind 1.5.2（Extended，含中文分词），Chromium（Playwright）。
**未部署到正式域名**；以下结果均来自本地生产构建 + `astro preview`。

## 构建与代码检查

| 项目 | 命令 | 结果 |
|---|---|---|
| 干净安装 | 删除 node_modules 后 `pnpm install --frozen-lockfile` | 通过，锁文件未变化 |
| 类型检查 | `astro check` | 0 错误、0 警告 |
| 生产构建 | `pnpm run build` | 61 个页面 |
| 中文搜索索引 | `pagefind --site dist` | Extended 版本，识别语言 zh-cn，索引 58 个页面 |
| 构建后检查 | `scripts/postbuild-check.mjs` | 全部通过：title/description 唯一、每页 1 个 H1、canonical 正确、无站内死链、无 `href="#"`、推广链接 rel 正确、JSON-LD 可解析、Sitemap 35 条且与可索引页面一致、robots 正确、无旧域名残留 |
| ESLint | `pnpm run lint` | 通过 |
| Prettier | `pnpm run format:check` | 通过（文章 Markdown 与生成数据不参与格式化） |
| 未提供的脚本 | 单元测试 | 项目无 test 脚本，未执行 |

## 浏览器验收（Playwright）

宽度：320 / 390 / 768 / 1366 / 1440px；页面：首页、机场目录、品牌页（有分析 / 无分析）、比较表、栏目页、文章页、测试方法、FAQ、归档、搜索页、不存在的地址。

| 检查 | 结果 |
|---|---|
| 整页横向溢出 | 65 次页面加载均为 0（320px 首页曾溢出 40px，已修复） |
| 运行时错误 | 无（不存在的地址返回 404 状态码，属预期） |
| 手机菜单 | 打开、Escape 关闭正常 |
| 搜索 | 页眉图标与 Ctrl+K 打开，Escape 关闭；“灵动云”“暮光”“Breezenet/breezenet”“clash”“年付”“晚高峰”“订阅更新失败”“套餐比较”均返回相关页面；无结果状态正常 |
| 比较表筛选 | 282 档 → 选灵动云 9 档 → 加年付 1 档 → 再加 ¥100 以上 0 档并显示无结果提示 → 重置回 282 档；隐藏冲突后 224 档；`?brand=breezenet` 参数生效 |
| 目录锚点 | 点击目录后标题位于固定页眉下方，未被遮挡 |
| 视觉对照 | 首页结构与设计图一致：页眉、首屏、机场资料 + 从这里开始、套餐比较、最新文章、页脚；手机端首屏顺序为标题 → 示意图 → 按钮 |

## 与设计图的差异

- 设计图套餐区为虚构 A/B/C 示例，正式页面改为读取真实历史数据（前 5 个品牌各 2 档月付方案），并加注观察日期与“历史参考”。
- 设计图“最新文章”日期为占位（2024），正式页面显示真实发布日期。
- 首页增加了“怎样使用机场测试”导读与常见问题，满足首页导读与 FAQ 要求。
- 品牌头像使用文字头像，不使用任何品牌官方 Logo。

## 未验证 / 未执行

- 正式域名访问、Cloudflare Pages 部署、HTTPS、CDN 缓存。
- Google / Bing 收录与 Search Console 数据。
- Lighthouse 分数（未测，不提供数字）。
- 拼音搜索（未实现）。
- 套餐现价（全部为历史资料，`currentVerified=false`）。
