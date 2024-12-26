import type { ButtonHTMLAttributes, DetailedHTMLProps, HTMLProps } from "react";
import NextLink from "next/link";

export type UnstyledButtonProps<T extends HTMLElement = HTMLButtonElement> = {
  href?: string | null;
  target?: string;
  rel?: string;
  download?: string;
  as?: string;
} & Omit<HTMLProps<T>, "ref" | "href">;

const UnstyledButton = <T extends HTMLElement = HTMLButtonElement>({
  href,
  as,
  ...props
}: UnstyledButtonProps<T>) => {
  if (as) {
    const Component = as;
    return <Component {...props} />;
  }

  if (href) {
    const props2 = props as UnstyledButtonProps<HTMLAnchorElement>;
    return (
      <NextLink
        {...props2}
        href={href}
        tabIndex={props2.disabled ? -1 : undefined}
      />
    );
  }

  return (
    <button
      {...(props as DetailedHTMLProps<
        ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >)}
    />
  );
};

export default UnstyledButton;
