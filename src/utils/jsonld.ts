import config from "@/config";
import { absoluteUrl } from "./format";

const ORG_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

/** 站点级结构化数据：WebSite + Organization。主品牌“机场实测”，“机场测试”作为 alternateName */
export function websiteJsonLd() {
  const alt = config.site.altNames?.length ? config.site.altNames : undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: absoluteUrl("/"),
        name: config.site.title,
        ...(alt && { alternateName: alt }),
        description: config.site.description,
        inLanguage: "zh-CN",
        publisher: { "@id": ORG_ID },
        // 站内搜索页真实存在（/search/?q=关键词）
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl("/search/")}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: config.site.title,
        ...(alt && { alternateName: alt }),
        url: absoluteUrl("/"),
        logo: absoluteUrl("/favicon.svg"),
        ...(config.site.sameAs?.length && { sameAs: config.site.sameAs }),
      },
    ],
  };
}

/**
 * 汇总/列表页（测试档案、地区专题页、套餐比较）：CollectionPage，可附 ItemList。
 * 只放页面上真实列出的条目。
 */
export function collectionPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  items?: { name: string; url: string }[];
  modified?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    inLanguage: "zh-CN",
    isPartOf: { "@id": WEBSITE_ID },
    ...(opts.modified && { dateModified: opts.modified }),
    ...(opts.items?.length && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: opts.items.length,
        itemListElement: opts.items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: absoluteUrl(it.url),
        })),
      },
    }),
  };
}

/** 独立说明页：按页面实际用途选 WebPage / AboutPage / ContactPage，不输出页面上没有的内容 */
export function webPageJsonLd(opts: {
  type: "WebPage" | "AboutPage" | "ContactPage";
  name: string;
  description: string;
  path: string;
  modified?: Date | string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type,
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    inLanguage: "zh-CN",
    isPartOf: { "@id": WEBSITE_ID },
    ...(opts.modified && {
      dateModified:
        opts.modified instanceof Date
          ? opts.modified.toISOString()
          : opts.modified,
    }),
  };
}

/** 浏览器内运行的免费在线工具（机场网速测试）：WebApplication，不含评分等页面上没有的内容 */
export function webApplicationJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  features: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any（在现代浏览器中运行）",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
    featureList: opts.features,
    inLanguage: "zh-CN",
    publisher: { "@id": ORG_ID },
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
