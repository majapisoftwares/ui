import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "radix-ui";
import { Fragment, useCallback } from "react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
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
  onSeeMoreClick,
  seeMoreHref,
  overlayClassName,
  dialogContentClassName,
  className,
  contentClassName,
  iconClassName,
  inputClassName,
  buttonClassName,
  noResultsClassName,
  recentSearchClassName,
  seeMoreLabel = "See more",
  noRecentSearchLabel = "No recent search",
  recentlySearchedLabel = "Recently searched",
  noResultsLabel = "No result found",
  onSubmit,
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
  onSeeMoreClick?: () => void;
  seeMoreHref?: string;
  overlayClassName?: string;
  dialogContentClassName?: string;
  className?: string;
  contentClassName?: string;
  iconClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  noResultsClassName?: string;
  recentSearchClassName?: string;
  seeMoreLabel?: string;
  noRecentSearchLabel?: string;
  recentlySearchedLabel?: string;
  noResultsLabel?: string;
  onSubmit?: () => void;
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
            "fixed inset-0 z-20 flex justify-center bg-white/30 backdrop-blur-xs dark:bg-black/30",
            "data-[state=closed]:animate-fade-out data-[state=open]:animate-slide-up-and-fade will-change-[opacity,transform]",
            overlayClassName,
          )}
        >
          <Dialog.Content
            className={clsx(
              "fixed mx-auto w-full max-w-(--breakpoint-md) px-4 py-4 focus:outline-hidden md:py-8",
              "data-[state=closed]:animate-fade-out data-[state=open]:animate-elastic-slide-up-and-fade will-change-[transform,opacity]",
              dialogContentClassName,
            )}
          >
            <VisuallyHidden.Root>
              <Dialog.Title />
              <Dialog.Description />
            </VisuallyHidden.Root>
            <div
              className={clsx(
                "flex w-full flex-col justify-center rounded-sm border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900",
                className,
              )}
            >
              <div className="px-4 py-4">
                <Input
                  className={clsx("w-full", contentClassName)}
                  inputClassName={clsx(
                    "border-none rounded-none shadow-none rounded-b-none dark:bg-zinc-900 dark:focus:ring-0 focus:ring-0 bg-transparent",
                    inputClassName,
                  )}
                  autoFocus={true}
                  leading={
                    <MagnifyingGlassIcon
                      className={clsx(
                        "h-5 w-5 text-black dark:text-white",
                        iconClassName,
                      )}
                    />
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSubmit?.();
                    }
                  }}
                />
              </div>
              <div className="w-full border-t border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex flex-col gap-2">
                  {query ? (
                    <>
                      {loading && (
                        <div className="flex items-center gap-4">
                          {getItemPicture && <Skeleton className="h-16 w-28" />}
                          <Skeleton className="h-6 w-32" />
                        </div>
                      )}
                      {!loading && !results?.length && (
                        <div
                          className={clsx(
                            "flex justify-center py-5 text-zinc-400 dark:text-zinc-600",
                            noResultsClassName,
                          )}
                        >
                          {noResultsLabel}
                        </div>
                      )}
                      {!loading && !!results?.length && (
                        <>
                          {results.map((item, i) => (
                            <Fragment key={getItemId(item)}>
                              {i > 0 && (
                                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
                              )}
                              <UnstyledButton
                                key={getItemId(item)}
                                href={getItemHref?.(item)}
                                className="flex w-full items-center gap-4 rounded-sm hover:bg-zinc-200/90 dark:hover:bg-zinc-800/90"
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
                                <div className="text-black dark:text-white">
                                  {getItemLabel(item)}
                                </div>
                              </UnstyledButton>
                            </Fragment>
                          ))}
                          {(onSeeMoreClick || seeMoreHref) && (
                            <Button
                              variant="filled"
                              type="submit"
                              className={clsx(
                                "mt-2 w-full dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700",
                                buttonClassName,
                              )}
                              trailing={<ChevronRightIcon />}
                              onClick={onSeeMoreClick}
                              href={seeMoreHref}
                            >
                              {seeMoreLabel}
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {recentQueries?.length ? (
                        <div
                          className={clsx(
                            "mb-2 text-zinc-600 dark:text-zinc-400",
                            recentSearchClassName,
                          )}
                        >
                          {recentlySearchedLabel}
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            "flex justify-center py-5 text-zinc-400 dark:text-zinc-600",
                            noResultsClassName,
                          )}
                        >
                          {noRecentSearchLabel}
                        </div>
                      )}
                      {recentQueries?.map((item) => (
                        <UnstyledButton
                          key={getItemId(item)}
                          href={getItemHref?.(item)}
                          className="flex w-full items-center gap-4 hover:bg-zinc-200/90 dark:hover:bg-zinc-800/90"
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
                          <div className="text-black dark:text-white">
                            {getItemLabel(item)}
                          </div>
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
