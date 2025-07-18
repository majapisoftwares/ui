import clsx from "../../utils/clsx";
import {
  type ComponentPropsWithRef,
  type ComponentType,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDeepCompareEffect } from "react-use";
import {
  defaultHelpTextClassName,
  defaultLabelClassName,
  type InputProps,
} from "../Input";
import FileSelect, { type FileSelectProps } from "../FileSelect";
import isomorphicObjectId from "@majapisoftwares/next/utils/isomorphicObjectId";
import { isEqual } from "lodash-es";
import Text from "../Text";
import PreviewFile, { type PreviewFileProps } from "./PreviewFile";
import concurrentForOf from "@majapisoftwares/next/utils/concurrentForOf";
import paginated from "@majapisoftwares/next/utils/paginated";
import Pagination from "../Pagination";

export type FileFile = {
  _id: string;
  file: File;
  description?: string;
  name: string;
  type: string;
  size: number;
  url: string;
};

export type FileUrl = {
  _id: string;
  url: string;
  description?: string;
  name: string;
  type: string;
  size: number;
};

export type FileInputFile = FileFile | FileUrl;

function FileInput<PFP extends object>({
  error,
  className,
  helpText,
  onChange,
  name,
  limit,
  label,
  id,
  required,
  onMouseOver,
  onMouseOut,
  readOnly,
  value,
  emptyText = "No files",
  downloadText = "Download",
  openText = "Open",
  fileDisplay,
  asyncUpload,
  onRejectFiles,
  loading,
  maxConcurrentUploads = 1,
  fileAdditionalInfo,
  ref,
  fileSelectClassName,
  previewFileClassName,
  filesPerPage = 10,
  previewFileComponent,
  previewFileProps,
  filesClassName,
  ...props
}: Pick<
  InputProps<false>,
  | "error"
  | "className"
  | "helpText"
  | "name"
  | "label"
  | "id"
  | "required"
  | "onMouseOver"
  | "onMouseOut"
> &
  Omit<FileSelectProps, "onAcceptFiles" | "onRejectFiles"> & {
    readOnly?: boolean;
    value?: FileInputFile[];
    onChange?: (event: { target: { value: FileInputFile[] } }) => void;
    emptyText?: string;
    downloadText?: string;
    openText?: string;
    fileDisplay?: "info" | "preview" | "both";
    asyncUpload?: (
      file: FileFile & { _id: string },
    ) => Promise<FileUrl & { _id: string }>;
    onRejectFiles?: (
      files: File[],
      reason: "type" | "size" | "limit" | "upload-error",
    ) => void;
    loading?: boolean;
    maxConcurrentUploads?: number;
    fileAdditionalInfo?: (file: FileInputFile, index: number) => ReactNode;
    fileSelectClassName?: string;
    previewFileClassName?: string;
    filesPerPage?: number;
    previewFileComponent?: ComponentType<PreviewFileProps & PFP>;
    previewFileProps?: PFP;
    filesClassName?: string;
  }) {
  const [uploading, setUploading] = useState(false);
  const [innerValue, setInnerValue] = useState<FileInputFile[]>(value || []);
  const [currentPage, setCurrentPage] = useState(1);

  const PreviewFileComponent = useMemo(
    () => memo(previewFileComponent || PreviewFile, isEqual),
    [previewFileComponent],
  );

  const paginatedValue = paginated(innerValue, currentPage - 1, filesPerPage);
  useEffect(() => {
    const totalPages = Math.ceil(innerValue.length / filesPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [innerValue.length, currentPage, filesPerPage]);

  useDeepCompareEffect(() => {
    if (value && !isEqual(value, innerValue)) {
      setInnerValue(value);
    }
  }, [{ value }]);

  const innerRef = useRef<HTMLInputElement>({
    get value() {
      return innerValue;
    },
    set value(value) {
      setInnerValue(value || []);
    },
  } as unknown as HTMLInputElement);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(innerRef.current);
      } else {
        try {
          ref.current = innerRef.current;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // do nothing
        }
      }
    }
  }, [ref]);

  const handleAcceptFiles = async (files: File[]) => {
    if (!asyncUpload) {
      setInnerValue((value) => [
        ...value,
        ...files
          .filter((_file, index) => !limit || index <= limit - value.length - 1)
          .map((file) => ({
            _id: isomorphicObjectId().toString(),
            name: file.name,
            file,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
          })),
      ]);
    } else {
      setUploading(true);
      if (onRejectFiles) {
        const rejectedFilesLimit = files.filter(
          (_file, index) => !(!limit || index <= limit - innerValue.length - 1),
        );
        if (rejectedFilesLimit.length) {
          onRejectFiles(rejectedFilesLimit, "limit");
        }
      }
      const acceptedFiles = files.filter(
        (_file, index) => !limit || index <= limit - innerValue.length - 1,
      );
      const filesNotUploaded: typeof acceptedFiles = [];
      await concurrentForOf(
        acceptedFiles,
        async (file) => {
          try {
            const uploadedFile = await asyncUpload({
              _id: isomorphicObjectId().toString(),
              name: file.name,
              file,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
            });
            setInnerValue((value) => [...value, uploadedFile]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            filesNotUploaded.push(file);
          }
        },
        maxConcurrentUploads,
      );
      if (onRejectFiles && filesNotUploaded.length) {
        onRejectFiles(filesNotUploaded, "upload-error");
      }
      setUploading(false);
    }
  };

  useDeepCompareEffect(() => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: innerValue,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }
  }, [innerValue]);

  const handleDeleteClick = useCallback(
    (clickedFile: FileInputFile) => () => {
      setInnerValue((value) => [
        ...value.filter((file) => file !== clickedFile),
      ]);
    },
    [],
  );

  return (
    <div
      data-input-name={name}
      data-error={error ? "" : undefined}
      data-loading={loading ? "" : undefined}
      className={clsx("relative data-loading:animate-pulse", className)}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {label && (
        <label htmlFor={id} className={defaultLabelClassName}>
          {label}
          {required && (
            <>
              {" "}
              <span className="text-red-500">*</span>
            </>
          )}
        </label>
      )}
      <div
        className={clsx(
          "flex flex-col gap-4",
          {
            "md:grid md:grid-cols-2": !!innerValue.length,
            "min-h-[140px]": !!innerValue.length || !readOnly,
          },
          filesClassName,
        )}
      >
        {paginatedValue.map((file, index) => (
          <PreviewFileComponent
            key={index}
            file={file}
            readOnly={readOnly}
            handleDeleteClick={handleDeleteClick(file)}
            downloadText={downloadText}
            display={fileDisplay}
            openText={openText}
            additionalInfo={fileAdditionalInfo}
            index={index}
            className={previewFileClassName}
            filesPerPage={filesPerPage}
            currentPage={currentPage}
            {...(previewFileProps as PFP)}
          />
        ))}
        {innerValue.length > filesPerPage && (
          <Pagination
            className="mx-auto md:col-span-2"
            currentPage={currentPage}
            totalItems={innerValue.length}
            onChangePage={setCurrentPage}
            itemsPerPage={filesPerPage}
          />
        )}
        {readOnly && !innerValue.length && (
          <Text variant="secondary">{emptyText}</Text>
        )}
        {!readOnly && (!limit || innerValue.length < limit) && (
          <FileSelect
            {...props}
            className={fileSelectClassName}
            id={id}
            onAcceptFiles={handleAcceptFiles}
            limit={limit ? limit - innerValue.length : undefined}
            uploading={uploading}
            onRejectFiles={onRejectFiles}
            error={error}
          />
        )}
      </div>
      {helpText && (
        <div
          className={clsx(
            defaultHelpTextClassName,
            "in-data-error:text-error-500",
          )}
        >
          {helpText}
        </div>
      )}
    </div>
  );
}

// noinspection JSUnusedGlobalSymbols
export type FileInputProps = ComponentPropsWithRef<typeof FileInput>;

export default memo(FileInput, isEqual) as typeof FileInput;
