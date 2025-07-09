import type { UIEvent } from "react";

export default function stopPropagation(event: UIEvent) {
  event.stopPropagation();
}
