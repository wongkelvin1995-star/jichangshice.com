# 测速来源审计（test-source-audit）

生成日期：2026-10-15。数据文件：`src/data/test-records.json`（公开测速记录）；本站测试记录目录 `src/data/test-runs/`（只有 verified 记录公开并计数，导入方法见 test-record-template.md）。

## 记录类型

| 类型 | 含义 | 条数 |
|---|---|---|
| first_party | 本站测试，须有原始凭证 | 0 |
| public_record | 公开发布的测速记录，注明来源、环境与原始链接 | 35 |
| vendor_claim | 服务商声明 | 0（品牌页正文中以“服务商描述”标注，不进入档案） |

没有原始截图或可核对链接的数据，不标为 first_party。

## 来源一览

### siilas 公开测速数据库

- 来源：https://github.com/haandiiong/siilas
- 批次：16；涉及品牌：edgenova, guangnianti, quanqiuyun
- 原始结果链接：55 条
- 测试环境：中国大陆（城市未注明） / 运营商未注明 / 测试端 1000 Mbps / 工具：Speedtest（每条附结果链接）
- 速度单位：Mbps

### 机场推荐 jichangtj.co 首轮评测快照

- 来源：https://jichangtj.co/reviews/guangsuyun
- 批次：17；涉及品牌：breezenet, ermaoyun, feimaoyun, guangnianti, jilianyun, kexinyun, kuaili, lightspeed, lingmao, quanqiuyun, sogoyun, stardream, sujie, u1s1, v2yun, yifanyun, yuzhouyun
- 原始结果链接：0 条
- 测试环境：广东珠海 / 中国联通 / 测试端 5000 Mbps / 工具：MAI-TEST-BOT 2.0.0-dev，32 线程
- 速度单位：MB（来源截图原单位，未换算，不能与 Mbps 直接比较）

### TowerNav 灵动云节点测试

- 来源：https://towernav.com/airports/lingdong/
- 批次：1；涉及品牌：lingdongyun
- 原始结果链接：0 条
- 测试环境：广东珠海 / 中国联通 / 测试端 9000 Mbps / 工具：MiaoKo 工具，32 线程
- 速度单位：MB/s（来源单位）

### 机场百科 jichangwiki.blog 星岛梦测评

- 来源：https://jichangwiki.blog/posts/airports/xingdaomeng/
- 批次：1；涉及品牌：stardream
- 原始结果链接：0 条
- 测试环境：未注明 / 中国电信 / 测试端 500 Mbps / 工具：未注明
- 速度单位：Mbps

## 已排除或降级的数据

- jichangwiki.blog 星岛梦第二批“电信千兆环境”数据：多个地区平均速度超过 1000 Mbps，与其标称环境矛盾，未收录。
- siilas 边缘节点 2026-07-17 新加坡记录：未附 Speedtest 链接，保留但标注“未附链接”。
- jichangtj.co 可信云快照：截图未显示年月日，来源按批次补记为 2026-08-11，已在记录中注明。
- jichangtj.co 无忧：来源明确写明无测速记录，未创建记录。
- 各来源页面中的优惠码（如 akaka、gnt6666、ermao5555 等）属于其他网站的推广信息，未采用；本站优惠码以站长提供为准。

## 逐批明细

