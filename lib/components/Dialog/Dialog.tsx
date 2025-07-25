import * as RDialog from "@radix-ui/react-dialog";
import type { DialogContentProps } from "@radix-ui/react-dialog";
import { Fragment, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import Button from "../Button";
import clsx from "../../utils/clsx";

import { modalContentClassName } from "../../styles/Modal.classNames";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface DialogProps {
  title: ReactNode;
  description?: ReactNode;
  contentClassName?: string;
  contentOverflowClassName?: string;
  closeButtonClassName?: string;
  overlayClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  hideTitle?: boolean;
  contentProps?: Omit<DialogContentProps, "children">;
  hideCloseButton?: boolean;
}

export default function Dialog({
  children,
  title,
  description,
  open,
  onOpenChange,
  contentClassName,
  contentOverflowClassName,
  closeButtonClassName,
  overlayClassName,
  titleClassName,
  descriptionClassName,
  hideTitle,
  contentProps,
  hideCloseButton,
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & DialogProps) {
  const TitleWrapper = !hideTitle ? Fragment : VisuallyHidden;

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay
          className={clsx(
            "ui-dialog-overlay",
            "fixed inset-0 z-20 flex items-center justify-center bg-black/50",
            "data-[state=closed]:animate-fade-out data-[state=open]:animate-slide-up-and-fade will-change-[opacity,transform]",
            overlayClassName,
          )}
        >
          <RDialog.Content
            className={clsx(
              modalContentClassName,
              "ui-dialog-content",
              "relative p-0 focus:outline-hidden",
              contentClassName,
              contentProps?.className,
            )}
            {...(!description ? { "aria-describedby": undefined } : {})}
            {...contentProps}
          >
            <div
              className={clsx(
                "flex max-h-[85vh] w-[90vw] max-w-[450px] flex-col gap-3 overflow-auto p-4",
                contentOverflowClassName,
              )}
            >
              <TitleWrapper>
                <RDialog.Title
                  className={clsx(
                    "ui-dialog-title",
                    "text-lg leading-none font-medium text-zinc-900 dark:text-zinc-50",
                    titleClassName,
                  )}
                >
                  {title}
                </RDialog.Title>
              </TitleWrapper>
              {description && (
                <RDialog.Description
                  className={clsx(
                    "ui-dialog-description",
                    "text-zinc-700 dark:text-zinc-300",
                    descriptionClassName,
                  )}
                >
                  {description}
                </RDialog.Description>
              )}
              {children}
              {!hideCloseButton && (
                <RDialog.Close asChild>
                  <Button
                    className={clsx(
                      "absolute top-1 right-1 p-1.5",
                      "ui-dialog-close-button",
                      closeButtonClassName,
                    )}
                    aria-label="Close"
                    variant="text"
                    icon
                  >
                    <XMarkIcon />
                  </Button>
                </RDialog.Close>
              )}
            </div>
          </RDialog.Content>
        </RDialog.Overlay>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

Dialog.Close = RDialog.Close;
