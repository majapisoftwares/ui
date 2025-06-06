import Button from "../../lib/components/Button";
import getPublicLayout from "../views/publicLayout";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import Spotlight from "../../lib/components/Spotlight";
import Stack from "../../lib/components/Stack";
import wait from "@majapisoftwares/next/utils/wait";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import useDebounce from "../../lib/hooks/useDebouncedValue";
import getQueryClient from "@majapisoftwares/next/api/getQueryClient";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "Spotlight" }];

const fakeData = [
  {
    _id: "1",
    name: "Leslie Alexander",
    url: "#",
    picture: "https://i.imgur.com/BniYvjG.jpeg",
  },
  {
    _id: "3",
    name: "Leslie 2",
    url: "#",
    picture: "https://i.imgur.com/BniYvjG.jpeg",
  },
  {
    _id: "2",
    name: "Leslie 3",
    url: "#",
    picture: "https://i.imgur.com/BniYvjG.jpeg",
  },
];

function useSearchApi({ query }: { query: string }, options = {}) {
  return useQuery({
    ...options,
    queryKey: ["search", query],
    queryFn: async () => {
      await wait("5s");
      return fakeData.filter((anime) =>
        anime.name.toLowerCase().includes(query.toLowerCase().trim()),
      );
    },
  });
}

const queryClient = getQueryClient();

function WithQuery() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 800);

  const searchApi = useSearchApi(
    {
      query: debouncedQuery,
    },
    {
      enabled: !!debouncedQuery && open,
    },
  );

  return (
    <>
      <Stack className="p-2">
        <Button onClick={() => setOpen(true)}>
          <MagnifyingGlassIcon className="mr-2 w-5" />
          Search
        </Button>
      </Stack>
      <Spotlight
        recentSearchesId="demo"
        open={open}
        setOpen={setOpen}
        query={query}
        setQuery={setQuery}
        loading={searchApi.isFetching || query !== debouncedQuery}
        results={searchApi.data}
        getItemPicture={(item) => item.picture}
        getItemHref={(item) => item.url}
        seeMoreHref="#"
        onSubmit={() => {
          setOpen(false);
        }}
      />
    </>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <NextSeo title={pages[0].title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <WithQuery />
    </QueryClientProvider>
  );
}

Page.getLayout = getPublicLayout;
