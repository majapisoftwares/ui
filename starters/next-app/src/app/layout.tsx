import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Workbench Starter", template: "%s · Workbench Starter" },
  description:
    "Base de aplicativo Next.js com a biblioteca compartilhada Workbench UI.",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
