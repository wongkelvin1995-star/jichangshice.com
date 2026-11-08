/* eslint-disable no-console -- 命令行工具需要输出到终端 */
/**
 * 为测速汇总图生成小尺寸副本，给首页缩略图和 <img srcset> 使用。
 * 原图不改动、不删除；只新增 <名字>-w168.webp / -w480.webp / -w800.webp。
 *
 * 用法：node scripts/make-photo-derivatives.mjs
 * 新增一张汇总图（public/images/tests/xxx.webp）后运行一次即可；
 * 没有生成副本时页面会自动退回原图，不会出错。
 */
import sharp from "sharp";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = new URL("../public/images/tests/", import.meta.url).pathname;
const WIDTHS = [168, 480, 800];

for (const f of readdirSync(DIR)) {
  if (!/\.webp$/.test(f) || /-w\d+\.webp$/.test(f)) continue;
  const src = join(DIR, f);
  const { width } = await sharp(src).metadata();
  for (const w of WIDTHS) {
    if (w >= width) continue;
    const out = join(DIR, f.replace(/\.webp$/, `-w${w}.webp`));
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs)
      continue;
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(out);
    console.log(`生成 ${out.slice(DIR.length)}  ${statSync(out).size} 字节`);
  }
}
