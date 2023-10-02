import { NextSeo } from "next-seo";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import getPublicLayout from "../views/publicLayout";
import Stack from "../../lib/components/Stack";

const pages = [{ title: "Big scroll" }];

// noinspection JSUnusedGlobalSymbols
export default function BigScrollPage() {
  return (
    <>
      <NextSeo title={pages[0].title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="p-2">
        <div className="h-[2000px]"></div>
      </Stack>
    </>
  );
}

BigScrollPage.getLayout = getPublicLayout;
