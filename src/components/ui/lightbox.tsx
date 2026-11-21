"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { Button } from "./button";
import { useUiMessages } from "../../lib/i18n";

export interface LightboxImage {
  src: string;
  alt?: string;
}

const MAX_ZOOM = 6;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const RESET = { scale: 1, x: 0, y: 0 };

/**
 * A full-screen dialog with one image of a list: a tap/click, scroll, the
 * buttons or a pinch zoom it, a zoomed image is dragged, Esc, a click outside
 * or the X close it, the arrows (or left/right keys) go to the other images.
 * `index` is the open image (null = closed).
 */
function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const open = index !== null && images[index] !== undefined;
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {open ? (
        <DialogContent
          data-slot="lightbox"
          className="fixed inset-0 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none bg-black/90 p-0 sm:max-w-none"
        >
          <LightboxStage
            key={index}
            images={images}
            index={index}
            onIndexChange={onIndexChange}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function LightboxStage({
  images,
  index,
  onIndexChange,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const messages = useUiMessages();
  const image = images[index];
  const [view, setView] = React.useState(RESET);
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const gesture = React.useRef({ distance: 0, scale: 1, moved: false });
  const stage = React.useRef<HTMLDivElement>(null);

  const withScale = (v: typeof RESET, scale: number) => {
    const next = clamp(scale, 1, MAX_ZOOM);
    return next === 1 ? RESET : { ...v, scale: next };
  };

  React.useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setView((v) => withScale(v, v.scale * Math.exp(-event.deltaY * 0.002)));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      if (event.key === "ArrowRight" && index < images.length - 1)
        onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onIndexChange]);

  const spread = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  return (
    <>
      <DialogTitle className="sr-only">
        {image.alt || messages.image}
      </DialogTitle>
      <div
        ref={stage}
        data-slot="lightbox-stage"
        className="flex size-full touch-none items-center justify-center overflow-hidden select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
          });
          if (pointers.current.size === 1) gesture.current.moved = false;
          if (pointers.current.size === 2)
            gesture.current = {
              distance: spread(),
              scale: view.scale,
              moved: true,
            };
        }}
        onPointerMove={(event) => {
          const last = pointers.current.get(event.pointerId);
          if (!last) return;
          pointers.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
          });
          if (pointers.current.size === 2) {
            const ratio = spread() / (gesture.current.distance || 1);
            setView((v) => withScale(v, gesture.current.scale * ratio));
            return;
          }
          const dx = event.clientX - last.x;
          const dy = event.clientY - last.y;
          if (Math.abs(dx) + Math.abs(dy) > 2) gesture.current.moved = true;
          setView((v) =>
            v.scale > 1 ? { ...v, x: v.x + dx, y: v.y + dy } : v,
          );
        }}
        onPointerUp={(event) => {
          if (!pointers.current.delete(event.pointerId)) return;
          // A tap (no drag, no pinch) toggles the zoom.
          if (pointers.current.size === 0 && !gesture.current.moved)
            setView((v) => (v.scale > 1 ? RESET : { ...v, scale: 2.5 }));
        }}
        onPointerCancel={(event) => pointers.current.delete(event.pointerId)}
      >
        <img
          src={image.src}
          alt={image.alt ?? ""}
          draggable={false}
          data-slot="lightbox-image"
          data-scale={view.scale}
          className="max-h-full max-w-full object-contain will-change-transform"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            cursor: view.scale > 1 ? "grab" : "zoom-in",
          }}
        />
      </div>
      {index > 0 ? (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full"
          aria-label={messages.previousImage}
          onClick={() => onIndexChange(index - 1)}
        >
          <ChevronLeftIcon />
        </Button>
      ) : null}
      {index < images.length - 1 ? (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full"
          aria-label={messages.nextImage}
          onClick={() => onIndexChange(index + 1)}
        >
          <ChevronRightIcon />
        </Button>
      ) : null}
      <div className="absolute bottom-[max(1rem,var(--safe-bottom))] left-1/2 flex -translate-x-1/2 gap-2">
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={messages.zoomOut}
          onClick={() => setView((v) => withScale(v, v.scale / 1.5))}
        >
          <MinusIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label={messages.zoomIn}
          onClick={() => setView((v) => withScale(v, v.scale * 1.5))}
        >
          <PlusIcon />
        </Button>
      </div>
    </>
  );
}

export { Lightbox };
