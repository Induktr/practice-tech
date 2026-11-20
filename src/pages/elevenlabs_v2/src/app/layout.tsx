import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/shared/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Voice Generator & Text to Speech",
  description:
    "Rated the best text to speech (TTS) software online. Create premium AI voices for free and generate text to speech voiceovers in minutes with our character AI voice generator. Use free text to speech AI to convert text to mp3 in 29 languages with 100+ voices.",
  creator: "Induktr Studio",
  robots: "index, follow",
  alternates: {
    canonical: "https://devsheets.com/html/semantics",
  },
  twitter: {
    title: "AI Voice Generator & Text to Speech",
    description:
      "Rated the best text to speech (TTS) software online. Create premium AI voices for free and generate text to speech voiceovers in minutes with our character AI voice generator. Use free text to speech AI to convert text to mp3 in 29 languages with 100+ voices.",
    creator: "Induktr Studio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        "font-sans",
      )}
      data-theme="dark"
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
