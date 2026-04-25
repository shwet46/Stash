import type { Metadata } from "next";
import { Noto_Sans, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/shared/Providers";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stash — Voice-Native AI Supply Chain Platform",
  description:
    "Manage your godown with just your voice. AI-powered inventory, orders, suppliers, billing, and delivery management for India's warehouse operators. Supports Hindi, English, and 22 Indian languages.",
  keywords: [
    "godown management",
    "warehouse management",
    "voice AI",
    "supply chain",
    "India",
    "inventory management",
    "Hindi voice assistant",
  ],
  authors: [{ name: "Stash AI" }],
  openGraph: {
    title: "Stash — Voice-Native AI Supply Chain Platform",
    description:
      "Manage your godown with just your voice. No smartphone or literacy required.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${plusJakartaSans.variable}`} data-scroll-behavior="smooth">
      <head>
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,bn,te,mr,ta,gu,kn,ml,pa,or',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              }, 'google_translate_element');
            }
          `}
        </Script>
      </head>
      <body>
        <Providers>
          <div id="google_translate_element" style={{ display: 'none' }}></div>
          {children}
        </Providers>
      </body>
    </html>
  );
}