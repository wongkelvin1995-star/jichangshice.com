import config from "@/config";
import { absoluteUrl } from "./format";

const ORG_ID = absoluteUrl("/#organization");

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: config.site.title,
        description: config.site.description,
        inLanguage: "zh-CN",
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: config.site.title,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/favicon.svg"),
      },
    ],
  };
}

export function breadcrumbJsonLd(
  items: { name: string; href?: string }[],
  currentPath: string
) {
  const list = [{ name: "首页", href: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(
        i === list.length - 1 ? currentPath : (c.href ?? currentPath)
      ),
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  published: Date;
  modified?: Date | null;
  section: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    mainEntityOfPage: absoluteUrl(opts.path),
    url: absoluteUrl(opts.path),
    datePublished: opts.published.toISOString(),
    dateModified: (opts.modified ?? opts.published).toISOString(),
    articleSection: opts.section,
    inLanguage: "zh-CN",
    image: absoluteUrl("/" + config.site.ogImage),
    author: {
      "@type": "Organization",
      name: config.site.author,
      url: absoluteUrl("/about/"),
    },
    publisher: {
      "@id": ORG_ID,
      "@type": "Organization",
      name: config.site.title,
      logo: { "@type": "ImageObject", url: absoluteUrl("/favicon.svg") },
    },
  };
}

/** 仅在页面正文完整展示同样问答时使用；不保证 Google 显示富媒体结果 */
export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function itemListJsonLd(
  name: string,
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.url),
    })),
  };
}
