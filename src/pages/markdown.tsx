import Stack from "../../lib/components/Stack";
import getPublicLayout from "../views/publicLayout";
import { NextSeo } from "next-seo";
import type { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import Markdown from "../../lib/components/Markdown";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Markdown" }];

export default function Page() {
  return (
    <>
      <NextSeo title={pages[0]?.title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="p-2">
        <Markdown>{`# Hello, *world*!
Just a link: https://reactjs.com.

- [ ] Checkbox
- [x] Checked`}</Markdown>
      </Stack>
    </>
  );
}

Page.getLayout = getPublicLayout;
