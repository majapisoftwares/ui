const imageExtensions = [".png", ".jpg", ".jpeg", ".webp"];

export default function isImage(file: File | string): boolean {
  if (typeof file === "string") {
    return imageExtensions.some((ext) => file.endsWith(ext));
  }

  if (file instanceof File) {
    return imageExtensions.some((ext) => file.name.endsWith(ext));
  }

  return false;
}
