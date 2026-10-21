/** 收藏 / 比较按钮的行为（UserActions、CompareChips 共用，页面内只初始化一次）。 */
import {
  CHANGE_EVENT,
  COMPARE_MAX,
  inCompare,
  isFavorite,
  storageAvailable,
  toggleCompare,
  toggleFavorite,
} from "@/utils/userStore";

const w = window as unknown as { __jcUA?: boolean };
const ok = storageAvailable();

function sync() {
  document.querySelectorAll<HTMLButtonElement>("[data-fav]").forEach(b => {
    const on = isFavorite(b.dataset.fav!);
    b.setAttribute("aria-pressed", String(on));
    b.querySelector("[data-label]")!.textContent = on ? "已收藏" : "收藏";
    b.title = on ? "点击取消收藏" : "收藏到个人中心";
  });
  document.querySelectorAll<HTMLButtonElement>("[data-cmp]").forEach(b => {
    const on = inCompare(b.dataset.cmp!);
    b.setAttribute("aria-pressed", String(on));
    b.querySelector("[data-label]")!.textContent =
      b.dataset.chip !== undefined
        ? (on ? "✓ " : "") + (b.dataset.name ?? "")
        : on
          ? "已在比较清单"
          : "加入比较";
    b.title = on
      ? "点击移出比较清单"
      : `加入比较清单（最多 ${COMPARE_MAX} 家）`;
  });
}

function announce(from: HTMLElement, text: string) {
  const s = from
    .closest("[data-user-actions]")
    ?.querySelector<HTMLElement>("[data-ua-status]");
  if (s) s.textContent = text;
}

if (w.__jcUA) {
  // 已初始化
} else if (ok) {
  w.__jcUA = true;
  document
    .querySelectorAll<HTMLButtonElement>("[data-fav],[data-cmp]")
    .forEach(b => (b.disabled = false));
  document.addEventListener("click", e => {
    const t = e.target as HTMLElement;
    const fav = t.closest<HTMLButtonElement>("[data-fav]");
    if (fav) {
      const on = toggleFavorite(fav.dataset.fav!, fav.dataset.name ?? "");
      announce(fav, on ? "已收藏，可在个人中心查看" : "已取消收藏");
      return;
    }
    const cmp = t.closest<HTMLButtonElement>("[data-cmp]");
    if (cmp) {
      const r = toggleCompare(cmp.dataset.cmp!);
      if (r === "full") {
        announce(cmp, `比较清单最多 ${COMPARE_MAX} 家，请先在个人中心移除一家`);
        cmp.title = `比较清单已满（最多 ${COMPARE_MAX} 家）`;
        cmp.animate?.(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-3px)" },
            { transform: "translateX(3px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 240 }
        );
        const label = cmp.querySelector("[data-label]")!;
        const prev = label.textContent;
        label.textContent = `清单已满（${COMPARE_MAX} 家）`;
        setTimeout(() => (label.textContent = prev), 1800);
      } else {
        announce(cmp, r ? "已加入比较清单" : "已移出比较清单");
      }
    }
  });
  window.addEventListener(CHANGE_EVENT, sync);
  window.addEventListener("storage", sync);
  sync();
} else {
  document
    .querySelectorAll<HTMLButtonElement>("[data-fav],[data-cmp]")
    .forEach(b => (b.title = "当前浏览器禁止保存数据，无法使用此功能"));
}
