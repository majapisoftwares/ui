import getPublicLayout from "../views/publicLayout";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import Group from "../../lib/components/Group";
import Popover from "../../lib/components/Popover";
import Button from "../../lib/components/Button";
import Input from "../../lib/components/Input";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Popover" }];

export default function Page() {
  return (
    <>
      <NextSeo title={pages[0].title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Group className="p-2">
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button>Open popover</Button>
          </Popover.Trigger>
          <Popover.Content className="flex flex-col gap-2 p-4">
            <Input label="Name" />
            <Input label="Email" />
            <Button>Submit</Button>
          </Popover.Content>
        </Popover.Root>
      </Group>
    </>
  );
}

Page.getLayout = getPublicLayout;
