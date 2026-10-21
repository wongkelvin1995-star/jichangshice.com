import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import config from "@/config";

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDate(d: Date | string, tz = config.site.timezone) {
  return dayjs(d).tz(tz).format("YYYY-MM-DD");
}

export function isoDate(d: Date | string, tz = config.site.timezone) {
  return dayjs(d).tz(tz).format();
}

export function fmtMoney(n: number) {
  return Number.isInteger(n)
    ? `¥${n}`
    : `¥${n.toFixed(2).replace(/\.?0+$/, "")}`;
}

export function fmtGB(gb: number) {
  if (gb >= 1024 && gb % 1024 === 0) return `${gb / 1024}TB`;
  return `${Number.isInteger(gb) ? gb : gb.toFixed(1)}GB`;
}

export function absoluteUrl(path: string) {
  return new URL(path, config.site.url).href;
}
