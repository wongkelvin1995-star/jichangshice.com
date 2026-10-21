# 本站测速记录：导入与核验

本站实测记录保存为 `src/data/test-runs/<id>.json`，构建时由 `src/utils/testRuns.ts` 校验字段。
**没有原始证据就不要创建记录**；未测项目填 `null`，不要填 0，也不要估算。

## 两种记录，严格分开

| 区域 | 数据文件 | 计入「本站测试」 | 说明 |
|---|---|---|---|
| 本站测试 | `src/data/test-runs/*.json` | 只计 `verification.status = "verified"` | 本站自己测得，附原始结果 |
| 公开测速参考 | `src/data/test-records.json` | 不计入 | `public_record` = 第三方公开测速；`vendor_claim` = 服务商公布。注明来源，不转载截图 |

## 导入步骤（在网站项目文件夹运行，需要 Node.js）

1. **测速**：连上要测的节点，在 [speedtest.net](https://www.speedtest.net/) 或 [speed.cloudflare.com](https://speed.cloudflare.com/) 测一次。
   - Speedtest：测完点「分享」，复制结果链接（`https://www.speedtest.net/result/数字`）。
   - Cloudflare：测完下载结果文件（JSON 或 CSV）。
   - 只有截图时：截完整结果页，裁掉 IP、账号、订阅链接。
2. **导入**（生成待核验记录，不会公开）：

   ```bash
   # Speedtest 链接：自动读取下载、上传、延迟、时间
   node scripts/import-test.mjs --brand lingdongyun --region 香港 --node "香港 03" \
     --speedtest https://www.speedtest.net/result/<结果ID> --isp 中国电信 --location 广东深圳

   # Cloudflare 导出文件：自动识别字段，导出文件只存私有目录 evidence-private/
   node scripts/import-test.mjs --brand lingdongyun --region 日本 --cloudflare ./cf-result.json

   # 截图：数值按截图手动填写，截图复制到 public/evidence/<id>/（加 --private 则不公开）
   node scripts/import-test.mjs --brand lingdongyun --region 美国 --screenshot ./shot.png \
     --tool speedtest --down <下载Mbps> --up <上传Mbps> --latency <延迟ms> --at "YYYY-MM-DD HH:mm"
   ```

   也可以先在网站的 `/test-records/submit/`（测速录入助手，noindex）填表，它会校验链接、解析 Cloudflare 文件、预览截图，并生成上面的命令或记录 JSON（`--from-json 文件` 导入）。
3. **核验**：打开原始结果，逐项对照记录里的品牌、地区、时间、下载、上传、延迟。无误后：

   ```bash
   node scripts/import-test.mjs --verify <id> --note "已对照结果页核对"
   # 数据有误：--reject <id> --note "原因"；查看全部：--list
   ```

4. **构建发布**：`pnpm run build`。已核验记录会出现在 `/test-records/`、品牌测试页和机场资料页，「本站测试」数量随之更新。

## 解析规则与限制

- **Speedtest**：读取结果页内嵌的 `window.OOKLA.INIT_DATA.result`（download/upload 为 kbps，除以 1000 得 Mbps；latency/ping 为 ms；date 为 Unix 秒）。页面结构可能变化，读不到时命令会提示用 `--down --up --latency --at` 按结果页手动填写。命令会打印原始字段，核验时请对照。
- **Cloudflare**：导出格式没有公开规范，按字段名识别（download/upload/latency/jitter/time），带 Mbps 的字段按 Mbps，带 bps/bandwidth 或数值大于 10⁵ 的按 bps 换算；空载延迟优先，负载下延迟不采用。识别结果会列出匹配的字段名，请核对。
- **截图**：不做自动识别，数值必须手动按截图填写。
- 手动填写的数值优先于自动解析值，用于纠正解析错误。
- 校验：品牌必须存在于 `src/data/providers.json`；速度 0–100000 Mbps，延迟 0–10000 ms；时间不能晚于当前时间；必须有结果链接或证据文件；同一结果链接不能重复导入。

## 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| id | 是 | `品牌-YYYYMMDD-HHmm-工具`，与文件名一致 |
| brandSlug | 是 | 品牌 slug |
| nodeRegion / nodeName | 地区必填 | 节点地区与节点名（可脱敏） |
| testedAt | 是 | 带时区的 ISO 时间，如 `2026-10-15T21:30:00+08:00` |
| downloadMbps / uploadMbps / latencyMs | 是 | 来自原始结果 |
| jitterMs / packetLossPct | 否 | 未测为 null |
| tool / toolName | 是 | `speedtest` / `cloudflare` / `other` |
| dataSource | 是 | `speedtest_link` / `cloudflare_export` / `screenshot` |
| evidenceUrl / evidenceFiles | 至少一项 | 结果链接；证据文件 `{path, public, kind}` |
| server / isp / location / bandwidth / device / client / protocol / notes | 否 | 测试环境 |
| importedAt | 是 | 导入时间 |
| verification | 是 | `{status: pending/verified/rejected, verifiedAt, notes}` |
