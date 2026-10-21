import type { APIRoute } from "astro";
import { buildSearchIndex } from "@/utils/searchIndex";

/** 构建时输出 /search-index.json（静态文件，随部署产物一起发布） */
export const GET: APIRoute = async () => {
  const entries = await buildSearchIndex();
  return new Response(
    JSON.stringify({ v: 1, built: new Date().toISOString(), entries }),
    { headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
};
