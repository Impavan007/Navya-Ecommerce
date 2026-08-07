'use client';

import React from 'react';
import CommonModal from '../../../components/common/CommonModal';
import Image from 'next/image';
import { HowItWorksData, HowItWorksStep } from '../../store/HowItWorks/HowItWorksStore';

interface HowItWorksPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HowItWorksData;
  steps: { id: string; title: string; description: string; image: string | File | null }[];
  activeTab?: "renter" | "lender";
}

export default function HowItWorksPreviewModal({
  isOpen,
  onClose,
  data,
  steps,
  activeTab = "renter"
}: HowItWorksPreviewModalProps) {
  const [localActiveTab, setLocalActiveTab] = React.useState<"renter" | "lender">(activeTab);

  React.useEffect(() => {
    if (isOpen) {
      setLocalActiveTab(activeTab);
    }
  }, [isOpen, activeTab]);

  const getImageUrl = (image: string | File | null) => {
    if (!image) return null;
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image;
  };

  // Determine which steps to show based on local toggle
  const displaySteps = localActiveTab === activeTab 
    ? steps 
    : ((localActiveTab === "renter" ? data.renter_steps : data.lender_steps) || []).map((s, i) => ({
        id: s._id || i.toString(),
        title: s.title,
        description: s.description,
        image: s.icon
      }));

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="How It Works Preview"
      size="full"
    >
      <div className="bg-gray-50 -m-6  max-h-[80vh] overflow-y-auto font-poppins">
        {/* Top Section */}
        <div className="mx-auto px-[40px] py-16 lg:py-24">

          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-32">
            {/* Text Content */}
            <div className="flex-[0.8] space-y-12">
              <h1 className="text-5xl lg:text-[72px] font-canela font-medium text-gray-900 leading-[1.1]">
                {(() => {
                  let headline = data.headline || "Want it? Rent it. Own it? Lend it.";

                  // Try to split by ". " or "? " to get two logical lines
                  const parts = headline.split(/(?<=[.?])\s+/);
                  if (parts.length >= 2) {
                    return (
                      <>
                        <span className="block mb-2">{parts.slice(0, Math.ceil(parts.length / 2)).join(' ')}</span>
                        <span className="block">{parts.slice(Math.ceil(parts.length / 2)).join(' ')}</span>
                      </>
                    );
                  }
                  return headline;
                })()}
              </h1>
              <div className="space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800 tracking-[0.2em] uppercase leading-relaxed max-w-[600px]">
                  {data.sub_headline || "ACCESS THE WARDROBE YOU WANT, WITHOUT THE WASTE"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 text-sm lg:text-base text-gray-600 leading-relaxed font-poppins">
                  <p>
                    {data.supporting_paragraph ? (
                      data.supporting_paragraph.split('. ').slice(0, Math.ceil(data.supporting_paragraph.split('. ').length / 2)).join('. ') + (data.supporting_paragraph.includes('. ') ? '.' : '')
                    ) : "Where owning fewer items unlocks more style, more experiences and more financial freedom."}
                  </p>
                  <p>
                    {data.supporting_paragraph && data.supporting_paragraph.includes('. ') ? (
                      data.supporting_paragraph.split('. ').slice(Math.ceil(data.supporting_paragraph.split('. ').length / 2)).join('. ')
                    ) : "A world where wardrobes are shared, not wasted."}
                  </p>
                </div>
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1 w-full lg:sticky lg:top-10">
              <div className="relative aspect-[16/10] rounded-sm overflow-hidden shadow-sm">
                {data.hero_image ? (
                  <img
                    src={getImageUrl(data.hero_image) || ""}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No image uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-gray-50 py-16">
          <div className=" mx-auto px-[40px]">
            {/* Toggle Buttons (Repositioned) */}
            <div className="flex justify-center mb-16">
              <div className="bg-white p-1.5 rounded-2xl flex gap-1.5 shadow-sm border border-[#FDE7E9]">
                <button
                  onClick={() => setLocalActiveTab("renter")}
                  className={`px-8 py-3 rounded-xl text-lg font-canela font-semibold transition-all duration-300 ${localActiveTab === "renter"
                    ? "bg-gray-50 text-[#3D1126]"
                    : "text-[#6F6F6F] hover:bg-gray-50"
                    }`}
                >
                  For renter
                </button>
                <button
                  onClick={() => setLocalActiveTab("lender")}
                  className={`px-8 py-3 rounded-xl text-lg font-canela font-semibold transition-all duration-300 ${localActiveTab === "lender"
                    ? "bg-gray-50 text-[#3D1126]"
                    : "text-[#6F6F6F] hover:bg-gray-50"
                    }`}
                >
                  For lender
                </button>
              </div>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${displaySteps.length >= 5 ? 'lg:grid-cols-5' : `lg:grid-cols-${displaySteps.length}`} gap-4 justify-center`}>
              {displaySteps.map((step, index) => (
                <div
                  key={step.id}
                  className="bg-gray-50 p-8 rounded-sm space-y-4 flex flex-col h-full"
                >
                  <div className="w-12 h-12 flex-shrink-0">
                    {step.image ? (
                      <img
                        src={getImageUrl(step.image) || ""}
                        alt={step.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 font-canela">
                      {step.title || `Step ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {step.description || "Step description goes here..."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CommonModal>
  );
}
