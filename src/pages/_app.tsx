import "@fontsource-variable/inter";
import "../../lib/bootstrap/suppressConsoleLog";
import { DefaultSeo } from "next-seo";
import "../globals.css";
import type { AppProps } from "../../lib/bootstrap/AppProps";
import { hydrateNavigationDrawerState } from "../../lib/components/NavigationDrawer";
import Notifications from "../../lib/components/Notifications";
import setupNProgress from "../../lib/bootstrap/nprogress";
import { Dialogs } from "../../lib/components/Dialog";
import localizedFormat from "dayjs/plugin/localizedFormat";
import dayjs from "dayjs";
import "react-image-crop/dist/ReactCrop.css";

dayjs.extend(localizedFormat);

const appName = "@majapisoftwares/ui";
const appDescription = "Demo of @majapisoftwares/ui";
const appKeywords = "ui";
const appThemeColor = "#00a6f4";

setupNProgress(appThemeColor);

function MyApp({ Component, pageProps }: AppProps) {
  hydrateNavigationDrawerState(pageProps.cookies);

  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <DefaultSeo
        titleTemplate={`%s - ${appName}`}
        defaultTitle={appName}
        description={appDescription}
        openGraph={{
          images: [
            {
              url: "/android-chrome-512x512.png",
              height: 512,
              width: 512,
              alt: appName,
            },
          ],
        }}
        additionalLinkTags={[
          {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/apple-touch-icon.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/favicon-32x32.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/favicon-16x16.png",
          },
          {
            rel: "manifest",
            href: "/site.webmanifest",
          },
          {
            rel: "mask-icon",
            href: "/safari-pinned-tab.svg",
            color: appThemeColor,
          },
        ]}
        additionalMetaTags={[
          {
            name: "apple-mobile-web-app-title",
            content: appName,
          },
          {
            name: "application-name",
            content: appName,
          },
          {
            name: "msapplication-TileColor",
            content: appThemeColor,
          },
          {
            name: "theme-color",
            content: appThemeColor,
          },
          {
            name: "viewport",
            content: "initial-scale=1, width=device-width, maximum-scale=1",
          },
          {
            name: "keywords",
            content: appKeywords,
          },
        ]}
      />
      <Notifications />
      <Dialogs />
      {getLayout(<Component {...pageProps} />)}
    </>
  );
}

// noinspection JSUnusedGlobalSymbols
export default MyApp;
