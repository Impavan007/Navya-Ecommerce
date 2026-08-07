import type { Metadata } from "next";
import ClientLayoutWrapper from "./components/ClientLayoutWrapper";
import CityCheckProvider from "./components/CityCheckProvider";

/* ---------------- Metadata ---------------- */

export const metadata: Metadata = {
  title: "Navyaa - B2B Textile & Fabric Marketplace",
  description:
    "Explore and source premium textiles, fabrics, and materials on Navyaa.",
};

/* ---------------- Layout ---------------- */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CityCheckProvider>
      <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
    </CityCheckProvider>
  );
}
