'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroSection from "./components/HeroSection";
import FeaturedProducts from "./components/FeaturedProducts";
import ExploreByCategory from "./components/ExploreByCategory";
import HowItWorks from "./components/HowItWorks";
import StoriesThatInspire from "./components/StoriesThatInspire";
import StartRentingToday from "./components/StartRentingToday";
import SignUpModal from "./components/SignUpModal";
import AuthGateWrapper from "./components/AuthGateWrapper";
import Section3 from './LandinPageSection3/page';
import apiServices from "./services/api";
import { HowItWorksData } from "./types/api";


export default function Home() {
  const [activeToggle, setActiveToggle] = useState<"renter" | "lender">("renter");
  const [howItWorksData, setHowItWorksData] = useState<HowItWorksData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHowItWorks = async () => {
      try {
        setLoading(true);
        const response = await apiServices.howItWorks.getHowItWorks();
        if (response.success && response.data) {
          setHowItWorksData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch How It Works data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHowItWorks();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <TabSync setActiveToggle={setActiveToggle} />
      </Suspense>
      <HeroSection />
      <FeaturedProducts />
      {/* <ExploreByCategory /> */}
      <Section3 data={howItWorksData} activeToggle={activeToggle} loading={loading} />
      <HowItWorks
        data={howItWorksData}
        activeToggle={activeToggle}
        setActiveToggle={setActiveToggle}
        loading={loading}
      />
      <StoriesThatInspire />
      <StartRentingToday />
    </>
  );
}

function TabSync({ setActiveToggle }: { setActiveToggle: (val: "renter" | "lender") => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'lender') {
      setActiveToggle('lender');
    }
  }, [searchParams, setActiveToggle]);
  return null;
}