# 机场测试 · jichangshice.com.cn

中文机场资料、套餐比较、测试方法与客户端教程网站。基于 [AstroPaper](https://github.com/satnaing/astro-paper)（MIT）定制，Astro 7 + TypeScript + Tailwind CSS 4 + 站内中文搜索（构建时生成 search-index.json），静态输出。

## 常用命令

```bash
pnpm install --frozen-lockfile
pnpm run dev          # 本地开发
pnpm run build        # 类型检查 + 构建（含搜索索引）+ 构建后 SEO/死链检查
pnpm run preview      # 预览生产构建
pnpm run import:data  # 从历史资料重新生成品牌与套餐数据
pnpm run check:dist   # 单独运行构建后检查
pnpm run lint
```

需要 Node.js ≥ 22.12，pnpm 10+。

## 目录职责

| 路径                                      | 内容                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| `astro-paper.config.ts`                   | 站名、正式域名、描述、TG 入口等全站配置（只改这里）                                         |
| `src/content/posts/<栏目>/`               | 文章 Markdown（栏目：methods、guides、clients、routes、troubleshooting）                    |
| `src/content/airports/<slug>.md`          | 品牌人工分析；有此文件的品牌页才会被索引                                                    |
| `src/content/pages/`                      | 关于、合作说明、联系、隐私、测试方法、FAQ                                                   |
| `src/data/providers.json`                 | 品牌资料（由脚本生成，勿手改）                                                              |
| `src/data/plan-snapshots.json`            | 套餐历史快照（由脚本生成，勿手改）                                                          |
| `src/data/test-runs/`                     | 真实测试记录（目前为空，模板见 `docs/test-record-template.md`）                             |
| `src/data/categories.ts`、`navigation.ts` | 栏目定义与导航                                                                              |
| `src/components/`                         | 页眉、页脚、搜索、套餐表、目录等组件                                                        |
| `src/layouts/`                            | 基础布局（SEO 头部）与说明页布局                                                            |
| `src/pages/`                              | 路由：`/`、`/airports/`、`/airports/[slug]/`、`/compare/`、`/[栏目]/`、`/[栏目]/[文章]/` 等 |
| `scripts/provider-registry.json`          | 品牌名单、别名、编辑排列顺序、入口链接（站长提供）                                          |
| `scripts/import-history.py`               | 历史资料导入、去重、冲突标注                                                                |
| `scripts/postbuild-check.mjs`             | 构建后检查（title/description/canonical/死链/Sitemap/robots/推广 rel）                      |
| `private-imports/`                        | 原始历史资料与导入报告，不会被打包或发布                                                    |
| `docs/`                                   | 关键词地图、内容计划、部署说明、SEO 运营手册、验收报告、缺失资料、TG 文案                   |

## 数据原则

- 历史资料只作参考：`currentVerified` 一律为 `false`，不生成任何测速、评分或排名。
- 价格为空不当 0；付款周期与流量周期分开；年付显示总额 + 折算月均；一次性包不折算成月度额度。
- 来源不一致的记录两边都保留并标注，不计入最低价。
- 推广入口只来自 `provider-registry.json`，统一输出 `rel="sponsored nofollow"`。

详见 `docs/deploy.md` 与 `docs/seo-operations.md`。
