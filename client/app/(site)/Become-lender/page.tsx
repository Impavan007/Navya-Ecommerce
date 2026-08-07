"use client";

import { useEffect, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import { motion, AnimatePresence } from "framer-motion";
import PrimaryButtonLight from "../components/PrimaryButtonLight";
import PrimaryButton from "../components/PrimaryButton";
import Image from "next/image";
import { waitlistApiService } from "../services/api/waitlist";
import { toast } from "react-hot-toast";
import { X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { baseApiService } from "../services/api/base";
import { useAuthStore } from "../stores/authStore";
import { BecomeAlenderEmailIcon, FormEnterNameIcon, JoinNavyaaIcon1, JoinNavyaaIcon2, JoinNavyaaIcon3, WhyBecomealenderIcon1, WhyBecomealenderIcon2, WhyBecomealenderIcon3, WhyBecomealenderIcon4 } from "../icons/icons";

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

const staticFaqs: FAQItem[] = [
  {
    question: "How do I get paid?",
    answer: "Payments are processed securely through Stripe. Once your item is delivered to the buyer, your earnings will be released to your account within 48 hours. We handle all the payment processing and security, so you can focus on sharing your style.",
    isOpen: false
  },
  {
    question: "What if the buyer claims the item is damaged or not as described?",
    answer: "We offer buyer and seller protection. Buyers have 3 days from delivery to inspect the item and report any discrepancies. If the item is significantly not as described or damaged during transit, we will facilitate a return and refund. Otherwise, all sales are final and earnings are released to you.",
    isOpen: false
  },
  {
    question: "Can I set my own price?",
    answer: "Yes! You have full control over your prices. We provide suggested pricing based on item value, brand, and market demand, but you can set your own rate.",
    isOpen: false
  },
  {
    question: "Do I need to clean my items before listing?",
    answer: "Yes, items should be clean and ready to wear when listed. We recommend professional dry cleaning for delicate items and thorough washing for others. Many sellers include the cleaning cost in their price or charge a small cleaning fee to cover these expenses.",
    isOpen: false
  },
  {
    question: "How does shipping work?",
    answer: "We provide prepaid shipping labels for sending items. As a seller, you'll ship your item to the buyer using our provided label. Shipping costs are included in the price.",
    isOpen: false
  },
  {
    question: "What types of items can I list?",
    answer: "You can list high-quality, contemporary fashion items in excellent condition. This includes dresses, designer handbags, accessories, formal wear, and special occasion outfits. Items should be from recognizable brands, less than 3 years old, and in like-new condition without stains or damage.",
    isOpen: false
  }
];

export default function BecomeALenderPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    PostalCode: ''
  });
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    const fetchLenderFaqs = async () => {
      try {
        const response = await baseApiService.get<any>("/faqs?role=Lender&limit=6");
        if (response.success && response.data?.faqs) {
          const apiFaqs = response.data.faqs.map((faq: any) => ({
            question: faq.question,
            answer: faq.answer,
            isOpen: false
          }));

          // Supplement with mock data if less than 6
          const combinedFaqs = [...apiFaqs];
          if (combinedFaqs.length < 6) {
            const needed = 6 - combinedFaqs.length;
            combinedFaqs.push(...staticFaqs.slice(0, needed));
          }
          setFaqs(combinedFaqs.slice(0, 6));
        } else {
          setFaqs(staticFaqs);
        }
      } catch (error) {
        console.error("Failed to fetch lender FAQs:", error);
        setFaqs(staticFaqs);
      }
    };

    fetchLenderFaqs();
  }, []);

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      setFormData(prev => ({
        ...prev,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.name,
        email: user.email
      }));
    }
  }, [isAuthenticated, user]);

  const [fileName, setFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const productData = ["Jackets", "Frocks", "OnePiece",];
  const router = useRouter();  // Scroll to form function
  const scrollToForm = () => {
    const formElement = document.getElementById("LenderForm");
    if (formElement) {
      formElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Check file size (50MB = 50 * 1024 * 1024 bytes)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }

      // Check file type
      const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!acceptedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, JPG, WEBP)');
        return;
      }

      setFileName(file.name);
      setSelectedFile(file);

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleRemoveFile = () => {
    setFileName('');
    setSelectedFile(null);
    setPreviewUrl('');

    // Revoke the object URL to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Reset the file input
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Clean up URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return;
    }
    // if (!formData.interest) {
    //   toast.error("Please select what you are interested in");
    //   return;
    // }
    // if (!formData.brands.trim()) {
    //   toast.error("Please enter brands or items you would lend");
    //   return;
    // }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare payload according to API requirements
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        city: formData.city.trim(),
        PostalCode: formData.PostalCode.trim()
        // role: formData.interest, // role values: "Lender", "Lending", "Both", or "Borrower"
        // brands: formData.brands.trim(),
        // brandImage: selectedFile || undefined, // Optional file
      };

      const response = await waitlistApiService.createWaitlist(payload);

      if (response.success) {
        toast.success(response.message || "Successfully joined the waitlist!");

        // Reset form
        setFormData(prev => ({
          name: isAuthenticated ? prev.name : "",
          email: prev.email,
          city: "",
          PostalCode: ''
        }));
        handleRemoveFile();
      } else {
        toast.error(response.message || "Failed to join waitlist. Please try again.");
      }
    } catch (error: any) {
      console.error("Error submitting waitlist:", error);
      toast.error(error?.message || "Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setFaqs(prevFaqs =>
      prevFaqs.map((faq, i) => ({
        ...faq,
        isOpen: i === index ? !faq.isOpen : false
      }))
    );
  };

  return (
    <div className="bg-[#FAF6F3] min-h-screen overflow-x-hidden">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Become a Seller" }]} />

      {/* Hero Section */}
      <div className="relative h-[550px] lg:h-[800px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/Hero_sectionIMage2.png"
            alt="Hero Background"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent " />
        </div>
        <div className="relative h-full flex items-center lg:items-end pb-10 lg:pb-20 justify-center ">
          <div className="text-center text-white px-6 w-full max-w-4xl mx-auto">
            <h1 className="font-['Playfair_Display'] text-[32px] sm:text-4xl lg:text-6xl font-normal leading-tight lg:leading-[60px] text-[#FAF6F3] mb-5 ">
              Start earning from your wardrobe
            </h1>
            <p className=" text-[#FAF6F3] font-['Poppins'] text-base lg:text-xl leading-relaxed mb-8 lg:mb-10 max-w-3xl mx-auto opacity-90">
              Sell your high-quality items and make money while sharing your style.
            </p>
            <div className="flex justify-center">
              <PrimaryButtonLight
                text="Get Started"
                onClick={scrollToForm}
                className="bg-[#1A1A1A] hover:bg-[#1a1a1a] px-10 py-4 lg:px-6 lg:py-3 text-lg lg:text-sm cursor-pointer rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lender Form Section */}
      <div className="bg-white shadow-xl overflow-hidden flex flex-col lg:flex-row ">

        {/* ================= LEFT IMAGE COLUMN ================= */}
        <div className="hidden lg:flex 2xl:w-[40%] lg:w-[50%] bg-[#E7C8CC] px-20 py-24 flex-col items-center">

          {/* Top Content */}
          <div>
            <h1 className="font-[canela] text-[60px] leading-[64px] text-[#3D1126] font-semibold">
              Join the Navyaa<br />Waitlist today!
            </h1>

            <p className="mt-6 font-['Poppins'] text-[18px] leading-[28px] text-[#3D1126] max-w-[480px]">
              Be among the first to buy, sell, or do both with Navyaa —
              Amsterdam’s first circular wardrobe.
            </p>

            <p className="mt-10 font-['canela'] text-[22px] text-[#3D1126] font-medium">
              We’re gradually opening Navyaa in select cities.
            </p>
          </div>

          {/* Illustration */}
          <div className="flex justify-center mt-20">
            <Image
              src="/assets/becomealender.svg"
              alt=""
              width={340}
              className="mix-blend-color-burn rounded-lg"
              height={305}
            />
          </div>

          {/* Bottom Benefits */}
          <div className="flex items-center justify-center gap-8 mt-20 text-[#3C3C3C] text-sm font-poppins ">

            <div className="flex justify-center items-center   gap-2">
              <JoinNavyaaIcon1 />
              <span className="text-[12px]">Get early access</span>
            </div>

            <div className="flex justify-center items-center  gap-2">
              <JoinNavyaaIcon2 />

              <span className="text-[12px]">Receive updates</span>
            </div>

            <div className="flex justify-center items-center  gap-2">
              <JoinNavyaaIcon3 />

              <span className="text-[12px]">Be first to rent or list</span>
            </div>

          </div>

        </div>


        {/* ================= RIGHT FORM ================= */}
        <div className="w-full 2xl:w-[60%] lg:w-[60%] px-6 py-10 sm:px-10 lg:p-16 relative">
          <div className="flex items-center justify-center mb-10">
            <span className="font-serif tracking-[0.2em] text-3xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
              NAVYAA
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#8A8A8A] focus:border-[#3D1126] outline-none font-['Poppins']"
                required
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A8A8A8]">
                <FormEnterNameIcon />
              </div>
            </div>

            {/* Email Input */}
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#8A8A8A] focus:border-[#3D1126] outline-none font-['Poppins'] disabled:opacity-60"
                required
                disabled={!!(isAuthenticated && user?.email)}
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A8A8A8]">
                <BecomeAlenderEmailIcon />
              </div>
            </div>

            {/* City and Postcode */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <div className="relative w-full sm:w-1/2">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#8A8A8A] focus:border-[#3D1126] outline-none font-['Poppins']"
                  required
                />
              </div>
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  placeholder="Postcode"
                  value={formData.PostalCode}
                  onChange={(e) => handleInputChange("PostalCode", e.target.value)}
                  className="w-full border-b border-[#E0E0E0] py-4 bg-transparent text-[#3D1126] placeholder:text-[#A8A8A8] focus:border-[#3D1126] outline-none font-['Poppins']"
                  required
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 mt-6">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="terms"
                  className="
                      peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-[#323232] 
                      checked:bg-[#323232] checked:border-[#323232] transition-all rounded-lg
                    "
                  required
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity rounded-lg"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <label htmlFor="terms" className="text-xs text-[#8A8A8A] font-['Poppins'] leading-tight mt-0.5">
                I accept the <Link href="/terms" className="underline text-[#8A8A8A]">Terms of Service</Link> and <Link href="/privacy" className="underline text-[#8A8A8A]">Privacy Policy</Link> and agree to receive Navyaa updates.
              </label>
            </div>
            <div className="flex items-center justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-[80%] mx-auto bg-[#1A1A1A] rounded-md text-[#ffffff] py-4 font-['Poppins'] text-sm font-medium hover:bg-black/80 transition-all mt-4 rounded-lg"
              >
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </button>
            </div>


            <div className="flex flex-col items-center gap-10 w-full pt-6">
              <div className="xl:w-[90%] w-full bg-[#F3D6DC] p-5 rounded-xl flex items-start sm:items-center justify-center gap-4">
                <div className="shrink-0 mt-1 sm:mt-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-lg">
                    <circle cx="10" cy="10" r="9" stroke="#3C3C3C" strokeWidth="1.2" />
                    <path d="M10 5V11" stroke="#3C3C3C" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M10 14V14.5" stroke="#3C3C3C" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-['Poppins'] text-sm text-[#5F5C54] leading-relaxed">
                  We’ll send you an email confirmation and notify you as soon as your account is approved.
                </p>
              </div>
            </div>

          </form>
        </div>

      </div>


      {/* Why Become a Lender Section */}
      <div className="bg-white min-h-screen lg:h-[100vh] overflow-hidden relative">

        {/* Background Image — Desktop (lg+) */}
        <div className="hidden lg:block absolute top-0 left-[28vw] h-full w-[35vw]">
          <Image
            src="/assets/lender-benefits-bg.jpg"
            alt="Benefits Background"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Layout Wrapper */}
        <div className="flex flex-col lg:relative h-auto lg:h-full">

          {/* Earn Extra Income */}
          <div className="
      bg-[#FFFFFF]
      lg:absolute lg:left-0 lg:top-0
      lg:w-[28vw] lg:h-[50vh]
      p-8 lg:px-[4vw] lg:py-[10vh]
    ">
            <div className="flex flex-col gap-6">
              <WhyBecomealenderIcon1 />
              <div className="flex flex-col gap-3 text-[#3D1126]">
                <p className="font-['Poppins'] font-bold text-lg">Earn Extra Income</p>
                <p className="font-['Poppins'] text-sm sm:text-base opacity-80">
                  Turn your unused wardrobe into a source of income. Sell your stylish, high-quality pieces and start earning today                </p>
              </div>
            </div>
          </div>

          {/* Control Your Listings */}
          <div className="
      bg-[#F3D6DC]
      lg:absolute lg:left-0 lg:top-[50vh]
      lg:w-[28vw] lg:h-[50vh]
      p-8 lg:px-[4vw] lg:py-[10vh]
    ">
            <div className="flex flex-col gap-6">
              <WhyBecomealenderIcon2 />
              <div className="flex flex-col gap-3 text-[#3D1126]">
                <p className="font-['Poppins'] font-bold text-lg">Control Your Listings</p>
                <p className="font-['Poppins'] text-sm sm:text-base opacity-80">
                  You decide the sale price and availability of your items. Enjoy the flexibility to manage your wardrobe as you see fit.                </p>
              </div>
            </div>
          </div>

          {/* Main Title Section */}
          <div className="
      bg-[#F3D6DC]
      lg:absolute lg:left-[63vw] lg:top-0
      lg:w-[37vw] lg:h-[50vh]
      p-8 lg:p-0 flex items-center justify-center
    ">
            <div className="text-center lg:text-left lg:px-[2vw]">
              <h2 className="font-['Playfair_Display'] text-4xl lg:text-[3.5vw] leading-[1.1] mb-6 text-black">
                Why<br />become a<br />Seller?
              </h2>
              <p className="font-['Poppins'] text-base sm:text-lg lg:text-[1.2vw] mb-8 text-black opacity-80">
                Monetize your wardrobe and help others access premium fashion.
              </p>
              <PrimaryButtonLight
                onClick={scrollToForm}
                text="Become a Seller"
                className="bg-[#1A1A1A] px-8 py-4 text-white rounded-lg w-full sm:w-auto"
              />
            </div>
          </div>

          {/* Bottom Right Section */}
          <div className="
      flex flex-col lg:flex-row
      lg:absolute lg:left-[63vw] lg:top-[50vh]
      lg:w-[37vw] lg:h-[50vh]
    ">

            {/* Eco-Friendly Impact */}
            <div className="bg-[#F3D6DC] p-8 lg:w-1/2 lg:px-[2vw] lg:py-[10vh]">
              <WhyBecomealenderIcon3 />
              <p className="font-['Poppins'] font-bold mt-6 text-lg">Eco-Friendly Impact</p>
              <p className="font-['Poppins'] mt-3 text-sm sm:text-base opacity-80">
                By buying and selling circular fashion, you contribute to a more sustainable fashion industry. Help reduce waste and promote circular fashion.
              </p>
            </div>

            {/* Hassle-Free Process */}
            <div className="bg-[#F3D6DC] p-8 lg:w-1/2 lg:px-[2vw] lg:py-[10vh]">
              <WhyBecomealenderIcon4 />
              <p className="font-['Poppins'] font-bold mt-6 text-lg">Hassle-Free Process</p>
              <p className="font-['Poppins'] mt-3 text-sm sm:text-base opacity-80">
                Listing your items is quick and easy. Once your item is listed, you can start earning with minimal effort.
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Start Earning CTA */}
      <div className="relative h-[400px] lg:h-[800px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/HeroSEctionImage3.png"
            alt="CTA Background"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="relative h-full flex items-end ">
          <div className="px-[20px] lg:px-[40px] max-w-4xl mx-auto mb-12 lg:ml-12">
            <div className="max-w-2xl">
              <h2 className="font-['Playfair_Display'] text-4xl lg:text-5xl font-normal leading-tight lg:leading-[48px] mb-4 lg:mb-6 text-black">
                Start Earning Today
              </h2>
              <p className="font-['Poppins'] text-lg lg:text-md leading-relaxed mb-8 lg:mb-10 text-black">
                It's quick, easy, and rewarding. List your items on Navyaa and start earning from your wardrobe.
              </p>
              <PrimaryButtonLight
                text="Become a seller"
                onClick={scrollToForm}
                className="bg-[#1A1A1A] text-white hover:bg-[#1a1a1a] px-8 lg:px-6 py-4 lg:py-3 text-lg lg:text-base w-full lg:w-auto cursor-pointer rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative bg-[#FAF6F3] py-20 overflow-hidden">

        {/* Vertical lines - Hidden on smallest mobile, shown from sm up */}
        <div className="hidden sm:block absolute top-0 bottom-0 left-[20px] lg:left-20 w-[1px] bg-[#6D6D6D]/30" />
        <div className="hidden sm:block absolute top-0 bottom-0 right-[20px] lg:right-20 w-[1px] bg-[#6D6D6D]/30" />

        {/* Horizontal lines */}
        <div className="absolute left-0 right-0 top-12 lg:top-20 h-[1px] bg-[#6D6D6D]/30" />
        <div className="absolute left-0 right-0 bottom-12 lg:bottom-20 h-[1px] bg-[#6D6D6D]/30" />


        {/* Content */}
        <div className="relative px-6 mb-5 lg:px-10 max-w-6xl mx-auto">

          <div className="text-center my-8  lg:my-12">
            <h2 className="font-['canela'] text-[30px] md:text-[40px] font-bold leading-tight text-[#3D1126]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 w-full flex flex-col items-center">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="
        w-full 
        bg-[#F3D6DC] 
        p-5 sm:p-6
        flex 
        flex-col
        rounded-xl
      "
              >
                {/* Question Row */}
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-['Poppins'] font-medium text-lg text-black pr-4">
                    {faq.question}
                  </h3>

                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-12 h-12 flex items-center justify-center bg-[#F3D6DC] flex-shrink-0 rounded-lg group"
                  >
                    <motion.svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      initial={false}
                      animate={{ rotate: faq.isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="rounded-lg"
                    >
                      <path
                        d="M12 6V18M6 12H18"
                        stroke="#3D1126"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </motion.svg>
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {faq.isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="font-['Poppins'] text-[#6d6d6d] mt-3">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>



          <div className="w-full flex items-center justify-center mt-12">
            <PrimaryButtonLight
              onClick={() => router.push('/Faq')}
              text="View All FAQs >"
              className="bg-[#1A1A1A] px-8 py-3 text-white rounded-lg"
            /></div>
        </div>
      </div>


    </div>
  );
}