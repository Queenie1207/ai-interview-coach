export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function validateResumeFile(file: File): string | undefined {
  if (!isPdfFile(file)) {
    return "Please choose a PDF file.";
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return "Resume PDF must be 10 MB or smaller.";
  }

  return undefined;
}
