import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import {
  Preferences,
  preferencesScript,
} from "@majapisoftwares/ui/patterns/preferences";
import "./globals.css";

export const metadata: Metadata = {
  icons: { icon: "/favicon.svg" },
};

// Edge to edge on phones with a notch; the library keeps content in the safe area.
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body>
        <Preferences>{children}</Preferences>
      </body>
    </html>
  );
}
