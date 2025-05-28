import getPublicLayout from "../views/publicLayout";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import Breadcrumbs from "../../lib/components/Breadcrumbs";
import { FileSelectProvider } from "../../lib/components/FileSelect";
import Stack from "../../lib/components/Stack";
import { ChangeEvent, useCallback, useState } from "react";
import FileInput, {
  FileFile,
  FileInputFile,
  FileUrl,
} from "../../lib/components/FileInput";
import numeral from "numeral";
import clsx from "../../lib/utils/clsx";
import Group from "../../lib/components/Group";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Text from "../../lib/components/Text";
import Button from "../../lib/components/Button";
import {
  ArrowTopRightOnSquareIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { PreviewFileProps } from "../../lib/components/FileInput/PreviewFile";
import checkIsVideo from "../../lib/components/FileInput/isVideo";
import Input from "../../lib/components/Input";
import { UseStateTuple } from "../../lib/types";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => ({
  props: {
    cookies: await getCookies({ req, res }),
  },
});

const pages = [{ title: "File Input with Custom PreviewFile" }];

export function CustomPreviewFile({
  file,
  readOnly,
  handleDeleteClick,
  downloadText,
  openText,
  className,
  images,
  setImages,
}: PreviewFileProps & {
  images: FileInputFile[];
  setImages: UseStateTuple<FileInputFile[]>[1];
}) {
  const url =
    (file as FileUrl).url ||
    ((file as FileFile).file
      ? URL.createObjectURL((file as FileFile).file)
      : undefined);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setImages((images) =>
        images.map((f) => {
          if (f.name === file.name) {
            return { ...f, description: e.target.value };
          }
          return f;
        }),
      ),
    [setImages, file.name],
  );

  if (!url) {
    return (
      <div className={clsx("p-4 text-red-500", className)}>
        Error: No URL or file provided for preview.
      </div>
    );
  }

  const isVideo = file.type?.startsWith("video") || checkIsVideo(url);

  return (
    <div
      className={clsx(
        "group relative flex flex-wrap items-center justify-center rounded-md bg-zinc-200 dark:bg-zinc-800",
        className,
      )}
    >
      {isVideo ? (
        <video className="max-h-96 rounded-md" src={url} controls />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={file.description} className="max-h-96 rounded-md" />
      )}
      <Group className="w-full items-center gap-0">
        <Stack className="w-full overflow-hidden p-3">
          <Stack className="gap-1">
            <div className="flex-1 truncate" title={file.name}>
              {file.name} {images.length}
            </div>
            {file.description && <div>{file.description}</div>}
            <Input value={file.description || ""} onChange={handleChange} />
            <Text size="sm">{file.type}</Text>
            {!!file.size && (
              <Text size="sm">{numeral(file.size).format("0b")}</Text>
            )}
            {!url.startsWith("blob") && (
              <Group className="mr-auto">
                <Button
                  leading={<ArrowTopRightOnSquareIcon />}
                  href={url}
                  target="_blank"
                >
                  {openText}
                </Button>
                <Button
                  leading={<ArrowDownTrayIcon />}
                  href={url}
                  download={file.name}
                >
                  {downloadText}
                </Button>
              </Group>
            )}
          </Stack>
        </Stack>
      </Group>
      {!readOnly && (
        <Button
          icon
          variant="filled"
          color="default"
          className="absolute top-2 right-2"
          onClick={handleDeleteClick}
        >
          <TrashIcon />
        </Button>
      )}
    </div>
  );
}

export default function Page() {
  const [images, setImages] = useState<FileInputFile[]>([]);

  const handleChange = useCallback(
    (e: { target: { value: FileInputFile[] } }) => setImages(e.target.value),
    [setImages],
  );

  return (
    <FileSelectProvider>
      <NextSeo title={pages[0].title} />
      <Breadcrumbs pages={pages} className="mb-2 md:mx-2" />
      <Stack className="p-2">
        <FileInput
          label="Attachments"
          value={images}
          onChange={handleChange}
          previewFileComponent={CustomPreviewFile}
          previewFileProps={{
            images,
            setImages,
          }}
        />
      </Stack>
    </FileSelectProvider>
  );
}

Page.getLayout = getPublicLayout;
