#!/usr/bin/env node
/* eslint-disable no-console -- 命令行工具需要输出到终端 */
/**
 * 本站实测记录导入工具（在站长电脑上运行，需要能访问 speedtest.net）。
 *
 * 导入（生成 src/data/test-runs/<id>.json，状态为 pending，不会公开）：
 *   node scripts/import-test.mjs --brand lingdongyun --region 香港 --speedtest https://www.speedtest.net/result/1234567890
 *   node scripts/import-test.mjs --brand lingdongyun --region 日本 --cloudflare ./cf-result.json --at "2026-10-15 21:30"
 *   node scripts/import-test.mjs --brand lingdongyun --region 美国 --screenshot ./shot.png \
 *        --down 312.5 --up 41.2 --latency 168 --at "2026-10-15 21:40" --tool speedtest
 *   node scripts/import-test.mjs --from-json ./record.json [--screenshot ./shot.png]   （录入助手页导出的 JSON）
 *
 * 核验（对照原始结果逐项核对后执行，之后才会在网站显示并计入「本站测试」）：
 *   node scripts/import-test.mjs --verify <id> [--note "已对照结果页核对"]
 *   node scripts/import-test.mjs --reject <id> [--note "原因"]
 *   node scripts/import-test.mjs --list
 *
 * 可选：--node 节点名 --isp 运营商 --location 测试地 --bandwidth 宽带 --device 设备 --client 客户端
 *       --protocol 协议 --jitter 抖动ms --loss 丢包% --server 测速服务器 --notes 备注 --tz +08:00
 *       --private（截图不公开，只存 evidence-private/）--save-image（下载 Speedtest 结果图作为证据）
 *       --dry-run（只解析和校验，不写文件）
 *
 * 原则：解析不到的数值不会猜测；必须用 --down/--up/--latency/--at 按原始结果手动填写。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNS_DIR = path.join(ROOT, "src/data/test-runs");
const PUBLIC_EVIDENCE = path.join(ROOT, "public/evidence");
const PRIVATE_EVIDENCE = path.join(ROOT, "evidence-private");
const REGISTRY = path.join(ROOT, "src/data/providers.json");

// ---------- 参数 ----------
const FLAGS = new Set(["private", "save-image", "dry-run", "list", "help"]);
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) fail(`无法识别的参数：${a}`);
    const key = a.slice(2);
    if (FLAGS.has(key)) out[key] = true;
    else {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) fail(`--${key} 缺少值`);
      out[key] = v;
    }
  }
  return out;
}
function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}
const info = msg => console.log(msg);

// ---------- 通用 ----------
function brands() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  return new Map(reg.map(p => [p.slug, p.name]));
}

function num(v, name, { min = 0, max = 100000 } = {}) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= min || n > max)
    fail(`${name} 数值无效：${v}（应大于 ${min} 且不超过 ${max}）`);
  return Math.round(n * 100) / 100;
}

/** 时区偏移字符串 → 分钟 */
function tzMinutes(tz) {
  const m = String(tz).match(/^([+-])(\d{2}):?(\d{2})$/);
  if (!m) fail(`--tz 格式应为 +08:00`);
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

/** Date → 指定时区的 ISO 字符串（YYYY-MM-DDTHH:mm:ss+08:00） */
function isoInTz(date, tz) {
  const off = tzMinutes(tz);
  const d = new Date(date.getTime() + off * 60000);
  const p = n => String(n).padStart(2, "0");
  const sign = off < 0 ? "-" : "+";
  const a = Math.abs(off);
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}${sign}${p(Math.floor(a / 60))}:${p(a % 60)}`;
}

/** 解析 --at：接受 "2026-10-15 21:30"（按 --tz 解释）或带时区的 ISO */
function parseAt(v, tz) {
  if (!v) return null;
  const s = String(v).trim().replace(" ", "T");
  const hasTz = /(Z|[+-]\d{2}:?\d{2})$/.test(s);
  const d = new Date(hasTz ? s : `${s.length === 16 ? `${s}:00` : s}${tz}`);
  if (Number.isNaN(d.getTime())) fail(`时间无法解析：${v}`);
  return d;
}

function checkDate(d) {
  if (d.getTime() > Date.now() + 5 * 60000) fail("测试时间晚于当前时间");
  if (d.getUTCFullYear() < 2020) fail("测试时间早于 2020 年，请检查");
}

function readRun(id) {
  const f = path.join(RUNS_DIR, `${id}.json`);
  if (!fs.existsSync(f)) fail(`找不到记录 ${id}（${path.relative(ROOT, f)}）`);
  return [f, JSON.parse(fs.readFileSync(f, "utf8"))];
}

function allRuns() {
  if (!fs.existsSync(RUNS_DIR)) return [];
  return fs
    .readdirSync(RUNS_DIR)
    .filter(f => f.endsWith(".json") && !f.startsWith("_"))
    .map(f => JSON.parse(fs.readFileSync(path.join(RUNS_DIR, f), "utf8")));
}

/** 从 HTML/JS 文本中取出 marker 之后第一个完整的 {...}（按括号配对，跳过字符串） */
export function extractObject(text, marker) {
  const at = text.indexOf(marker);
  if (at < 0) return null;
  const start = text.indexOf("{", at);
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) {
      try {
        return JSON.parse(text.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

// ---------- Speedtest ----------
const SPEEDTEST_RE =
  /^https:\/\/(?:www\.)?speedtest\.net\/(?:my-)?result\/(?:[a-z]\/)?(\d+)\/?(?:[?#].*)?$/i;

/**
 * Speedtest 结果页内嵌 window.OOKLA.INIT_DATA = {"result": {...}}。
 * 已知字段：download / upload 单位为 kbps，latency（或 ping）单位 ms，date 为 Unix 秒。
 * 页面结构可能变化；解析结果只作为待核验数据，必须人工对照结果页确认。
 */
export function parseSpeedtestHtml(html) {
  const init = extractObject(html, "OOKLA.INIT_DATA");
  const r = init?.result;
  if (!r || typeof r !== "object") return null;
  const pickNum = (...keys) => {
    for (const k of keys) {
      const v = r[k];
      if (v !== undefined && v !== null && v !== "" && Number.isFinite(Number(v)))
        return Number(v);
    }
    return null;
  };
  const kbpsDown = pickNum("download");
  const kbpsUp = pickNum("upload");
  const latency = pickNum("latency", "ping");
  const jitter = pickNum("jitter");
  const loss = pickNum("packet_loss", "packetLoss");
  let date = null;
  const rawDate = r.date ?? r.timestamp ?? null;
  if (typeof rawDate === "number" || /^\d{9,13}$/.test(String(rawDate)))
    date = new Date(Number(rawDate) * (String(rawDate).length > 11 ? 1 : 1000));
  else if (rawDate && !Number.isNaN(Date.parse(rawDate))) date = new Date(rawDate);
  const server = [r.sponsor_name, r.server_name].filter(Boolean).join(" · ");
  return {
    raw: {
      download: r.download,
      upload: r.upload,
      latency: r.latency ?? r.ping,
      jitter: r.jitter,
      date: rawDate,
      isp_name: r.isp_name,
      server_name: r.server_name,
      sponsor_name: r.sponsor_name,
    },
    downloadMbps: kbpsDown === null ? null : kbpsDown / 1000,
    uploadMbps: kbpsUp === null ? null : kbpsUp / 1000,
    latencyMs: latency,
    jitterMs: jitter,
    packetLossPct: loss,
    date,
    server: server || null,
  };
}

async function fetchSpeedtest(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    },
  });
  if (!res.ok) fail(`打开 Speedtest 结果页失败：HTTP ${res.status}`);
  return res.text();
}

// ---------- Cloudflare ----------
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function csvRows(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i + 1] === '"') (cur += '"'), i++;
        else if (c === '"') q = false;
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") cells.push(cur.trim()), (cur = "");
      else cur += c;
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

/**
 * Cloudflare 测速导出（JSON 或 CSV）的启发式解析：按字段名找下载、上传、延迟、抖动、时间。
 * 带 Mbps 的字段按 Mbps；带 bps/bandwidth 或数值大于 10^5 的按 bps 换算。
 * 导出格式没有公开规范，结果只作为待核验数据。
 */
export function parseCloudflare(text) {
  let flat;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    let j = JSON.parse(trimmed);
    if (Array.isArray(j)) j = j.at(-1);
    flat = flatten(j);
  } else {
    const rows = csvRows(trimmed);
    if (rows.length < 2) return null;
    if (rows[0].length === 2 && rows.length > 2)
      flat = Object.fromEntries(rows.map(r => [r[0], r[1]]));
    else flat = Object.fromEntries(rows[0].map((h, i) => [h, rows.at(-1)[i]]));
  }
  const entries = Object.entries(flat).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined
  );
  const numeric = entries.filter(([, v]) =>
    Number.isFinite(Number(String(v).replace(/[^\d.eE+-]/g, "")))
  );
  const val = v => Number(String(v).replace(/[^\d.eE+-]/g, ""));
  const loaded = k => /(?<!un)loaded|during|under/i.test(k);
  const find = (re, exclude = /$^/) =>
    numeric.find(([k]) => re.test(k) && !exclude.test(k) && !loaded(k));
  const speed = hit => {
    if (!hit) return null;
    const [k, v] = hit;
    const n = val(v);
    if (/mbps|mbit/i.test(k) || /mbps/i.test(String(v))) return n;
    if (/kbps/i.test(k)) return n / 1000;
    if (/bps|bandwidth|bits/i.test(k) || n > 1e5) return n / 1e6;
    return n;
  };
  const dl = find(/down/i, /latency|jitter|time|bytes|count/i);
  const ul = find(/up(load)?/i, /latency|jitter|time|bytes|count|update/i);
  const lat = find(/latency|ping|rtt/i, /jitter|down|up/i);
  const jit = find(/jitter/i, /down|up/i);
  const loss = find(/loss/i);
  const timeHit = entries.find(([k]) => /time|date/i.test(k) && !/latency/i.test(k));
  let date = null;
  let localTime = null;
  if (timeHit) {
    const v = timeHit[1];
    const n = Number(v);
    if (Number.isFinite(n) && n > 1e9) date = new Date(n > 1e11 ? n : n * 1000);
    else if (/(Z|[+-]\d{2}:?\d{2})$/.test(String(v).trim()) && !Number.isNaN(Date.parse(v)))
      date = new Date(v);
    else localTime = String(v).trim(); // 无时区的时间按 --tz 解释
  }
  return {
    matched: {
      download: dl?.[0],
      upload: ul?.[0],
      latency: lat?.[0],
      jitter: jit?.[0],
      packetLoss: loss?.[0],
      time: timeHit?.[0],
    },
    downloadMbps: speed(dl),
    uploadMbps: speed(ul),
    latencyMs: lat ? val(lat[1]) : null,
    jitterMs: jit ? val(jit[1]) : null,
    packetLossPct: loss ? val(loss[1]) : null,
    date,
    localTime,
  };
}

// ---------- 证据文件 ----------
function copyEvidence(src, id, kind, isPublic) {
  if (!fs.existsSync(src)) fail(`找不到文件：${src}`);
  const ext = path.extname(src).toLowerCase() || ".bin";
  if (kind === "screenshot" && ![".png", ".jpg", ".jpeg", ".webp"].includes(ext))
    fail("截图只支持 png / jpg / webp");
  const base = isPublic ? PUBLIC_EVIDENCE : PRIVATE_EVIDENCE;
  const dir = path.join(base, id);
  const name = `${kind}${ext}`;
  return {
    write: () => {
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(src, path.join(dir, name));
    },
    entry: {
      path: isPublic ? `/evidence/${id}/${name}` : `evidence-private/${id}/${name}`,
      public: isPublic,
      kind,
    },
  };
}

function uniqueId(base) {
  let id = base;
  for (let i = 2; fs.existsSync(path.join(RUNS_DIR, `${id}.json`)); i++)
    id = `${base}-${i}`;
  return id;
}

// ---------- 子命令 ----------
function list() {
  const runs = allRuns();
  if (!runs.length) return info("目前没有本站测速记录。");
  const b = brands();
  for (const r of runs.sort((x, y) => x.testedAt.localeCompare(y.testedAt)))
    info(
      `${r.verification.status.padEnd(8)} ${r.id}  ${b.get(r.brandSlug) ?? r.brandSlug} ${r.nodeRegion}  ↓${r.downloadMbps} ↑${r.uploadMbps} Mbps  ${r.latencyMs} ms`
    );
}

function setStatus(id, status, note) {
  const [f, r] = readRun(id);
  if (status === "verified") {
    for (const e of r.evidenceFiles ?? []) {
      const p = path.join(ROOT, e.public ? `public${e.path}` : e.path);
      if (!fs.existsSync(p)) fail(`证据文件不存在：${e.path}，不能标记为已核验`);
    }
    if (!r.evidenceUrl && !(r.evidenceFiles ?? []).length)
      fail("没有任何原始证据，不能标记为已核验");
  }
  r.verification = {
    status,
    verifiedAt: isoInTz(new Date(), "+08:00"),
    notes: note ?? r.verification?.notes ?? null,
  };
  fs.writeFileSync(f, `${JSON.stringify(r, null, 2)}\n`);
  info(`✓ ${id} → ${status}`);
  if (status === "verified")
    info("  重新构建网站后，这条记录会出现在测试档案并计入「本站测试」。");
}

async function importRun(a) {
  const b = brands();
  const tz = a.tz ?? "+08:00";
  tzMinutes(tz);
  const pending = [];
  let base = {};
  let parsedAt = null;

  if (a["from-json"]) {
    base = JSON.parse(fs.readFileSync(a["from-json"], "utf8"));
  }
  const brand = a.brand ?? base.brandSlug;
  const region = a.region ?? base.nodeRegion;
  if (!brand) fail("缺少 --brand（品牌 slug，见 src/data/providers.json）");
  if (!b.has(brand)) fail(`未知品牌：${brand}。可用：${[...b.keys()].join(", ")}`);
  if (!region) fail("缺少 --region（节点地区，如 香港、日本、美国）");

  const sources = ["speedtest", "cloudflare", "screenshot"].filter(k => a[k]);
  let dataSource = base.dataSource;
  let tool = a.tool ?? base.tool;
  let parsed = {};
  let evidenceUrl = base.evidenceUrl ?? null;

  if (a.speedtest) {
    const url = a.speedtest.trim();
    const m = url.match(SPEEDTEST_RE);
    if (!m) fail("不是有效的 Speedtest 结果链接（应为 https://www.speedtest.net/result/数字）");
    evidenceUrl = `https://www.speedtest.net/result/${m[1]}`;
    dataSource = "speedtest_link";
    tool = "speedtest";
    info(`读取 ${evidenceUrl} …`);
    const html = await fetchSpeedtest(evidenceUrl);
    const p = parseSpeedtestHtml(html);
    if (!p) {
      info("! 页面中没有找到测速数据（结构可能已变化）。请用 --down --up --latency --at 按结果页手动填写。");
    } else {
      info(`  原始字段：${JSON.stringify(p.raw)}`);
      parsed = p;
    }
    if (a["save-image"]) {
      const res = await fetch(`https://www.speedtest.net/result/${m[1]}.png`);
      if (res.ok) {
        const tmp = path.join(PRIVATE_EVIDENCE, `.tmp-${m[1]}.png`);
        fs.mkdirSync(PRIVATE_EVIDENCE, { recursive: true });
        fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
        a.screenshot ??= tmp;
        a._tmpImage = tmp;
      } else info(`! 结果图下载失败：HTTP ${res.status}`);
    }
  }
  if (a.cloudflare) {
    const p = parseCloudflare(fs.readFileSync(a.cloudflare, "utf8"));
    if (!p) fail("无法解析 Cloudflare 导出文件，请改用 --screenshot 并手动填写数值");
    info(`  匹配到的字段：${JSON.stringify(p.matched)}`);
    parsed = p;
    dataSource = "cloudflare_export";
    tool = "cloudflare";
  }
  if (a.screenshot && !a.speedtest && !a.cloudflare) {
    dataSource ??= "screenshot";
  }
  if (!sources.length && !a["from-json"])
    fail("需要原始证据：--speedtest 链接、--cloudflare 导出文件或 --screenshot 截图（三选一或组合）");
  if (!tool) fail("截图导入需要 --tool speedtest|cloudflare|other");
  if (!["speedtest", "cloudflare", "other"].includes(tool)) fail(`--tool 无效：${tool}`);

  // 手动值优先于解析值（用于纠正或补全）；没有任何来源的数值直接报错
  const pick = (manual, auto, fallback) => manual ?? auto ?? fallback ?? null;
  const down = pick(num(a.down, "下载"), parsed.downloadMbps, base.downloadMbps);
  const up = pick(num(a.up, "上传"), parsed.uploadMbps, base.uploadMbps);
  const lat = pick(num(a.latency, "延迟", { max: 10000 }), parsed.latencyMs, base.latencyMs);
  const jit = pick(num(a.jitter, "抖动", { min: -1, max: 10000 }), parsed.jitterMs, base.jitterMs);
  const loss = pick(num(a.loss, "丢包", { min: -1, max: 100 }), parsed.packetLossPct, base.packetLossPct);
  const missing = [
    [down, "--down 下载 Mbps"],
    [up, "--up 上传 Mbps"],
    [lat, "--latency 延迟 ms"],
  ].filter(([v]) => !(Number.isFinite(v) && v > 0));
  if (missing.length)
    fail(`以下数值没有从原始结果中取得，请按原始结果手动填写：${missing.map(x => x[1]).join("、")}`);
  if (down > 100000 || up > 100000) fail("速度超过 100000 Mbps，请检查单位");

  parsedAt =
    parseAt(a.at, tz) ??
    parsed.date ??
    parseAt(parsed.localTime, tz) ?? (base.testedAt ? new Date(base.testedAt) : null);
  if (!parsedAt) fail("没有取得测试时间，请用 --at \"YYYY-MM-DD HH:mm\" 按原始结果填写");
  checkDate(parsedAt);
  const testedAt = isoInTz(parsedAt, tz);

  const stamp = testedAt.slice(0, 16).replace(/[-:]/g, "").replace("T", "-");
  const id = uniqueId(`${brand}-${stamp}-${tool}`);

  if (evidenceUrl && allRuns().some(r => r.evidenceUrl === evidenceUrl))
    fail(`这个结果链接已经导入过：${evidenceUrl}`);

  const evidenceFiles = [...(base.evidenceFiles ?? [])];
  if (a.screenshot) {
    const c = copyEvidence(a.screenshot, id, "screenshot", !a.private);
    pending.push(c.write);
    evidenceFiles.push(c.entry);
  }
  if (a.cloudflare) {
    // 导出文件可能含 IP 等信息，默认只存私有目录
    const c = copyEvidence(a.cloudflare, id, "export", false);
    pending.push(c.write);
    evidenceFiles.push(c.entry);
  }
  if (!evidenceUrl && !evidenceFiles.length) fail("缺少原始证据，不能导入");

  const s = (v, d) => (v === undefined || v === "" ? (d ?? null) : String(v));
  const record = {
    id,
    brandSlug: brand,
    nodeRegion: region,
    nodeName: s(a.node, base.nodeName),
    testedAt,
    downloadMbps: down,
    uploadMbps: up,
    latencyMs: lat,
    jitterMs: jit,
    packetLossPct: loss,
    tool,
    toolName: s(a["tool-name"], base.toolName),
    dataSource: dataSource ?? "screenshot",
    evidenceUrl,
    evidenceFiles,
    server: s(a.server, parsed.server ?? base.server),
    isp: s(a.isp, base.isp),
    location: s(a.location, base.location),
    bandwidth: s(a.bandwidth, base.bandwidth),
    device: s(a.device, base.device),
    client: s(a.client, base.client),
    protocol: s(a.protocol, base.protocol),
    notes: s(a.notes, base.notes),
    importedAt: isoInTz(new Date(), "+08:00"),
    verification: { status: "pending", verifiedAt: null, notes: null },
  };

  info(`\n品牌：${b.get(brand)}  节点：${region}${record.nodeName ? ` / ${record.nodeName}` : ""}`);
  info(`时间：${testedAt}`);
  info(`下载 ${down} Mbps · 上传 ${up} Mbps · 延迟 ${lat} ms${jit !== null ? ` · 抖动 ${jit} ms` : ""}`);
  info(`证据：${[evidenceUrl, ...evidenceFiles.map(e => e.path)].filter(Boolean).join("，")}`);
  if (a.screenshot && !a.private)
    info("提示：截图会公开发布，请先确认没有露出 IP、账号、订阅链接等信息；需要隐藏请加 --private。");

  if (a["dry-run"]) {
    info("\n（--dry-run：未写入文件）");
  } else {
    fs.mkdirSync(RUNS_DIR, { recursive: true });
    pending.forEach(w => w());
    fs.writeFileSync(path.join(RUNS_DIR, `${id}.json`), `${JSON.stringify(record, null, 2)}\n`);
    info(`\n✓ 已写入 src/data/test-runs/${id}.json（状态：待核验，不会公开）`);
    info(`  对照原始结果核对无误后执行：node scripts/import-test.mjs --verify ${id}`);
  }
  if (a._tmpImage && fs.existsSync(a._tmpImage)) fs.rmSync(a._tmpImage);
}

// ---------- 入口 ----------
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  if (a.help || !Object.keys(a).length) {
    const src = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
    info(src.slice(src.indexOf("/**") + 3, src.indexOf("*/")).replace(/^ \* ?/gm, ""));
  } else if (a.list) list();
  else if (a.verify) setStatus(a.verify, "verified", a.note);
  else if (a.reject) setStatus(a.reject, "rejected", a.note);
  else await importRun(a);
}
