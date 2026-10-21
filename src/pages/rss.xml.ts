import rss from "@astrojs/rss";
import { getPublishedPosts, postUrl } from "@/utils/posts";
import config from "@/config";

export async function GET() {
  const posts = await getPublishedPosts();
  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,
    customData: "<language>zh-CN</language>",
    items: posts.map(p => ({
      link: postUrl(p),
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDatetime,
      categories: [p.data.category],
    })),
  });
}
