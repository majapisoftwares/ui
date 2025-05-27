const videoExtensions = [".mp4"];

export default function isVideo(file: File | string): boolean {
  if (typeof file === "string") {
    return videoExtensions.some((ext) => file.endsWith(ext));
  }

  if (file instanceof File) {
    return videoExtensions.some((ext) => file.name.endsWith(ext));
  }

  return false;
}
