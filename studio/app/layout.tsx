import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenCut Studio — AI Editing Workspace",
  description: "Independent editing workspace for silence analysis and media workflows."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
