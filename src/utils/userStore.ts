/**
 * 个人中心的本地数据（仅浏览器端使用）。
 *
 * 本站没有账号系统：收藏、浏览历史、比较清单、偏好设置都只保存在
 * 当前浏览器的 localStorage 中，不上传服务器，换浏览器或清除网站数据后会消失。
 * 所有读写都包在 try/catch 里：隐私模式或禁用存储时功能降级为“不保存”，页面不报错。
 */

export type FavoriteItem = { slug: string; name: string; at: number };
export type HistoryItem = {
  url: string;
  title: string;
  type: "airport" | "article";
  at: number;
};
export type Prefs = {
  /** 是否记录浏览历史 */
  recordHistory: boolean;
  /** 浏览历史最多保留条数 */
  historyLimit: number;
  /** 打开“套餐比较”时默认的预算筛选（与比较页筛选值一致） */
  defaultBudget: "" | "le20" | "le50" | "le100" | "gt100" | "onetime";
  /** 正文字号 */
  fontSize: "normal" | "large";
};

export const COMPARE_MAX = 6;
export const DEFAULT_PREFS: Prefs = {
  recordHistory: true,
  historyLimit: 50,
  defaultBudget: "",
  fontSize: "normal",
};

const KEYS = {
  favorites: "jc:favorites",
  history: "jc:history",
  compare: "jc:compare",
  prefs: "jc:prefs",
} as const;

/** 本页内数据变化时广播，让同页的多个按钮同步状态 */
export const CHANGE_EVENT = "jc:store-change";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const v = JSON.parse(raw) as unknown;
    return (v ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
    return true;
  } catch {
    return false;
  }
}

/** 当前浏览器能否保存数据（隐私模式/禁用存储时为 false） */
export function storageAvailable(): boolean {
  try {
    const k = "jc:probe";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

// ---- 收藏 ----
export function getFavorites(): FavoriteItem[] {
  const v = read<FavoriteItem[]>(KEYS.favorites, []);
  return Array.isArray(v) ? v.filter(x => x && typeof x.slug === "string") : [];
}
export function isFavorite(slug: string): boolean {
  return getFavorites().some(f => f.slug === slug);
}
export function toggleFavorite(slug: string, name: string): boolean {
  const list = getFavorites();
  const on = !list.some(f => f.slug === slug);
  const next = on
    ? [{ slug, name, at: Date.now() }, ...list]
    : list.filter(f => f.slug !== slug);
  write(KEYS.favorites, next);
  return on;
}
export function removeFavorite(slug: string) {
  write(
    KEYS.favorites,
    getFavorites().filter(f => f.slug !== slug)
  );
}

// ---- 比较清单 ----
export function getCompare(): string[] {
  const v = read<string[]>(KEYS.compare, []);
  return Array.isArray(v) ? v.filter(x => typeof x === "string") : [];
}
export function inCompare(slug: string): boolean {
  return getCompare().includes(slug);
}
/** 返回切换后的状态；清单已满时返回 "full" 且不改变数据 */
export function toggleCompare(slug: string): boolean | "full" {
  const list = getCompare();
  if (list.includes(slug)) {
    write(
      KEYS.compare,
      list.filter(s => s !== slug)
    );
    return false;
  }
  if (list.length >= COMPARE_MAX) return "full";
  write(KEYS.compare, [...list, slug]);
  return true;
}
export function removeCompare(slug: string) {
  write(
    KEYS.compare,
    getCompare().filter(s => s !== slug)
  );
}
export function clearCompare() {
  write(KEYS.compare, []);
}

// ---- 偏好 ----
export function getPrefs(): Prefs {
  const v = read<Partial<Prefs>>(KEYS.prefs, {});
  return { ...DEFAULT_PREFS, ...(v && typeof v === "object" ? v : {}) };
}
export function setPrefs(patch: Partial<Prefs>) {
  const next = { ...getPrefs(), ...patch };
  write(KEYS.prefs, next);
  applyFontSize(next.fontSize);
  if (patch.historyLimit) trimHistory(next.historyLimit);
}
export function applyFontSize(size: Prefs["fontSize"]) {
  if (size === "large") document.documentElement.dataset.font = "large";
  else delete document.documentElement.dataset.font;
}

// ---- 浏览历史 ----
export function getHistory(): HistoryItem[] {
  const v = read<HistoryItem[]>(KEYS.history, []);
  return Array.isArray(v) ? v.filter(x => x && typeof x.url === "string") : [];
}
export function recordVisit(item: Omit<HistoryItem, "at">) {
  const prefs = getPrefs();
  if (!prefs.recordHistory) return;
  const list = getHistory().filter(h => h.url !== item.url);
  write(
    KEYS.history,
    [{ ...item, at: Date.now() }, ...list].slice(0, prefs.historyLimit)
  );
}
export function removeHistory(url: string) {
  write(
    KEYS.history,
    getHistory().filter(h => h.url !== url)
  );
}
export function clearHistory() {
  write(KEYS.history, []);
}
function trimHistory(limit: number) {
  const list = getHistory();
  if (list.length > limit) write(KEYS.history, list.slice(0, limit));
}
