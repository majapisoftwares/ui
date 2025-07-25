import getPublicLayout from "../views/publicLayout";
import { NextSeo } from "next-seo";
import type { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import GridPattern from "../../lib/components/GridPattern";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Grid pattern" }];

export default function Page() {
  return (
    <>
      <NextSeo title={pages[0]?.title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <div className="p-2">
        <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)] text-slate-900/[0.07] dark:text-slate-100/[0.07]">
          <GridPattern x="100%" patternTransform="translate(0 -1)" />
        </div>
      </div>
    </>
  );
}

Page.getLayout = getPublicLayout;