| 记录 ID | 品牌 | 日期 | 时段 | 来源 | 数据行 | 原始链接 |
|---|---|---|---|---|---|---|
| siilas-quanqiuyun-2026-07-13 | quanqiuyun | 2026-07-13 | 日间 | siilas 公开测速数据库 | 4 | 4 |
| siilas-quanqiuyun-2026-07-14 | quanqiuyun | 2026-07-14 | 日间 | siilas 公开测速数据库 | 5 | 5 |
| siilas-quanqiuyun-2026-07-15 | quanqiuyun | 2026-07-15 | 日间/晚间 | siilas 公开测速数据库 | 4 | 4 |
| siilas-quanqiuyun-2026-07-16 | quanqiuyun | 2026-07-16 | 日间 | siilas 公开测速数据库 | 1 | 1 |
| siilas-quanqiuyun-2026-07-17 | quanqiuyun | 2026-07-17 | 日间 | siilas 公开测速数据库 | 1 | 1 |
| siilas-quanqiuyun-2026-07-18 | quanqiuyun | 2026-07-18 | 日间/晚高峰 | siilas 公开测速数据库 | 5 | 5 |
| siilas-quanqiuyun-2026-07-28 | quanqiuyun | 2026-07-28 | 晚高峰 | siilas 公开测速数据库 | 4 | 4 |
| siilas-quanqiuyun-2026-10-08 | quanqiuyun | 2026-10-08 | 晚高峰 | siilas 公开测速数据库 | 4 | 4 |
| siilas-guangnianti-2026-07-13 | guangnianti | 2026-07-13 | 日间 | siilas 公开测速数据库 | 4 | 4 |
| siilas-guangnianti-2026-07-15 | guangnianti | 2026-07-15 | 晚间 | siilas 公开测速数据库 | 4 | 4 |
| siilas-guangnianti-2026-07-18 | guangnianti | 2026-07-18 | 日间 | siilas 公开测速数据库 | 4 | 4 |
| siilas-guangnianti-2026-10-08 | guangnianti | 2026-10-08 | 晚高峰 | siilas 公开测速数据库 | 4 | 4 |
| siilas-edgenova-2026-07-13 | edgenova | 2026-07-13 | 晚高峰 | siilas 公开测速数据库 | 3 | 3 |
| siilas-edgenova-2026-07-17 | edgenova | 2026-07-17 | 晚高峰 | siilas 公开测速数据库 | 1 | 0 |
| siilas-edgenova-2026-08-13 | edgenova | 2026-08-13 | 晚高峰 | siilas 公开测速数据库 | 4 | 4 |
| siilas-edgenova-2026-10-08 | edgenova | 2026-10-08 | 晚间/晚高峰 | siilas 公开测速数据库 | 4 | 4 |
| jichangtj-lightspeed-2026-08-11 | lightspeed | 2026-08-11 | 白天，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-stardream-2026-08-11 | stardream | 2026-08-11 | 凌晨，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-breezenet-2026-07-19 | breezenet | 2026-07-19 | 傍晚 | 机场推荐 jichangtj.co 首轮评测快照 | 5 | 0 |
| jichangtj-feimaoyun-2026-08-11 | feimaoyun | 2026-08-11 | 上午，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-u1s1-2026-08-11 | u1s1 | 2026-08-11 | 晚高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 7 | 0 |
| jichangtj-v2yun-2026-08-11 | v2yun | 2026-08-11 | 白天，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-lingmao-2026-08-11 | lingmao | 2026-08-11 | 傍晚，接近高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-jilianyun-2026-08-11 | jilianyun | 2026-08-11 | 晚高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-yuzhouyun-2026-08-11 | yuzhouyun | 2026-08-11 | 晚高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-guangnianti-2026-08-11 | guangnianti | 2026-08-11 | 白天，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 5 | 0 |
| jichangtj-yifanyun-2026-08-11 | yifanyun | 2026-08-11 | 凌晨，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 4 | 0 |
| jichangtj-ermaoyun-2026-08-11 | ermaoyun | 2026-08-11 | 上午，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-sogoyun-2026-08-11 | sogoyun | 2026-08-11 | 傍晚 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| jichangtj-kexinyun-2026-08-11 | kexinyun | 2026-08-11 | 白天 | 机场推荐 jichangtj.co 首轮评测快照 | 4 | 0 |
| jichangtj-sujie-2026-08-11 | sujie | 2026-08-11 | 白天，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 7 | 0 |
| jichangtj-kuaili-2026-08-11 | kuaili | 2026-08-11 | 傍晚，接近高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 5 | 0 |
| jichangtj-quanqiuyun-2026-08-11 | quanqiuyun | 2026-08-11 | 白天，非高峰 | 机场推荐 jichangtj.co 首轮评测快照 | 6 | 0 |
| towernav-lingdongyun-2026-07-20 | lingdongyun | 2026-07-20 | 晚高峰 | TowerNav 灵动云节点测试 | 5 | 0 |
| jichangwiki-stardream-2026-10-09 | stardream | 2026-10-09 | 晚高峰 | 机场百科 jichangwiki.blog 星岛梦测评 | 5 | 0 |
