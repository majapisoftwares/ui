import Button from "../../lib/components/Button";
import Stack from "../../lib/components/Stack";
import getPublicLayout from "../views/publicLayout";
import { InboxIcon } from "@heroicons/react/24/outline";
import { NextSeo } from "next-seo";
import type { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import {
  removeNotification,
  showNotification,
} from "../../lib/components/Notifications";
import isomorphicObjectId from "@majapisoftwares/next/utils/isomorphicObjectId";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Notifications" }];

export default function Page() {
  return (
    <>
      <NextSeo title={pages[0]?.title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="p-2">
        <div>
          <Button
            onClick={() => {
              showNotification({ message: "This is a message" });
            }}
          >
            Show notification
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              showNotification({
                message: "This message will auto close in 5 seconds",
                dismissable: false,
                timeout: "5s",
              });
            }}
          >
            Show not dismissable notification
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              showNotification({
                title: "This is the title",
                message: "This is a message",
              });
            }}
          >
            Show notification with title
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              showNotification({
                icon: "success",
                title: "This is the title",
                message: "This is a message",
              });
            }}
          >
            Show notification with success icon
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              showNotification({
                icon: "error",
                title: "This is the title",
                message: "This is a message",
              });
            }}
          >
            Show notification with error icon
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              showNotification({
                icon: <InboxIcon />,
                title: "This is the title",
                message: "This is a message",
              });
            }}
          >
            Show notification with custom icon
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              const _id = isomorphicObjectId().toString();
              showNotification({
                _id,
                icon: <InboxIcon />,
                title: "This is the title",
                message: "This is a message",
                actions: (
                  <>
                    <Button variant="text" color="primary">
                      Undo
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => removeNotification(_id)}
                    >
                      Dismiss
                    </Button>
                  </>
                ),
              });
            }}
          >
            Show notification with actions
          </Button>
        </div>
      </Stack>
    </>
  );
}

Page.getLayout = getPublicLayout;
