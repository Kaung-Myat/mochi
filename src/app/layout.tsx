import type { Metadata, Viewport } from "next";
import { Noto_Sans_Myanmar, Noto_Serif_Myanmar } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const myanmarSans = Noto_Sans_Myanmar({
  subsets: ["myanmar", "latin"],
  display: "swap",
  variable: "--font-myanmar-sans",
  fallback: ["Myanmar Text", "Padauk", "sans-serif"],
});

const myanmarSerif = Noto_Serif_Myanmar({
  subsets: ["myanmar"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-myanmar-serif",
  fallback: ["Noto Sans Myanmar", "Myanmar Text", "serif"],
});

export const metadata: Metadata = {
  title: "Mochi",
  description: "မင်းကို ဂရုစိုက်ပေးမယ့် သူငယ်ချင်းလေး။",
  applicationName: "Mochi",
  appleWebApp: {
    capable: true,
    title: "Mochi",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = {
  themeColor: "#8fd0f8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="my" className={`${myanmarSans.variable} ${myanmarSerif.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
