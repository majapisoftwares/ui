import type { UIEvent } from "react";

export default function preventDefault(event: UIEvent) {
  event.preventDefault();
}
