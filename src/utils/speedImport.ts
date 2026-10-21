/**
 * 测速结果解析（浏览器端，供 /test-records/submit/ 录入助手使用）。
 * 与 scripts/import-test.mjs 的解析规则保持一致；解析结果只用于预填，必须人工核对。
 */

export const SPEEDTEST_RE =
  /^https:\/\/(?:www\.)?speedtest\.net\/(?:my-)?result\/(?:[a-z]\/)?(\d+)\/?(?:[?#].*)?$/i;

/** 返回 Speedtest 结果 ID；不是有效结果链接时返回 null */
export function speedtestId(url: string): string | null {
  return url.trim().match(SPEEDTEST_RE)?.[1] ?? null;
}

export type Parsed = {
  matched: Record<string, string | undefined>;
  downloadMbps: number | null;
  uploadMbps: number | null;
  latencyMs: number | null;
  jitterMs: number | null;
  packetLossPct: number | null;
  /** 带时区或时间戳的时间 */
  date: Date | null;
  /** 没有时区的时间文本（按 UTC+8 解释） */
  localTime: string | null;
};

function flatten(
  obj: unknown,
  prefix = "",
  out: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const [k, v] of Object.entries((obj as object) ?? {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function csvRows(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') q = false;
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") {
        cells.push(cur.trim());
        cur = "";
      } else cur += c;
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

/** Cloudflare 测速导出（JSON / CSV）启发式解析，规则同 scripts/import-test.mjs */
export function parseCloudflare(text: string): Parsed | null {
  let flat: Record<string, unknown>;
  const t = text.trim();
  if (t.startsWith("{") || t.startsWith("[")) {
    let j = JSON.parse(t) as unknown;
    if (Array.isArray(j)) j = j.at(-1);
    flat = flatten(j);
  } else {
    const rows = csvRows(t);
    if (rows.length < 2) return null;
    if (rows[0].length === 2 && rows.length > 2)
      flat = Object.fromEntries(rows.map(r => [r[0], r[1]]));
    else flat = Object.fromEntries(rows[0].map((h, i) => [h, rows.at(-1)![i]]));
  }
  const entries = Object.entries(flat).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined
  );
  const val = (v: unknown) => Number(String(v).replace(/[^\d.eE+-]/g, ""));
  const numeric = entries.filter(([, v]) => Number.isFinite(val(v)));
  const loaded = (k: string) => /(?<!un)loaded|during|under/i.test(k);
  const find = (re: RegExp, exclude = /$^/) =>
    numeric.find(([k]) => re.test(k) && !exclude.test(k) && !loaded(k));
  const speed = (hit?: [string, unknown]) => {
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
  const timeHit = entries.find(
    ([k]) => /time|date/i.test(k) && !/latency/i.test(k)
  );
  let date: Date | null = null;
  let localTime: string | null = null;
  if (timeHit) {
    const v = String(timeHit[1]).trim();
    const n = Number(v);
    if (Number.isFinite(n) && n > 1e9) date = new Date(n > 1e11 ? n : n * 1000);
    else if (/(Z|[+-]\d{2}:?\d{2})$/.test(v) && !Number.isNaN(Date.parse(v)))
      date = new Date(v);
    else localTime = v;
  }
  const round = (n: number | null) =>
    n === null ? null : Math.round(n * 100) / 100;
  return {
    matched: {
      download: dl?.[0],
      upload: ul?.[0],
      latency: lat?.[0],
      jitter: jit?.[0],
      packetLoss: loss?.[0],
      time: timeHit?.[0],
    },
    downloadMbps: round(speed(dl)),
    uploadMbps: round(speed(ul)),
    latencyMs: lat ? round(val(lat[1])) : null,
    jitterMs: jit ? round(val(jit[1])) : null,
    packetLossPct: loss ? round(val(loss[1])) : null,
    date,
    localTime,
  };
}

/** Date → UTC+8 的 datetime-local 值（YYYY-MM-DDTHH:mm） */
export function toLocalInput(d: Date): string {
  const t = new Date(d.getTime() + 8 * 3600_000);
  return t.toISOString().slice(0, 16);
}
