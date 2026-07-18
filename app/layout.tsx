import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { LocaleProvider } from "@/components/LocaleProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Filmchi — پیشنهاد فیلم بر اساس حال‌وهوا",
  description:
    "به فیلمچی بگو حالت چطوره تا پنج فیلم عالی پیشنهاد بدهد.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      data-locale="fa"
      data-theme="dark"
      className={`${display.variable} ${sans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
