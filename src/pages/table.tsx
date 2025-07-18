import Stack from "../../lib/components/Stack";
import getPublicLayout from "../views/publicLayout";
import type { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import Table from "../../lib/components/Table";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useCallback } from "react";
import Button from "../../lib/components/Button";
import fakeArray from "../../lib/utils/fakeArray";
import { NextSeo } from "next-seo";
import Breadcrumbs from "../../lib/components/Breadcrumbs";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Table" }];

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <NextSeo title={pages[0]?.title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="flex flex-1 flex-col md:px-2 md:pb-2">
        <Table.Header
          title="Users"
          subtitle="A list of all the users in your account including their name, title, email and role."
        >
          <Button variant="filled">Add user</Button>
        </Table.Header>
        <Table autoHeight>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Title</Table.Cell>
              <Table.Cell>Email</Table.Cell>
              <Table.Cell>Role</Table.Cell>
              <Table.Cell />
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row
              onClick={useCallback(
                () => window.open("https://majapi.com", "_blank"),
                [],
              )}
            >
              <Table.Cell>Ítalo Andrade</Table.Cell>
              <Table.Cell>King</Table.Cell>
              <Table.Cell>italo@majapi.com</Table.Cell>
              <Table.Cell>Give orders</Table.Cell>
              <Table.Cell actions>
                <Table.ActionButton title="Edit">
                  <PencilIcon />
                </Table.ActionButton>
              </Table.Cell>
            </Table.Row>
            {fakeArray(30).map((n) => (
              <Table.Row key={n}>
                <Table.Cell>Lindsay Walton ({n})</Table.Cell>
                <Table.Cell>Front-end Developer</Table.Cell>
                <Table.Cell>lindsay.walton@example.com</Table.Cell>
                <Table.Cell>Member</Table.Cell>
                <Table.Cell actions>
                  <Table.ActionButton title="Edit">
                    <PencilIcon />
                  </Table.ActionButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Stack>
    </div>
  );
}

Page.getLayout = getPublicLayout;
