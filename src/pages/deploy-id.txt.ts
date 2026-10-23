import type { APIRoute } from "astro";
import { execSync } from "node:child_process";

/**
 * 部署标记：输出本次构建的 Git 提交号，供 IndexNow 工作流确认线上已经部署完成后再提交。
 * Cloudflare Pages 构建时提供 CF_PAGES_COMMIT_SHA；本地构建退回 git rev-parse。
 */
function commitSha(): string {
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

export const GET: APIRoute = () =>
  new Response(`${commitSha()}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
