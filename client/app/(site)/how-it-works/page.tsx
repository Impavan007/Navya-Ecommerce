"use client";

import Breadcrumb from "../components/Breadcrumb";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
};

export default function HowItWorksPage() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full min-h-screen">
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "How It Works" }]} />
      </div>

      {/* Constrained Content Container */}
      <div className="content-stretch flex flex-col gap-[40px] items-center relative shrink-0 w-full max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full">
          {/* Title Section */}
          <div className="box-border content-stretch flex flex-col gap-[20px] h-[49px] items-start px-[20px] lg:px-[40px] py-0 relative shrink-0 w-full">
            <p className="font-['Playfair_Display'] font-medium leading-[28px] relative shrink-0 text-[20px] text-black w-full">
              How It Works
            </p>
            <div className="bg-black h-px shrink-0 w-full" />
          </div>
        </div>

        {/* Content Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full max-w-[1360px] mx-auto px-[20px] lg:px-[40px]"
        >
          {/* Intro */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] w-full">
              Buying on Navyaa is simple. Follow these steps to browse items, make your purchase, and enjoy a smooth pickup or delivery experience. This guide summarizes key buyer information from our FAQs.
            </p>
          </motion.div>

          {/* Step 1 */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              1. Create Your Account
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Sign up using your email or social login.</span></li>
                <li className="leading-[16px]"><span>Verify your account from the confirmation email.</span></li>
                <li className="leading-[16px]"><span>Complete your profile for a faster checkout.</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              2. Browse and Select an Item
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Explore listings and use categories or search to find the right fit.</span></li>
                <li className="leading-[16px]"><span>Check item photos, description, size, and availability.</span></li>
                <li className="leading-[16px]"><span>Select a purchase option that works for you.</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              3. Checkout and Payment
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Proceed to checkout and confirm your order details.</span></li>
                <li className="leading-[16px]"><span>Payments are processed securely through Navyaa.</span></li>
                <li className="leading-[16px]"><span>Receive order confirmation with pickup or delivery details as set by the seller.</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              4. Pickup, Delivery, and Enjoy
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Follow the seller’s preferred method: pickup or delivery.</span></li>
                <li className="leading-[16px]"><span>Enjoy your purchased items.</span></li>
                <li className="leading-[16px]"><span>Reach out to support if you need help at any point.</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Step 5 */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              5. Returns and Guidelines
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Follow community rules to ensure items match descriptions.</span></li>
                <li className="leading-[16px]"><span>Any misrepresentations are handled per our dispute policies.</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Step 6 */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              6. Damage, Loss, and Support
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>If an item is damaged or lost during delivery, contact support immediately.</span></li>
                <li className="leading-[16px]"><span>For disputes or review concerns, our team can help resolve issues per our community guidelines.</span></li>
              </ul>
            </div>
          </motion.div>

          {/* Step 7 */}
          <motion.div variants={itemVariants} className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              7. Modify or Cancel Your Order
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>You can modify or cancel from your dashboard up to 24 hours before order fulfillment starts.</span></li>
                <li className="leading-[16px]"><span>Closer to the start time, changes may require approval.</span></li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
