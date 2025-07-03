import {
  type ChangeEventHandler,
  cloneElement,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import clsx from "../../utils/clsx";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend, NativeTypes } from "react-dnd-html5-backend";
import numeral from "numeral";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { DocumentIcon } from "@heroicons/react/24/outline";
import Loading from "../Loading";
import { uniq } from "lodash-es";

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
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PPTX",
    ".webp": "WEBP",
    "image/webp": "WEBP",
  })[type] || type;

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
  onRejectFiles?: (files: File[], reason: "type" | "size") => void;
  helperText?: string;
  className?: string;
  error?: boolean;
  icon?: ReactElement<{
    className?: string;
  }>;
  uploading?: boolean;
  disabled?: boolean;
  additionalBottomInfo?: ReactNode;
  ref?: Ref<HTMLInputElement>;
  innerClassName?: string;
}

const defaultIcon = <DocumentIcon />;

function checkAllowedFileTypesFn(file: File, allowedFileTypes?: string[]) {
  return (
    !allowedFileTypes ||
    allowedFileTypes.includes(file.type) ||
    allowedFileTypes.some((t) => file.name.endsWith(t))
  );
}

function FileSelect({
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
  disabled,
  additionalBottomInfo,
  onRejectFiles,
  error,
  ref,
  innerClassName,
}: FileSelectProps) {
  const innerId = useId();
  id = id || innerId;
  maxFileSize =
    typeof maxFileSize === "string"
      ? numeral(maxFileSize).value() || undefined
      : maxFileSize;
  maxFileSize = maxFileSize || numeral("10MB").value() || undefined;

  const checkAllowedFileTypes = useCallback(
    (file: File) => checkAllowedFileTypesFn(file, allowedFileTypes),
    [allowedFileTypes],
  );

  const handleFileBrowse: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!event.target.files) {
      throw Error("Files is falsy");
    }
    const files = Array.from(event.target.files);
    const acceptedFiles = files.filter(
      (file) =>
        checkAllowedFileTypes(file) && file.size <= (maxFileSize as number),
    );
    if (onRejectFiles) {
      const rejectedFilesType = files.filter(
        (file) => !checkAllowedFileTypes(file),
      );
      if (rejectedFilesType.length) {
        onRejectFiles(rejectedFilesType, "type");
      }
      const rejectedFilesSize = files.filter(
        (file) => file.size > (maxFileSize as number),
      );
      if (rejectedFilesSize.length) {
        onRejectFiles(rejectedFilesSize, "size");
      }
    }
    onAcceptFiles(acceptedFiles);
    event.target.value = "";
  };

  const [pasteEnabled, setPasteEnabled] = useState(false);
  useOnPasteFiles(pasteEnabled, onAcceptFiles, allowedFileTypes);

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(item: { files: File[] }) {
      if (!disabled) {
        let files = item.files;
        files = files.filter(checkAllowedFileTypes);
        onAcceptFiles(files);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={(ref) => {
        drop(ref);
      }}
      className={clsx(
        "flex justify-center rounded-md border-2 border-dashed px-6 pt-5 pb-6",
        "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600",
        "data-is-over:border-primary-300 data-is-over:dark:border-primary-700",
        "data-disabled:cursor-not-allowed data-disabled:border-zinc-200",
        "data-error:border-error-500",
        className,
      )}
      data-is-over={isOver || undefined}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
      onMouseMove={!disabled ? () => setPasteEnabled(true) : undefined}
      onMouseOut={!disabled ? () => setPasteEnabled(false) : undefined}
    >
      {uploading ? (
        <div
          className={clsx(
            "flex flex-col items-center justify-center gap-2 text-center",
            innerClassName,
          )}
        >
          <Loading
            className={clsx("h-10 w-10", {
              "text-primary-500": isOver,
            })}
          />
          <div>{uploadingText}</div>
        </div>
      ) : !canDrop || disabled ? (
        <div
          className={clsx(
            "relative flex flex-col items-center justify-center gap-2 text-center",
            innerClassName,
          )}
        >
          <div className="relative flex flex-col items-center justify-center gap-2 text-center">
            {cloneElement(icon, {
              className: clsx(
                "mx-auto h-12 w-12 text-zinc-400",
                icon.props.className,
              ),
            })}
            <div className="text-sm">
              <label
                htmlFor={id}
                className={clsx(
                  "text-primary-600 focus-within:ring-primary-500 hover:text-primary-500 relative rounded-md font-medium focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-hidden dark:ring-offset-slate-900",
                  {
                    "cursor-pointer": !disabled,
                    "cursor-not-allowed": disabled,
                  },
                )}
              >
                <span>{uploadAFileText}</span>
                {!disabled && (
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
                )}
              </label>
              <span className="pl-1">{orDragAndDropText}</span>
            </div>
            <p className="text-xs text-zinc-500">
              {allowedFileTypes
                ? uniq(allowedFileTypes.map(translateAllowedType)).join(", ")
                : anyFileText}{" "}
              {upToText} {numeral(maxFileSize).format("0b")}
            </p>
          </div>
          {additionalBottomInfo}
        </div>
      ) : (
        <div
          className={clsx(
            "flex flex-col items-center justify-center gap-2 text-center",
            innerClassName,
          )}
        >
          <ArrowUpTrayIcon
            className={clsx("w-10 text-7xl", {
              "text-primary-500": isOver,
            })}
          />
          <div>{dropFilesHereText}</div>
        </div>
      )}
    </div>
  );
}

export default FileSelect;

const useOnPasteFiles = (
  enabled: boolean,
  onAcceptFiles: (files: File[]) => void,
  allowedFileTypes?: string[],
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
