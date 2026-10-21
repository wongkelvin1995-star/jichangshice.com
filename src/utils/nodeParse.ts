/**
 * 节点地址解析（浏览器端，供“节点可用性检测”使用）。
 * 只提取 名称 + 服务器地址 + 端口，不读取、不保存密码、UUID 等敏感字段。
 */
export type NodeAddr = { name: string; host: string; port: number };

const b64 = (s: string): string | null => {
  try {
    const t = s
      .trim()
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\s+/g, "");
    const pad = t + "===".slice((t.length + 3) % 4);
    const bin = atob(pad);
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  } catch {
    return null;
  }
};

const validPort = (p: number) => Number.isInteger(p) && p > 0 && p < 65536;
const cleanHost = (h: string) => h.trim().replace(/^\[|\]$/g, "");

/** host:port、[ipv6]:port */
function hostPort(s: string): { host: string; port: number } | null {
  const m = s.trim().match(/^\[?([^\]\s]+?)\]?:(\d{1,5})$/);
  if (!m) return null;
  const port = Number(m[2]);
  return validPort(port) ? { host: cleanHost(m[1]), port } : null;
}

const decodeName = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** 单条分享链接：ss / ssr / vmess / vless / trojan / hysteria(2) / tuic 等 */
function parseUri(line: string): NodeAddr | null {
  const m = line.match(/^([a-z0-9]+):\/\/(.+)$/i);
  if (!m) return null;
  const scheme = m[1].toLowerCase();
  let rest = m[2];
  const hashAt = rest.indexOf("#");
  const name = hashAt >= 0 ? decodeName(rest.slice(hashAt + 1)) : "";
  if (hashAt >= 0) rest = rest.slice(0, hashAt);

  if (scheme === "vmess") {
    const json = b64(rest);
    if (!json) return null;
    try {
      const v = JSON.parse(json) as {
        add?: string;
        port?: string | number;
        ps?: string;
      };
      const port = Number(v.port);
      return v.add && validPort(port)
        ? { name: v.ps || name || v.add, host: cleanHost(v.add), port }
        : null;
    } catch {
      return null;
    }
  }
  if (scheme === "ssr") {
    const raw = b64(rest);
    if (!raw) return null;
    const parts = raw.split(":");
    const port = Number(parts[1]);
    return parts[0] && validPort(port)
      ? { name: name || parts[0], host: parts[0], port }
      : null;
  }
  // 其余格式：[userinfo@]host:port[/?query]
  rest = rest.replace(/[/?].*$/, "");
  if (scheme === "ss" && !rest.includes("@")) {
    // 旧格式 ss://base64(method:password@host:port)
    const raw = b64(rest);
    if (!raw) return null;
    rest = raw;
  }
  const hp = hostPort(rest.slice(rest.lastIndexOf("@") + 1));
  return hp ? { name: name || hp.host, ...hp } : null;
}

/** Clash / Mihomo YAML：从 proxies 中取 name、server、port（块写法与行内写法都支持） */
function parseClash(text: string): NodeAddr[] {
  const out: NodeAddr[] = [];
  const chunks = text.split(/\n\s*-\s+(?=\{|name\s*:)/);
  for (const c of chunks) {
    const server = c.match(/(?:^|[\s{,])server\s*:\s*["']?([^"',}\s]+)/);
    const port = c.match(/(?:^|[\s{,])port\s*:\s*["']?(\d{1,5})/);
    if (!server || !port) continue;
    const name = c.match(/(?:^|[\s{,])name\s*:\s*["']?([^"',}\n]+)/);
    const p = Number(port[1]);
    if (validPort(p))
      out.push({
        name: name ? name[1].trim() : server[1],
        host: cleanHost(server[1]),
        port: p,
      });
  }
  return out;
}

/** 任意输入：手动地址列表、分享链接、Base64 订阅内容、Clash YAML */
export function parseNodes(input: string): NodeAddr[] {
  let text = input.trim();
  if (!text) return [];
  if (/(^|\n)\s*proxies\s*:/.test(text) || /\n\s*-\s+\{?\s*name\s*:/.test(text))
    return dedupe(parseClash(text));
  // 整段 Base64 订阅
  if (
    !/[:\s]/.test(text.slice(0, 200)) ||
    /^[A-Za-z0-9+/=_-]+$/.test(text.replace(/\s+/g, ""))
  ) {
    const d = b64(text);
    if (d && /:\/\//.test(d)) text = d;
  }
  const out: NodeAddr[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const u = line.includes("://") ? parseUri(line) : null;
    if (u) {
      out.push(u);
      continue;
    }
    const [addr, ...label] = line.split(/\s+/);
    const hp = hostPort(addr);
    if (hp) out.push({ name: label.join(" ") || hp.host, ...hp });
  }
  return dedupe(out);
}

function dedupe(list: NodeAddr[]): NodeAddr[] {
  const seen = new Set<string>();
  return list.filter(n => {
    const k = `${n.host}:${n.port}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
