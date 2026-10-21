/**
 * 站内搜索引擎（浏览器端，无依赖）。
 * 中文：规范化后做连续子串匹配，不依赖空格分词，“灵动”“动云”都能命中“灵动云”；
 * 英文：大小写不敏感；全角/半角、空格、标点统一规范化。
 * 多个关键词（空格分隔）为“同时包含”。
 * 排序：标题完全匹配 > 标题包含 > 机场名称/别名 > 小节标题 > 摘要 > 正文。
 */
import type { SearchEntry, SearchSection } from "./searchIndex";

const STRIP = /[\s\p{P}\p{S}]+/gu;

export function norm(s: string): string {
  return s.normalize("NFKC").toLowerCase().replace(STRIP, "");
}

export function terms(q: string): string[] {
  return [
    ...new Set(
      q
        .normalize("NFKC")
        .toLowerCase()
        .split(STRIP)
        .filter(t => t.length > 0)
    ),
  ];
}

type Prepared = {
  e: SearchEntry;
  t: string;
  k: string[];
  d: string;
  s: { h: string; x: string; raw: SearchSection }[];
};

export function prepare(entries: SearchEntry[]): Prepared[] {
  return entries.map(e => ({
    e,
    t: norm(e.t),
    k: e.k.map(norm).filter(Boolean),
    d: norm(e.d),
    s: e.s.map(raw => ({ h: norm(raw.h), x: norm(raw.x), raw })),
  }));
}

export type Hit = {
  entry: SearchEntry;
  url: string;
  score: number;
  /** HTML（已转义，关键词用 <mark> 标出） */
  snippet: string;
  /** 命中的小节标题（正文命中时） */
  section?: string;
};

function count(hay: string, needle: string, max = 5): number {
  let n = 0;
  let i = hay.indexOf(needle);
  while (i !== -1 && n < max) {
    n++;
    i = hay.indexOf(needle, i + needle.length);
  }
  return n;
}

export function escHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!
  );
}

function escRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 从原文截取包含关键词的片段并高亮 */
export function makeSnippet(text: string, ts: string[], len = 90): string {
  const src = text.normalize("NFKC");
  const lower = src.toLowerCase();
  let at = -1;
  for (const t of ts) {
    const i = lower.indexOf(t);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  let start = 0;
  if (at > 30) start = at - 30;
  let piece = src.slice(start, start + len);
  if (start > 0) piece = "…" + piece;
  if (start + len < src.length) piece += "…";
  let html = escHtml(piece);
  const marks = ts
    .filter(t => t.length > 0)
    .sort((a, b) => b.length - a.length);
  if (marks.length) {
    const re = new RegExp(
      `(${marks.map(t => escRe(escHtml(t))).join("|")})`,
      "gi"
    );
    html = html.replace(re, "<mark>$1</mark>");
  }
  return html;
}

export function search(index: Prepared[], query: string, limit = 20): Hit[] {
  const ts = terms(query);
  if (ts.length === 0) return [];
  const whole = norm(query);
  const hits: Hit[] = [];

  for (const p of index) {
    let score = 0;
    let ok = true;
    let titleOrName = false;
    const secScore = new Map<number, number>();
    let total = 0;

    if (p.t === whole) score += 1000;

    for (const t of ts) {
      let ts_ = 0;
      if (p.t.includes(t)) {
        ts_ += 200;
        titleOrName = true;
      }
      if (p.k.some(k => k === t)) {
        ts_ += 160;
        titleOrName = true;
      } else if (p.k.some(k => k.includes(t))) {
        ts_ += 110;
        titleOrName = true;
      }
      if (p.d.includes(t)) ts_ += 40;
      p.s.forEach((s, i) => {
        let v = 0;
        if (s.h.includes(t)) v += 60;
        const c = count(s.x, t);
        if (c) {
          v += 10 + c * 2;
          total += c;
        }
        if (v) secScore.set(i, (secScore.get(i) ?? 0) + v);
      });
      const bodyBest = Math.max(0, ...p.s.map((_, i) => secScore.get(i) ?? 0));
      if (ts_ === 0 && bodyBest === 0) {
        ok = false;
        break;
      }
      score += ts_;
    }
    if (!ok) continue;

    // 正文得分：取最相关的小节，避免长文仅因篇幅占优
    let bestIdx = -1;
    let bestVal = 0;
    secScore.forEach((v, i) => {
      if (v > bestVal) {
        bestVal = v;
        bestIdx = i;
      }
    });
    score += Math.min(bestVal, 150);
    // 全文出现次数作为同分时的相关度补充
    score += Math.min(total, 30) * 2;

    const sec = bestIdx >= 0 ? p.s[bestIdx].raw : undefined;
    // 标题或名称命中：直接打开页面；只在正文命中：定位到对应小节
    let url = p.e.u;
    if (!titleOrName && sec?.a) url = p.e.u.replace(/#.*$/, "") + "#" + sec.a;

    const descHas = ts.some(t => p.d.includes(t));
    const snippetSrc = (titleOrName && descHas) || !sec?.x ? p.e.d : sec.x;
    hits.push({
      entry: p.e,
      url,
      score,
      snippet: makeSnippet(snippetSrc || p.e.d, ts),
      section: !titleOrName && sec?.h ? sec.h : undefined,
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
