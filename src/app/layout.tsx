import type { Metadata, Viewport } from "next";
import { Noto_Sans_Myanmar, Noto_Serif_Myanmar } from "next/font/google";
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
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = {
  themeColor: "#fffaf3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="my" className={`${myanmarSans.variable} ${myanmarSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
