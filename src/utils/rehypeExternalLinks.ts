/**
 * Markdown 正文里的站外链接：新窗口打开并加 noopener。
 * 推广入口不写在 Markdown 里，统一由 <EntryLink> 组件输出 rel="sponsored nofollow"。
 */
type Node = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

const SITE_HOST = "jichangshice.com.cn";

function walk(node: Node) {
  if (node.type === "element" && node.tagName === "a" && node.properties) {
    const href = String(node.properties.href ?? "");
    if (/^https?:\/\//.test(href) && !href.includes(SITE_HOST)) {
      node.properties.target = "_blank";
      node.properties.rel = ["noopener", "noreferrer"];
    }
  }
  node.children?.forEach(walk);
}

export function rehypeExternalLinks() {
  return (tree: Node) => walk(tree);
}

/** 把 Markdown 表格包在可横向滚动的容器里，手机端不撑宽页面 */
function wrapTables(node: Node) {
  if (!node.children) return;
  node.children = node.children.map(child => {
    if (child.type === "element" && child.tagName === "table") {
      return {
        type: "element",
        tagName: "div",
        properties: {
          className: ["table-scroll"],
          tabIndex: 0,
          role: "region",
          ariaLabel: "表格（可横向滑动）",
        },
        children: [child],
      };
    }
    wrapTables(child);
    return child;
  });
}

export function rehypeTableScroll() {
  return (tree: Node) => wrapTables(tree);
}
