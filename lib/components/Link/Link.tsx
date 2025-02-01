import { ComponentProps, DetailedHTMLProps, HTMLAttributes } from "react";
import NextLink from "next/link";
import clsx from "../../utils/clsx";

export default function Link({
  className,
  href,
  ...props
}: Partial<ComponentProps<typeof NextLink>>) {
  className = clsx(
    "text-primary-500 underline decoration-primary-500/40 decoration-2 transition-colors hover:decoration-primary-500",
    className,
  );

  if (href) {
    return <NextLink href={href} {...props} className={className} />;
  }

  return (
    <button
      {...(props as DetailedHTMLProps<
        HTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >)}
      className={className}
      type="button"
    />
  );
}
