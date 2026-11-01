import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "./providers";

import "@mantine/core/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corbelbase - Multi-tenant SaaS Project Management Platform",
  description: "Multi-tenant SaaS Project Management Platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
