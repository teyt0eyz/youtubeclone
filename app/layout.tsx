import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${APP_NAME} — Watch, Upload, Subscribe`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
