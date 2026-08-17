"use client";

import { useRef, useState } from "react";
import { formatFileSize } from "@/utils/fileValidation";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { translate } from "@/lib/i18n/messages";

type ResumeUploaderProps = {
  locale: SupportedLocale;
  resumeFile: File | null;
  error?: string;
  disabled: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
};

export function ResumeUploader({
  locale,
  resumeFile,
  error,
  disabled,
  onFileSelect,
  onRemove,
}: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function openFilePicker() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-950">{translate(locale, "resumePdf")}</h2>
          <p className="mt-1 text-sm text-zinc-600">{translate(locale, "acceptedFormat")}</p>
        </div>
        {resumeFile ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {translate(locale, "remove")}
          </button>
        ) : null}
      </div>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`mt-5 rounded-lg border-2 border-dashed p-6 transition ${
          isDragging ? "border-teal-500 bg-teal-50" : "border-zinc-300 bg-zinc-50"
        } ${disabled ? "opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          disabled={disabled}
          onChange={handleInputChange}
          className="sr-only"
          aria-describedby={error ? "resume-error" : undefined}
        />

        {resumeFile ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-950">{resumeFile.name}</p>
              <p className="mt-1 text-sm text-zinc-600">{formatFileSize(resumeFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={openFilePicker}
              disabled={disabled}
              className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-500 sm:w-auto"
            >
              {translate(locale, "change")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={disabled}
            className="flex w-full flex-col items-center justify-center rounded-md px-4 py-6 text-center transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            <span className="text-base font-semibold text-zinc-950">{translate(locale, "choosePdf")}</span>
            <span className="mt-2 text-sm text-zinc-600">
              {translate(locale, "browserState")}
            </span>
          </button>
        )}
      </div>

      {error ? (
        <p id="resume-error" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
