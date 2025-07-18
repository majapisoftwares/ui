import clsx from "../../utils/clsx";
import { useScrollYMovement } from "../../hooks/useScroll";
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  useEffect,
  useRef,
} from "react";
import useMediaQuery from "../../hooks/useMediaQuery";

export type HeaderProps = { hideOnScroll?: boolean } & DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;

export default function Header({
  className,
  hideOnScroll,
  ...props
}: HeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const isMobile = useMediaQuery(`(max-width: 768px)`);
  useScrollYMovement(
    74,
    (scrollYMovement) => {
      if (ref.current) {
        ref.current.style.transform = `translateY(-${scrollYMovement}px)`;
      }
    },
    !hideOnScroll && !isMobile,
  );
  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = "";
    }
  }, [isMobile]);

  return (
    <header
      ref={ref}
      {...props}
      className={clsx(
        "scrolled:shadow-md fixed top-0 z-20 flex h-16 w-full items-center px-2.5 shadow-none shadow-slate-900/5 ring-offset-zinc-100 transition-colors duration-500 sm:px-4 md:px-6",
        "bg-white/95 backdrop-blur-sm [@supports(backdrop-filter:blur(0))]:bg-white/75",
        "dark:bg-zinc-900/95 dark:[@supports(backdrop-filter:blur(0))]:bg-zinc-900/75",
        "not-scrolled:bg-transparent!",
        className,
      )}
    />
  );
}
