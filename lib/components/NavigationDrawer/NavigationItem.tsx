import clsx from "../../utils/clsx";
import { useRouter } from "next/dist/client/router";
import { cloneElement, ReactElement, ReactNode } from "react";
import Button from "../Button";
import navigationDrawerState from "./navigationDrawer.state";
import defaultTheme from "tailwindcss/defaultTheme";
import useMediaQuery from "../../hooks/useMediaQuery";

export default function NavigationItem({
  icon,
  children,
  href,
  exact,
  alternativeActiveHrefs,
  className,
}: {
  icon?: ReactElement;

  children: ReactNode;
  href: string;
  exact?: boolean;
  alternativeActiveHrefs?: string[];
  className?: string;
}) {
  let router = useRouter();
  let active = exact
    ? router.pathname === href ||
      alternativeActiveHrefs?.some((href) => router.pathname === href)
    : router.pathname.includes(href) ||
      alternativeActiveHrefs?.some((href) => router.pathname.includes(href));

  let isMobile = useMediaQuery(`(max-width: ${defaultTheme.screens.lg})`);

  return (
    <Button
      variant={active ? "light" : "text"}
      className={clsx("w-full justify-start border-transparent", className)}
      leading={
        icon &&
        cloneElement(icon, {
          className: clsx(icon.props?.className, "!w-5 mr-3"),
        })
      }
      href={href}
      onClick={isMobile ? navigationDrawerState.close : undefined}
    >
      {children}
    </Button>
  );
}
