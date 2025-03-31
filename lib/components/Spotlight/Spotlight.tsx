import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "radix-ui";
import { useCallback } from "react";
import {
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useLocalStorage } from "react-use";
import { take, uniqBy } from "lodash-es";
import Image from "next/image";
import Input from "../Input";
import Skeleton from "../Skeleton";
import UnstyledButton from "../Button/UnstyledButton";
import Button from "../Button";
import clsx from "../../utils/clsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export default function Spotlight<T extends object>({
  recentSearchesId,
  open,
  setOpen,
  setQuery,
  query,
  onClickItem,
  results,
  loading,
  getItemId = (item: Any) => item._id,
  getItemLabel = (item: Any) => item.name,
  getItemPicture,
  getItemHref,
  showSeeMoreButton,
  onSeeMoreClick,
  seeMoreHref,
}: {
  recentSearchesId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  setQuery: (search: string) => void;
  query: string;
  results?: T[];
  loading: boolean;
  getItemId?: (item: T) => string;
  getItemLabel?: (item: T) => string;
  getItemPicture?: (item: T) => string;
  getItemHref?: (item: T) => string;
  onClickItem?: (item: T) => void;
  showSeeMoreButton?: boolean;
  onSeeMoreClick?: () => void;
  seeMoreHref?: string;
}) {
  const [recentQueries, setRecentQueries] = useLocalStorage<T[]>(
    `spotlight-recent-queries-${recentSearchesId}`,
    [],
  );

  const handleClose = useCallback(
    (item: T) => {
      setRecentQueries(
        take(uniqBy([item, ...(recentQueries || [])], getItemId), 5),
      );
      setOpen(false);
      setQuery("");
    },
    [getItemId, recentQueries, setOpen, setQuery, setRecentQueries],
  );

  const handleItemClick = useCallback(
    (item: T) => () => {
      onClickItem?.(item);
      handleClose(item);
    },
    [handleClose, onClickItem],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            "fixed inset-0 z-20 flex justify-center bg-black/30 backdrop-blur-xs",
            "data-[state=closed]:animate-fade-out data-[state=open]:animate-slide-up-and-fade will-change-[opacity,transform]",
          )}
        >
          <Dialog.Content
            className={clsx(
              "fixed mx-auto w-full max-w-(--breakpoint-md) px-4 py-4 focus:outline-hidden md:py-8",
              "data-[state=closed]:animate-fade-out data-[state=open]:animate-elastic-slide-up-and-fade will-change-[transform,opacity]",
            )}
          >
            <VisuallyHidden.Root>
              <Dialog.Title />
              <Dialog.Description />
            </VisuallyHidden.Root>
            <div className="flex w-full flex-col justify-center rounded-sm border border-zinc-800 bg-zinc-900">
              <div className="px-4 py-4">
                <Input
                  className="w-full bg-zinc-900"
                  inputClassName="border-none rounded-t-md rounded-b-none dark:bg-zinc-900 dark:focus:ring-0"
                  autoFocus={true}
                  leading={
                    <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="w-full border-t border-zinc-800">
                <div className="flex flex-col">
                  {query ? (
                    <>
                      {loading && (
                        <div className="flex items-center gap-4 px-4 py-2">
                          {getItemPicture && <Skeleton className="h-16 w-28" />}
                          <Skeleton className="h-6 w-32" />
                        </div>
                      )}
                      {!loading && !results?.length && (
                        <div className="flex justify-center border-b border-zinc-800 px-6 py-10 text-zinc-600">
                          No result found
                        </div>
                      )}
                      {!loading && !!results?.length && (
                        <>
                          {results.map((item) => (
                            <UnstyledButton
                              key={getItemId(item)}
                              href={getItemHref?.(item)}
                              className="flex w-full items-center gap-4 border-t border-zinc-800 px-4 py-2 hover:bg-zinc-800/90"
                              onClick={handleItemClick(item)}
                            >
                              {getItemPicture && (
                                <Image
                                  src={getItemPicture(item)}
                                  alt={getItemLabel(item)}
                                  width={200}
                                  height={378}
                                  className="h-16 w-28 rounded-sm object-cover"
                                />
                              )}
                              <div className="text-white">
                                {getItemLabel(item)}
                              </div>
                            </UnstyledButton>
                          ))}
                          {showSeeMoreButton && (
                            <div className="flex w-full justify-center px-4 py-2">
                              <Button
                                variant="filled"
                                type="submit"
                                className="w-full dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                trailing={<ChevronRightIcon />}
                                onClick={onSeeMoreClick}
                                href={seeMoreHref}
                              >
                                See more
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {recentQueries?.length ? (
                        <div className="px-6 py-2 text-zinc-400">
                          Recently searched
                        </div>
                      ) : (
                        <div className="flex justify-center border-zinc-800 px-6 py-10 text-zinc-600">
                          No recent search
                        </div>
                      )}
                      {recentQueries?.map((item) => (
                        <UnstyledButton
                          key={getItemId(item)}
                          href={getItemHref?.(item)}
                          className="flex w-full items-center gap-4 border-t border-zinc-800 px-4 py-2 hover:bg-zinc-800/90"
                          onClick={handleItemClick(item)}
                        >
                          {getItemPicture && (
                            <Image
                              src={getItemPicture(item)}
                              alt={getItemLabel(item)}
                              width={200}
                              height={378}
                              className="max-h-16 max-w-28 rounded-sm object-cover"
                            />
                          )}
                          <div className="text-white">{getItemLabel(item)}</div>
                        </UnstyledButton>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
