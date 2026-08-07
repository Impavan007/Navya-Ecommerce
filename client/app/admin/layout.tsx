import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Navyaa admin Portal",
  description: "admin dashboard for Navyaa B2B textile marketplace",
};

import AdminLayoutWrapper from "./components/AdminLayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  );
}
