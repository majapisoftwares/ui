import type { ReactNode } from "react";
import { CatalogShell } from "@/components/catalog-shell";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return <CatalogShell>{children}</CatalogShell>;
}
