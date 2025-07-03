import type { MouseEvent } from "react";

export default function smoothScrollToHref(event: MouseEvent) {
  event.preventDefault();
  const href = event.currentTarget.getAttribute("href");
  if (href) {
    const targetId = href.split("#")[1];
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth" });
  }
}
