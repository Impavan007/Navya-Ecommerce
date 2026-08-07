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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [howItWorksData, setHowItWorksData] = useState<HowItWorksData | null>(null);
  const [activeToggle, setActiveToggle] = useState<"renter" | "lender">("renter");
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'lender') {
      setActiveToggle('lender');
    }
  }, [searchParams]);

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