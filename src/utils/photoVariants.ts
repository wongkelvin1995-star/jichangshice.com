/**
 * 测速汇总图的小尺寸副本（public/images/tests/<名字>-w168.webp 等，由 scripts/make-photo-derivatives.mjs 生成）。
 * 页面里的缩略图和 <img srcset> 用它们，避免为 56 像素宽的缩略图下载 150KB 的原图；
 * 原图仍是点击后的“查看大图”目标，也仍用于 og:image 和结构化数据，不被替换或删除。
 * 副本文件不存在时只返回原图，页面照常显示。
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

export const PHOTO_WIDTHS = [168, 480, 800] as const;

export type PhotoVariant = { url: string; w: number };

/** 可用的尺寸，从小到大，最后一项是原图 */
export function photoVariants(src: string, fullWidth: number): PhotoVariant[] {
  const list: PhotoVariant[] = [];
  const m = src.match(/^(\/images\/tests\/.+)\.webp$/);
  if (m) {
    for (const w of PHOTO_WIDTHS) {
      const url = `${m[1]}-w${w}.webp`;
      if (w < fullWidth && existsSync(join(process.cwd(), "public", url)))
        list.push({ url, w });
    }
  }
  list.push({ url: src, w: fullWidth });
  return list;
}

export const toSrcset = (list: PhotoVariant[]) =>
  list.map(v => `${v.url} ${v.w}w`).join(", ");
