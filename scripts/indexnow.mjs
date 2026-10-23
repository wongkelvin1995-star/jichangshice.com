#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * IndexNow 提交脚本（Bing、Yandex、Seznam 等共用 api.indexnow.org）。
 *
 * 只提交真正变化的 URL：读取线上 Sitemap，挑出 lastmod 晚于 --since 的地址；
 * 不会每次部署都提交全部 URL。密钥按 IndexNow 规范公开在网站根目录，不是私密凭证。
 *
 * 用法：
 *   node scripts/indexnow.mjs --since 2026-10-21T00:00:00+08:00   # 提交此后有更新的 URL
 *   node scripts/indexnow.mjs --urls https://jichangshice.com.cn/a/ https://jichangshice.com.cn/b/
 *   node scripts/indexnow.mjs --all                                # 首次提交：Sitemap 全部 URL
 *   加 --wait-deploy <提交SHA>：先等线上 /deploy-id.txt 变成该提交，确认部署完成再提交
 *   加 --dry-run：只列出将要提交的 URL，不发送
 *
 * 删除的页面：用 --urls 提交已删除的地址即可（IndexNow 规定删除也用同一接口通知）。
 *
 * 注意：接口返回 200/202 只表示“通知已收到”，不代表已经收录；收录情况以 Bing Webmaster Tools 为准。
 */
const SITE = "https://jichangshice.com.cn";
const HOST = new URL(SITE).host;
const KEY = "c51aaf46ff4f886e1468286abf32ae35";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
// 仅用于本地测试：把读取线上文件的地址换成本地预览（例如 http://localhost:4321）
const FETCH_BASE = process.env.INDEXNOW_FETCH_BASE || SITE;

const args = process.argv.slice(2);
const flag = n => args.includes(n);
const opt = n => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const listAfter = n => {
  const i = args.indexOf(n);
  if (i < 0) return [];
  const out = [];
  for (const a of args.slice(i + 1)) {
    if (a.startsWith("--")) break;
    out.push(a);
  }
  return out;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getText(url) {
  url = url.replace(SITE, FETCH_BASE);
  const r = await fetch(url, {
    headers: { "cache-control": "no-cache" },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.text();
}

async function waitDeploy(sha) {
  const deadline = Date.now() + 20 * 60 * 1000;
  for (;;) {
    try {
      const live = (await getText(`${SITE}/deploy-id.txt?t=${Date.now()}`)).trim();
      if (live === sha) {
        console.log(`线上已部署 ${sha}`);
        return;
      }
      console.log(`线上仍是 ${live || "（空）"}，等待部署 ${sha} …`);
    } catch (e) {
      console.log(`读取 deploy-id.txt 失败：${e.message}`);
    }
    if (Date.now() > deadline) throw new Error("等待部署超时（20 分钟），未提交");
    await sleep(30_000);
  }
}

async function sitemapEntries() {
  const index = await getText(`${SITE}/sitemap-index.xml`);
  const subs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const entries = [];
  for (const s of subs) {
    const xml = await getText(s);
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
      const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null;
      if (loc) entries.push({ loc, lastmod });
    }
  }
  return entries;
}

async function verifyKey() {
  const body = (await getText(KEY_LOCATION)).trim();
  if (body !== KEY) throw new Error(`密钥文件内容不匹配：${KEY_LOCATION}`);
  console.log(`密钥文件可访问：${KEY_LOCATION}`);
}

async function submit(urlList) {
  const payload = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });
  for (let attempt = 1; attempt <= 4; attempt++) {
    let status = 0;
    let text = "";
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: payload,
      });
      status = r.status;
      text = await r.text();
    } catch (e) {
      text = e.message;
    }
    const meaning =
      {
        200: "OK：通知已收到",
        202: "Accepted：已收到，密钥验证中",
        400: "Bad request：格式错误",
        403: "Forbidden：密钥无效或密钥文件不可访问",
        422: "Unprocessable：URL 不属于该域名或密钥不匹配",
        429: "Too many requests：提交过于频繁",
      }[status] ?? "网络错误或未知状态";
    console.log(
      `[${new Date().toISOString()}] 第 ${attempt} 次 → HTTP ${status}（${meaning}）${text ? `\n响应：${text.slice(0, 500)}` : ""}`
    );
    if (status === 200 || status === 202) return status;
    if (![0, 429, 500, 502, 503, 504].includes(status)) {
      process.exitCode = 1;
      return status;
    }
    await sleep(attempt * 20_000);
  }
  process.exitCode = 1;
  return 0;
}

const sha = opt("--wait-deploy");
if (sha) await waitDeploy(sha);

let urls = listAfter("--urls");
if (!urls.length) {
  const entries = await sitemapEntries();
  if (flag("--all")) urls = entries.map(e => e.loc);
  else {
    const since = opt("--since");
    if (!since) {
      console.error("请指定 --since <时间>、--urls 或 --all");
      process.exit(2);
    }
    const t = Date.parse(since);
    if (Number.isNaN(t)) throw new Error(`无法解析时间：${since}`);
    urls = entries
      .filter(e => e.lastmod && Date.parse(e.lastmod) > t)
      .map(e => e.loc);
  }
}
urls = [...new Set(urls)].filter(u => {
  const ok = new URL(u).host === HOST;
  if (!ok) console.log(`跳过非本站地址：${u}`);
  return ok;
});

console.log(`待提交 ${urls.length} 个 URL：`);
for (const u of urls) console.log(`  ${u}`);
if (!urls.length) {
  console.log("没有需要提交的 URL。");
  process.exit(0);
}
if (flag("--dry-run")) process.exit(0);

await verifyKey();
for (let i = 0; i < urls.length; i += 10000) await submit(urls.slice(i, i + 10000));
