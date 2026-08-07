// app/layout.tsx
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Poppins,
  Playfair_Display,
  Roboto,
  Pacifico,
  Inter,
} from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { SocketProvider } from "./providers/SocketProvider";
import { ToastProvider } from "./(site)/components/ToastProvider";
import WaitlistProvider from "./(site)/components/WaitlistProvider";
import AuthInitializer from "./(site)/components/AuthInitializer";
import GlobalRouteProtection from "./(site)/components/GlobalRouteProtection";
import { LoadingProvider } from "./(site)/contexts/LoadingContext";


/* ---------- Font Definitions ---------- */

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const canela = localFont({
  src: [
    {
      path: "./fonts/canela/CanelaText-Light-Trial.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/canela/CanelaText-Regular-Trial.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/canela/CanelaText-RegularNo2-Trial.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/canela/CanelaText-RegularItalic-Trial.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/canela/CanelaText-Medium-Trial.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/canela/CanelaText-Bold-Trial.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/canela/CanelaText-Black-Trial.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-canela",
  display: "swap",
});

/* ---------- Metadata ---------- */

export const metadata: Metadata = {
  title: "Navyaa Platform",
  description: "Unified platform for admin, seller, and Buyer",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

/* ---------- Root Layout ---------- */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${playfair.variable} ${canela.variable} ${roboto.variable} ${pacifico.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className={`${poppins.className} antialiased`}>
        <SocketProvider>
          <AuthInitializer />
          <LoadingProvider>
            <WaitlistProvider>
              <GlobalRouteProtection>
                {children}
              </GlobalRouteProtection>
            </WaitlistProvider>
            <ToastProvider />
          </LoadingProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
