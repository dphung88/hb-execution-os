import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Execution OS",
  description: "Execution operating system for leadership task management."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
