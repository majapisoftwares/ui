import type { ReactNode } from "react";

/** Centered auth page: brand on top, form card below, optional footer. */
export function AuthLayout({
  brand,
  children,
  footer,
}: {
  brand?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {brand ? (
          <div className="flex items-center gap-2 self-center font-medium">
            {brand}
          </div>
        ) : null}
        {children}
        {footer ? (
          <div className="text-center text-xs text-balance text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}
