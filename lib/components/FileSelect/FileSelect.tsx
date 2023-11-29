import {
  ChangeEventHandler,
  cloneElement,
  ForwardedRef,
  forwardRef,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import clsx from "clsx";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import numeral from "numeral";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { DocumentIcon } from "@heroicons/react/24/outline";
import Loading from "../Loading";

const translateAllowedType = (type: string) =>
  ({
    "image/png": "PNG",
    ".png": "PNG",
    "image/jpeg": "JPG",
    ".jpg": "JPG",
    ".jpeg": "JPG",
    ".gif": "GIF",
    "image/gif": "GIF",
    "video/mp4": "MP4",
    ".mp4": "MP4",
    ".csv": "CSV",
    "audio/mpeg": "MP3",
    "application/pdf": "PDF",
    "text/csv": "CSV",
  }[type]);

export interface FileSelectProps {
  uploadAFileText?: string;
  orDragAndDropText?: string;
  upToText?: string;
  anyFileText?: string;
  dropFilesHereText?: string;
  uploadingText?: string;
  maxFileSize?: number | string;
  allowedFileTypes?: string[];
  id?: string;
  limit?: number;
  onAcceptFiles: (files: File[]) => void;
  helperText?: string;
  className?: string;
  error?: boolean;
  icon?: ReactElement;
  uploading?: boolean;
}

let defaultIcon = <DocumentIcon />;

function checkAllowedFileTypesFn(file: File, allowedFileTypes?: string[]) {
  return (
    !allowedFileTypes ||
    allowedFileTypes.includes(file.type) ||
    allowedFileTypes.some((t) => file.name.endsWith(t))
  );
}

function FileSelect(
  {
    maxFileSize,
    allowedFileTypes,
    id,
    limit,
    onAcceptFiles,
    className,
    uploadAFileText = "Upload a file",
    orDragAndDropText = "or drag and drop",
    upToText = "up to",
    anyFileText = "Any file",
    dropFilesHereText = "Drop files here",
    uploadingText = "Uploading...",
    icon = defaultIcon,
    uploading,
  }: FileSelectProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const innerId = useId();
  id = id || innerId;
  maxFileSize =
    typeof maxFileSize === "string"
      ? numeral(maxFileSize).value() || undefined
      : maxFileSize;
  maxFileSize = maxFileSize || numeral("10MB").value() || undefined;

  let checkAllowedFileTypes = useCallback(
    (file: File) => checkAllowedFileTypesFn(file, allowedFileTypes),
    [allowedFileTypes]
  );

  const handleFileBrowse: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!event.target.files) {
      throw Error("Files is falsy");
    }
    let files = Array.from(event.target.files);
    files = files.filter(checkAllowedFileTypes);
    onAcceptFiles(files);
    event.target.value = "";
  };

  let [pasteEnabled, setPasteEnabled] = useState(false);
  useOnPasteFiles(pasteEnabled, onAcceptFiles, allowedFileTypes);

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(item: { files: File[] }) {
      let files = item.files;
      files = files.filter(checkAllowedFileTypes);
      onAcceptFiles(files);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={clsx(
        "flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6",
        "border-gray-300 dark:border-gray-700",
        "hover:border-gray-400 dark:hover:border-gray-600",
        className,
        {
          "border-primary-300 dark:border-primary-700": isOver,
        }
      )}
      onMouseMove={() => setPasteEnabled(true)}
      onMouseOut={() => setPasteEnabled(false)}
    >
      {uploading ? (
        <div className="flex flex-col items-center justify-center text-center">
          <Loading
            className={clsx("mb-2 h-10 w-10", {
              "text-primary-500": isOver,
            })}
          />
          <div>{uploadingText}</div>
        </div>
      ) : !canDrop ? (
        <div className="relative flex flex-col items-center justify-center space-y-1 text-center">
          {cloneElement(icon, {
            className: clsx(
              "mx-auto h-12 w-12 text-gray-400",
              icon.props.className
            ),
          })}
          <div className="text-sm">
            <label
              htmlFor={id}
              className="relative cursor-pointer rounded-md font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500 dark:ring-offset-slate-900"
            >
              <span>{uploadAFileText}</span>
              <input
                id={id}
                name={id}
                type="file"
                className="sr-only"
                accept={allowedFileTypes?.join(",")}
                onChange={handleFileBrowse}
                multiple={limit !== 1}
                ref={ref}
              />
            </label>
            <span className="pl-1">{orDragAndDropText}</span>
          </div>
          <p className="text-xs text-gray-500">
            {allowedFileTypes
              ? allowedFileTypes.map(translateAllowedType).join(", ")
              : anyFileText}{" "}
            {upToText} {numeral(maxFileSize).format("0b")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <ArrowUpTrayIcon
            className={clsx("mb-2 w-10 text-7xl", {
              "text-primary-500": isOver,
            })}
          />
          <div>{dropFilesHereText}</div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(FileSelect);

const useOnPasteFiles = (
  enabled: boolean,
  onAcceptFiles: (files: File[]) => void,
  allowedFileTypes?: string[]
): void => {
  useEffect(() => {
    if (enabled) {
      document.onpaste = function (event) {
        const items =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (event.clipboardData || (event as any).originalEvent.clipboardData)
            .items;
        for (const index in items) {
          const item = items[index];
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (checkAllowedFileTypesFn(file, allowedFileTypes)) {
              onAcceptFiles([file]);
            }
          }
        }
      };

      return () => {
        document.onpaste = null;
      };
    }
  }, [allowedFileTypes, enabled, onAcceptFiles]);
};

export function FileSelectProvider({ children }: { children: ReactNode }) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
