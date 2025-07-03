import type { ReactNode } from "react";
import Header from "./Header/Header";
import Footer from "../../lib/components/Footer";
import Link from "next/link";
import dynamic from "next/dynamic";

const NavigationDrawer = dynamic(() => import("./Header/NavigationDrawer"), {
  ssr: false,
});

export default function getPublicLayout(children: ReactNode) {
  return (
    <>
      <Header />
      <NavigationDrawer>
        <Footer companyName={<Link href="https://majapi.com">Majapi</Link>}>
          <div className="h-16" />
          {children}
        </Footer>
      </NavigationDrawer>
    </>
  );
}
