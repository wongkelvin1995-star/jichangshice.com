import { getCollection, type CollectionEntry } from "astro:content";

export type TestRecord = CollectionEntry<"testRecords">;

/** 全部测速记录，按日期从新到旧 */
export async function getTestRecords(): Promise<TestRecord[]> {
  return (await getCollection("testRecords")).sort((a, b) =>
    b.data.recordedAt.localeCompare(a.data.recordedAt)
  );
}

export function recordsOf(all: TestRecord[], slug: string): TestRecord[] {
  return all.filter(r => r.data.brandSlug === slug);
}

/** 记录的时段：批次级 window 优先，否则汇总各行的时段（如“日间 / 晚高峰”） */
export function recordWindow(r: TestRecord): string | null {
  if (r.data.window) return r.data.window;
  const ws = [...new Set(r.data.rows.map(x => x.window).filter(Boolean))];
  return ws.length ? ws.join(" / ") : null;
}
