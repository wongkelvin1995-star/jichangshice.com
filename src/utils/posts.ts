import { getCollection, type CollectionEntry } from "astro:content";
import { getSortedPosts } from "./getSortedPosts";

export type Post = CollectionEntry<"posts">;

/** 文章 slug = 文件名（不含扩展名） */
export function postSlug(post: Post): string {
  const parts = post.id.split("/");
  return parts[parts.length - 1];
}

/** 文章唯一规范路径：/{category}/{slug}/ */
export function postUrl(post: Post): string {
  return `/${post.data.category}/${postSlug(post)}/`;
}

export async function getPublishedPosts(): Promise<Post[]> {
  return getSortedPosts(await getCollection("posts"));
}

/** related 字段格式为 "category/slug" */
export function findByRef(posts: Post[], ref: string): Post | undefined {
  const [category, slug] = ref.split("/");
  return posts.find(p => p.data.category === category && postSlug(p) === slug);
}

export function chineseCharCount(text: string): number {
  return (text.match(/[一-鿿]/g) ?? []).length;
}

/** 估算阅读时长（中文约 400 字/分钟） */
export function readingMinutes(post: Post): number {
  return Math.max(1, Math.round(chineseCharCount(post.body ?? "") / 400));
}
