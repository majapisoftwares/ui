import * as RTooltip from "@radix-ui/react-tooltip";
import { ReactNode, Ref } from "react";
import clsx from "../../utils/clsx";

function Tooltip({
  children,
  content,
  side,
  delayDuration,
  className,
  arrowClassName,
  ref,
}: {
  children?: ReactNode;
  content?: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delayDuration?: number;
  className?: string;
  arrowClassName?: string;
  ref?: Ref<HTMLButtonElement>;
}) {
  if (!content) {
    return <>{children}</>;
  }

  return (
    <RTooltip.Provider>
      <RTooltip.Root delayDuration={delayDuration}>
        <RTooltip.Trigger asChild ref={ref}>
          {children}
        </RTooltip.Trigger>
        <RTooltip.Portal>
          <RTooltip.Content
            className={clsx(
              "z-20 rounded-sm bg-zinc-950 px-2 py-1 text-center text-sm text-zinc-50 shadow-sm",
              "dark:bg-zinc-50 dark:text-zinc-950",
              "data-[state=closed]:animate-fade-out data-[state=delayed-open]:data-[side=bottom]:animate-elastic-slide-up-and-fade data-[state=delayed-open]:data-[side=left]:animate-elastic-slide-right-and-fade data-[state=delayed-open]:data-[side=right]:animate-elastic-slide-left-and-fade data-[state=delayed-open]:data-[side=top]:animate-elastic-slide-down-and-fade will-change-[transform,opacity]",
              className,
            )}
            sideOffset={5}
            side={side}
          >
            {content}
            <RTooltip.Arrow
              className={clsx(
                "fill-zinc-950 dark:fill-zinc-50",
                arrowClassName,
              )}
            />
          </RTooltip.Content>
        </RTooltip.Portal>
      </RTooltip.Root>
    </RTooltip.Provider>
  );
}

export default Tooltip;
