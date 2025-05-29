import Group from "../Group";
import { ArrowDownTrayIcon, DocumentIcon } from "@heroicons/react/24/outline";
import Stack from "../Stack";
import Text from "../Text";
import numeral from "numeral";
import Button from "../Button";
import {
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { FileInputFile } from "./FileInput";
import { memo, ReactNode } from "react";
import clsx from "../../utils/clsx";
import checkIsVideo from "./isVideo";
import checkIsImage from "./isImage";
import { isEqual } from "lodash-es";

export type PreviewFileProps = {
  file: FileInputFile;
  readOnly?: boolean;
  handleDeleteClick: () => void;
  downloadText: string;
  openText: string;
  display?: "info" | "preview" | "both";
  additionalInfo?: (file: FileInputFile, index: number) => ReactNode;
  index: number;
  className?: string;
  filesPerPage: number;
  currentPage: number;
};

function PreviewFile({
  file,
  readOnly,
  handleDeleteClick,
  downloadText,
  openText,
  display = "info",
  additionalInfo,
  index,
  className,
  filesPerPage,
  currentPage,
}: PreviewFileProps) {
  const isVideo = file.type?.startsWith("video") || checkIsVideo(file.url);
  const isImage = file.type?.startsWith("image") || checkIsImage(file.url);

  if (display === "preview" && !isVideo && !isImage) {
    display = "info";
  }

  return (
    <div
      className={clsx(
        "group relative flex flex-wrap items-center justify-center rounded-md bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
    >
      {["preview", "both"].includes(display) &&
        (isVideo ? (
          <video className="max-h-96 rounded-md" src={file.url} controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.description}
            className="max-h-96 rounded-md"
          />
        ))}
      {["info", "both"].includes(display) && (
        <Group className="w-full items-center gap-0">
          {display === "info" && (
            <div className="m-2 mr-0 rounded-lg bg-zinc-300 p-2 dark:bg-zinc-800">
              <DocumentIcon className="h-5 w-5" />
            </div>
          )}
          <Stack className="w-full overflow-hidden p-3">
            <Stack className="gap-1">
              <div className="flex-1 truncate" title={file.name}>
                {file.name}
              </div>
              {file.description && <div>{file.description}</div>}
              <Text size="sm">{file.type}</Text>
              {!!file.size && (
                <Text size="sm">{numeral(file.size).format("0b")}</Text>
              )}
              {!file.url.startsWith("blob") && (
                <Group className="mr-auto">
                  <Button
                    leading={<ArrowTopRightOnSquareIcon />}
                    href={file.url}
                    target="_blank"
                  >
                    {openText}
                  </Button>
                  <Button
                    leading={<ArrowDownTrayIcon />}
                    href={file.url}
                    download={file.name}
                  >
                    {downloadText}
                  </Button>
                </Group>
              )}
            </Stack>
            {additionalInfo &&
              additionalInfo(file, index + (currentPage - 1) * filesPerPage)}
          </Stack>
        </Group>
      )}
      {!readOnly && (
        <Button
          icon
          variant="filled"
          color="default"
          className="absolute top-2 right-2 group-hover:opacity-100 sm:opacity-0"
          onClick={handleDeleteClick}
        >
          <TrashIcon />
        </Button>
      )}
    </div>
  );
}

export default memo(PreviewFile, isEqual);
