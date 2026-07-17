// app/layout.js
import "./globals.css";
import "easymde/dist/easymde.min.css";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import NavBar from "@/components/NavBar";
import { cookies } from "next/headers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://draftbox.app";
const siteDescription =
  "DraftBox is a lightweight Markdown draft editor with character counts, export tools, and private cloud sync.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DraftBox",
    template: "%s | DraftBox",
  },
  description: siteDescription,
  applicationName: "DraftBox",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "DraftBox",
    title: "DraftBox",
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: "DraftBox",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  // Read the language cookie on the server so html lang stays consistent.
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("i18n_lang")?.value;
  const initialLang = langCookie === "en" ? "en" : "ja";

  return (
    <html lang={initialLang}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* Keep provider state aligned with the server-selected language. */}
        <Providers defaultLang={initialLang}>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
