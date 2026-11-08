/**
 * Markdown 正文里的站外链接：新窗口打开并加 noopener。
 * 推广入口不写在 Markdown 里，统一由 <EntryLink> 组件输出 rel="sponsored nofollow"。
 */
type Node = {
  type: string;
  value?: string;
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

/**
 * 把 Markdown 表格包在可横向滚动的容器里，手机端不撑宽页面。
 * - 容器是可聚焦的 region，名称取表格前最近的小标题（同一小标题下有多张表时加编号），同一页内不重名；
 * - 表头里空白的单元格（常见于左上角）补一个只给读屏软件读的“项目”，避免读到空表头。
 */
function fillEmptyHeaders(node: Node) {
  if (node.type === "element" && node.tagName === "th") {
    const hasContent =
      textOf(node).trim() !== "" ||
      (node.children ?? []).some(c => c.type === "element");
    if (!hasContent)
      node.children = [
        {
          type: "element",
          tagName: "span",
          properties: { className: ["sr-only"] },
          children: [{ type: "text", value: "项目" }],
        },
      ];
  }
  node.children?.forEach(fillEmptyHeaders);
}

function wrapTables(tree: Node) {
  let heading = "";
  const used = new Map<string, number>();
  const visit = (node: Node) => {
    if (!node.children) return;
    node.children = node.children.map(child => {
      if (child.type === "element" && /^h[1-6]$/.test(child.tagName ?? ""))
        heading = textOf(child).replace(/\s+/g, " ").trim().slice(0, 40);
      if (child.type === "element" && child.tagName === "table") {
        fillEmptyHeaders(child);
        const base = heading ? `${heading}的表格` : "表格";
        const n = (used.get(base) ?? 0) + 1;
        used.set(base, n);
        return {
          type: "element",
          tagName: "div",
          properties: {
            className: ["table-scroll"],
            tabIndex: 0,
            role: "region",
            ariaLabel: `${n > 1 ? `${base} ${n}` : base}（可横向滑动）`,
          },
          children: [child],
        };
      }
      visit(child);
      return child;
    });
  };
  visit(tree);
}

export function rehypeTableScroll() {
  return (tree: Node) => wrapTables(tree);
}

/** Markdown 清单（- [ ] 项目）生成的复选框没有标签，读屏软件只会读到“复选框”：用该条清单文字作为它的名称 */
function textOf(node: Node): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}
function labelTasks(node: Node) {
  const classes = (node.properties?.className as string[] | undefined) ?? [];
  if (
    node.type === "element" &&
    node.tagName === "li" &&
    classes.includes("task-list-item")
  ) {
    const input = (node.children ?? []).find(
      c => c.type === "element" && c.tagName === "input"
    );
    const label = textOf(node).replace(/\s+/g, " ").trim();
    if (input?.properties && label)
      input.properties.ariaLabel = label.slice(0, 120);
  }
  node.children?.forEach(labelTasks);
}

export function rehypeTaskLabels() {
  return (tree: Node) => labelTasks(tree);
}
