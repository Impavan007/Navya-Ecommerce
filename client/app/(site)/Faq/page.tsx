"use client";

import FAQ from "../components/FaqComponent";
import { Search } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import { useState, useEffect, useRef } from "react";
import { DropdownIcon } from "../icons/icons";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const hardcodedFaqs: FAQItem[] = [
  {
    id: 1,
    question: "What is Navyaa?",
    answer: "Navyaa is a leading B2B Textile Marketplace connecting global buyers with premium mills and suppliers. Our mission is to streamline the sourcing of sustainable textiles and high-quality fabrics.",
    category: "General"
  },
  {
    id: 2,
    question: "How do I create an account?",
    answer: "Click on the Profile icon in the top right of the navigation bar, select 'Sign Up', and follow the prompts to register. After signing up, verify your email using the link sent to your inbox to activate your account and set up your delivery preferences.",
    category: "General"
  },
  {
    id: 3,
    question: "Are the items authentic?",
    answer: "Yes, we encourage sellers to upload proof of purchase or authenticity certificates for luxury and designer pieces. In addition, our Buyer Protection policy covers all orders: if you receive an item that is significantly not as described or is counterfeit, you have 3 days from delivery to submit a dispute.",
    category: "Buying"
  },
  {
    id: 4,
    question: "Can I return a purchased item?",
    answer: "Under our standard buyer guidelines, returns are accepted within 14 days of delivery if the item is in its original condition with all tags and security seals intact. You can print the prepaid shipping label directly from your 'My Orders' detail page to ship it back to the seller.",
    category: "Buying"
  },
  {
    id: 5,
    question: "How does shipping work?",
    answer: "Once a purchase is confirmed, sellers are provided with a prepaid shipping label. They ship the item directly to your address, and you can track the status in real-time under 'My Orders' in your profile dashboard.",
    category: "Buying"
  },
  {
    id: 6,
    question: "How do I list an item for sale?",
    answer: "Switch to your Seller Account using the switch button in the navigation bar, then click 'Add Product'. Upload high-quality photos, write a clear description, select the category/fabric/occasion, specify size and price details, and submit. Once verified by our team, your listing will go live.",
    category: "Selling"
  },
  {
    id: 7,
    question: "How do I get paid?",
    answer: "Payments are processed securely via Stripe. Once the buyer receives the item, your earnings will be released to your linked bank account within 48 hours.",
    category: "Selling"
  },
  {
    id: 8,
    question: "What fees does Navyaa charge?",
    answer: "Listing items on Navyaa is completely free. We only charge a small commission on completed sales to cover payment processing, platform security, customer support, and shipping protections.",
    category: "Selling"
  }
];

const faqCategories = [
  { _id: "general", name: "General" },
  { _id: "buying", name: "Buying" },
  { _id: "selling", name: "Selling" }
];

export default function Home() {
  const [categories] = useState<{ _id: string; name: string }[]>(faqCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>(hardcodedFaqs);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Perform client-side filtering whenever search query or category changes
    const filtered = hardcodedFaqs.filter((faq) => {
      const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
      const matchesSearch =
        !searchInput.trim() ||
        faq.question.toLowerCase().includes(searchInput.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchInput.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredFaqs(filtered);
  }, [selectedCategory, searchInput]);

  const handleSearch = () => {
    // Search is handled reactively by the useEffect on searchInput change.
  };

  return (
    <div className=" bg-[#FAF6F3]  w-full">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQ's" }]} />
      {/* Main Content */}
      <main className=" mx-auto px-[20px] lg:px-[40px] py-6">

        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center w-full md:w-[70%] lg:w-[50%] md:ml-auto px-[20px] md:px-0">
          <div className="flex-grow relative w-full text-gray-400 focus-within:text-gray-600">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#A8A8A8]" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full pl-10 pr-3 py-3 border-b border-[#3D1126] placeholder-[#A8A8A8] focus:outline-none focus:border-gray-500 focus:ring-0 sm:text-sm bg-transparent"
              placeholder="Search here..."
            />
          </div>

          <button
            onClick={handleSearch}
            className="w-full md:w-auto bg-[#1A1A1A] text-[#ffffff] px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors font-poppins"
          >
            Search
          </button>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-48" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#F3D6DC] text-[#000000] px-4 py-3 rounded-lg flex justify-between items-center text-sm font-medium font-poppins"
              >
                <span className="truncate">{selectedCategory === "All" ? "Category" : selectedCategory}</span>
                <DropdownIcon size={24} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-[#F3D6DC] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    className="px-4 py-2 hover:bg-[#F3D6DC] cursor-pointer text-sm font-poppins text-[#000000]"
                    onClick={() => {
                      setSelectedCategory("All");
                      setIsDropdownOpen(false);
                    }}
                  >
                    All Categories
                  </div>
                  {categories.map((cat) => (
                    <div
                      key={cat._id}
                      className="px-4 py-2 hover:bg-[#F3D6DC] cursor-pointer text-sm font-poppins text-[#000000]"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-5 py-10">
          {filteredFaqs.length > 0 ? (
            <FAQ items={filteredFaqs} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-[#F3D6DC] p-6 rounded-full mb-6">
                <Search className="h-10 w-10 text-[#3D1126]" />
              </div>
              <h3 className="text-2xl font-['Canela'] text-[#3D1126] mb-2">No FAQ's Found</h3>
              <p className="text-[#A8A8A8] font-['Poppins'] max-w-md mx-auto">
                {searchInput
                  ? `We couldn't find any results for "${searchInput}". Try adjusting your search or filters.`
                  : "There are currently no frequently asked questions available for this category."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
