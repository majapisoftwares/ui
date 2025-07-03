import { getCookies } from "cookies-next";
import type { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import Stack from "../../lib/components/Stack";
import getPublicLayout from "../views/publicLayout";
import { useState } from "react";
import TabsSwitcher, { Tab } from "../../lib/components/TabsSwitcher";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Tabs Switcher" }];

export default function Page() {
  const [tab, setTab] = useState("home");

  return (
    <>
      <NextSeo title={pages[0]?.title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="p-2">
        <div className="flex justify-start">
          <TabsSwitcher value={tab} onChange={setTab}>
            <Tab value="home">Home View</Tab>
            <Tab value="profile">Profile</Tab>
            <Tab value="settings">Settings</Tab>
          </TabsSwitcher>
        </div>

        <div>
          {tab === "home" && <p>Welcome to the Home page.</p>}
          {tab === "profile" && <p>This is your Profile page.</p>}
          {tab === "settings" && <p>Adjust your Settings here.</p>}
        </div>

        <div className="flex justify-start">
          <TabsSwitcher value={tab} onChange={setTab} variant="outlined">
            <Tab value="home">Home View</Tab>
            <Tab value="profile">Profile</Tab>
            <Tab value="settings">Settings</Tab>
          </TabsSwitcher>
        </div>

        <div>
          {tab === "home" && <p>Welcome to the Home page.</p>}
          {tab === "profile" && <p>This is your Profile page.</p>}
          {tab === "settings" && <p>Adjust your Settings here.</p>}
        </div>
      </Stack>
    </>
  );
}

Page.getLayout = getPublicLayout;
