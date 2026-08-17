import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Interview Coach",
  description: "Client-side mock interview analysis for resume and job description matching.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
