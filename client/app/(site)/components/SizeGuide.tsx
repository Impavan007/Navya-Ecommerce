"use client";

import { useEffect, useRef } from "react";

type SizeGuideProps = {
  isOpen: boolean;
  onClose: () => void;
  availableSizes?: string[]; // Product sizes like ["UK 12", "EU 34", "USA 4"]
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
};

import { BaseModal, ModalHeader, ModalBody } from "./Modal";

export default function SizeGuide({ isOpen, onClose, availableSizes = [], selectedSize, onSizeSelect }: SizeGuideProps) {
  // Helper function to check if a size from the guide matches any available product size
  const isSizeAvailable = (region: string, size: string) => {
    if (!availableSizes || availableSizes.length === 0) return false;
    const regionUpper = region.toUpperCase();
    const sizeUpper = size.toUpperCase();
    // Check if any product size contains this region and size (e.g., "UK 12" contains "UK" and "12")
    // Also check for exact size matches (e.g., "12" matches "12" regardless of region)
    return availableSizes.some(productSize => {
      const normalizedProductSize = productSize.toUpperCase().trim();
      // Match if product size contains both region and size (e.g., "UK 12")
      if (normalizedProductSize.includes(regionUpper) && normalizedProductSize.includes(sizeUpper)) {
        return true;
      }
      // Also match if product size is just the size number (e.g., "12" in product matches "12" in guide)
      if (normalizedProductSize === sizeUpper ||
        normalizedProductSize.endsWith(` ${sizeUpper}`) ||
        normalizedProductSize.startsWith(`${sizeUpper} `) ||
        normalizedProductSize.includes(` ${sizeUpper} `)) {
        return true;
      }
      return false;
    });
  };

  // Helper function to find the matching product size for a guide size
  const findMatchingProductSize = (region: string, size: string): string | null => {
    if (!availableSizes || availableSizes.length === 0) return null;
    const regionUpper = region.toUpperCase();
    const sizeUpper = size.toUpperCase();

    // Try to find exact match with region (e.g., "UK 12")
    const regionMatch = availableSizes.find(productSize => {
      const normalizedProductSize = productSize.toUpperCase().trim();
      return normalizedProductSize.includes(regionUpper) && normalizedProductSize.includes(sizeUpper);
    });
    if (regionMatch) return regionMatch;

    // Try to find match by size only (e.g., product has "12" or "UK 12" matches guide "12")
    const sizeMatch = availableSizes.find(productSize => {
      const normalizedProductSize = productSize.toUpperCase().trim();
      return normalizedProductSize === sizeUpper ||
        normalizedProductSize.endsWith(` ${sizeUpper}`) ||
        normalizedProductSize.startsWith(`${sizeUpper} `) ||
        normalizedProductSize.includes(` ${sizeUpper} `);
    });
    if (sizeMatch) return sizeMatch;

    return null;
  };

  const handleSizeClick = (region: string, size: string) => {
    const matchingSize = findMatchingProductSize(region, size);
    if (matchingSize && onSizeSelect) {
      onSizeSelect(matchingSize);
      onClose();
    } else if (availableSizes && availableSizes.length > 0 && !matchingSize) {
      // Size not available - don't do anything (button is disabled anyway)
      return;
    } else if (!availableSizes || availableSizes.length === 0) {
      // If no product sizes available, still allow selection of the guide format
      const formattedSize = `${region} ${size}`;
      if (onSizeSelect) {
        onSizeSelect(formattedSize);
        onClose();
      }
    }
  };

  const sizeData = [
    {
      region: "India",
      bgColor: "bg-[#FEF3C7]",
      sizes: ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24"]
    },
    {
      region: "UK",
      bgColor: "bg-[#F9E4E8]",
      sizes: ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24"]
    },
    {
      region: "USA",
      bgColor: "bg-[#F3D0D7]",
      sizes: ["2", "4", "6", "8", "10", "12", "14", "16", "18", "20"]
    },
    {
      region: "EU",
      bgColor: "bg-[#F9E4E8]",
      sizes: ["34", "36", "38", "40", "42", "44", "46", "48", "50", "52"]
    },
    {
      region: "AUS",
      bgColor: "bg-[#F9E4E8]",
      sizes: ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24"]
    }
  ];

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalHeader title="Size Guide" onClose={onClose} />
      <ModalBody>
        <div className="flex flex-col items-start w-full border border-gray-100 overflow-x-auto">
          {sizeData.map((row, rowIndex) => (
            <div key={rowIndex} className={`flex items-center w-full min-w-max ${row.bgColor}`}>
              <div className={`box-border flex items-center justify-center px-6 py-4 w-[100px] shrink-0 border-r border-white/20`}>
                <p className="uppercase font-poppins font-bold leading-[24px] text-[#3D1126] text-[14px] m-0">
                  {row.region}
                </p>
              </div>
              <div className="flex flex-1">
                {row.sizes.map((size, sizeIndex) => {
                  const isAvailable = isSizeAvailable(row.region, size);
                  const matchingProductSize = findMatchingProductSize(row.region, size);
                  const isSelected = matchingProductSize && selectedSize &&
                    selectedSize.toUpperCase().includes(row.region.toUpperCase()) &&
                    selectedSize.toUpperCase().includes(size);

                  return (
                    <button
                      key={sizeIndex}
                      onClick={() => handleSizeClick(row.region, size)}
                      disabled={!isAvailable && availableSizes.length > 0}
                      className={`box-border flex items-center justify-center px-3 py-4 w-[60px] shrink-0 transition-all border-r border-white/20 last:border-r-0 ${isAvailable ? 'cursor-pointer hover:bg-black/5' : 'opacity-40 cursor-not-allowed'
                        } ${isSelected ? 'bg-black/10 font-bold' : ''
                        }`}
                    >
                      <p className={`font-poppins font-medium text-[14px] m-0 ${isSelected ? 'text-black' : 'text-[#3D1126]'}`}>
                        {size}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </BaseModal>
  );
}

