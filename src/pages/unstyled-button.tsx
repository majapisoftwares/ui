import getPublicLayout from "../views/publicLayout";
import type { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import React from "react";
import { UnstyledButtonDoc } from "../../lib/components/Button/UnstyledButton.doc";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

export default function Page() {
  return <UnstyledButtonDoc />;
}

Page.getLayout = getPublicLayout;
