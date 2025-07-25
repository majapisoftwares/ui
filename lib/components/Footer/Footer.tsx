import { cloneElement, type ReactElement, type ReactNode } from "react";

export type FooterProps = {
  main?: {
    name: string;
    href: string;
  }[];
  social?: {
    name: string;
    href: string;
    icon: ReactElement<{
      className: string;
      "aria-hidden": string;
    }>;
  }[];
  companyName: ReactNode;
  allRightsReserved?: string;
  children: ReactNode;
};

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer({
  main,
  social,
  companyName,
  allRightsReserved = "All rights reserved",
  children,
}: FooterProps) {
  return (
    <>
      <div className="flex min-h-screen flex-col">{children}</div>
      <footer className="border-t border-slate-900/5 bg-white dark:border-slate-50/5 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
          {main && (
            <nav
              className="-mx-5 -my-2 mb-8 flex flex-wrap justify-center"
              aria-label="Footer"
            >
              {main.map((item) => (
                <div key={item.name} className="px-5 py-2">
                  <a
                    href={item.href}
                    className="text-base text-zinc-500 hover:text-zinc-900"
                  >
                    {item.name}
                  </a>
                </div>
              ))}
            </nav>
          )}
          {social && (
            <div className="mb-8 flex justify-center space-x-6">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-zinc-400 hover:text-zinc-500"
                >
                  <span className="sr-only">{item.name}</span>
                  {cloneElement(item.icon, {
                    className: "h-6 w-6",
                    "aria-hidden": "true",
                  })}
                </a>
              ))}
            </div>
          )}
          <p className="text-center text-base text-zinc-400">
            {companyName} &copy; {CURRENT_YEAR}. {allRightsReserved}.
          </p>
        </div>
      </footer>
    </>
  );
}
