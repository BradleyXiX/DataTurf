import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


const saira = localFont({
  src: "./fonts/saira.woff2",
  variable: "--font-saira",
  weight: "100 900",
  display: "swap",
});

const chivoMono = localFont({
  src: "./fonts/chivo-mono.woff2",
  variable: "--font-chivo-mono",
  weight: "100 900",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "DataTurf | Premium Analytics",
  description: "Awwwards-caliber sports analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${saira.variable} ${chivoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
