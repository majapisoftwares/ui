import { getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import Stack from "../../lib/components/Stack";
import getPublicLayout from "../views/publicLayout";
import Skeleton from "../../lib/components/Skeleton";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Skeleton" }];

export default function Page() {
  return (
    <>
      <NextSeo title={pages[0].title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="p-2">
        <Skeleton className="h-20 w-full max-w-96" />
        <Skeleton className="h-9 w-9 rounded-full" />

        <Skeleton className="h-screen w-full max-w-96" />
      </Stack>
    </>
  );
}

Page.getLayout = getPublicLayout;
