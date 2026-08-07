"use client";

import Breadcrumb from "../components/Breadcrumb";

export default function TermsOfServicePage() {
  return (
    <div className="bg-white content-stretch flex  flex-col items-center relative size-full min-h-screen">
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
      </div>

      {/* Constrained Content Container */}
      <div className="content-stretch flex pt-10 flex-col gap-[40px] items-center relative shrink-0 w-full  mx-auto">
        {/* Header Section */}
        <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full">
          {/* Title Section */}
          <div className="box-border content-stretch flex flex-col gap-[20px] h-[49px] items-start px-[20px] lg:px-[40px] py-0 relative shrink-0 w-full">
            <p className="font-['Playfair_Display'] font-medium leading-[28px] relative shrink-0 text-[20px] text-black w-full">
              Terms of Service
            </p>
            <div className="bg-black h-px shrink-0 w-full" />
          </div>
        </div>

        {/* Content Section */}
        <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full  mx-auto px-[20px] lg:px-[40px]">
          {/* Introduction */}
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <p className="font-poppins leading-[22px] not-italic relative shrink-0 text-[15px] text-black w-full">
                The terms of service are divided into 6 parts:
              </p>
              <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[0px] text-black w-full">
                <p className="leading-[20px] relative shrink-0 text-[14px] w-full">
                  <span className="font-poppins font-medium">{`Part A: `}</span>
                  <span className="font-poppins text-[#6d6d6d]">About Navyaa</span>
                </p>
                <p className="relative shrink-0 w-full">
                  <span className="font-poppins font-medium leading-[20px] not-italic text-[14px]">Part B:</span>
                  <span className="leading-[22px] text-[15px]"> </span>
                  <span className="font-poppins leading-[20px] not-italic text-[#6d6d6d] text-[14px]">General terms applying to all use of the Navyaa Offering</span>
                </p>
                <p className="leading-[20px] relative shrink-0 text-[14px] w-full">
                  <span className="font-poppins font-medium">{`Part C: `}</span>
                  <span className="font-poppins text-[#6d6d6d]">Renter specific terms</span>
                </p>
                <p className="relative shrink-0 w-full">
                  <span className="font-poppins font-medium leading-[20px] not-italic text-[14px]">Part D:</span>
                  <span className="leading-[22px] text-[15px]"> </span>
                  <span className="font-poppins leading-[20px] not-italic text-[#6d6d6d] text-[14px]">Lender specific terms</span>
                </p>
                <p className="relative shrink-0 w-full">
                  <span className="font-poppins font-medium leading-[20px] not-italic text-[14px]">Part E:</span>
                  <span className="leading-[22px] text-[15px]"> </span>
                  <span className="font-poppins leading-[20px] not-italic text-[#6d6d6d] text-[14px]">Sale terms</span>
                </p>
                <p className="relative shrink-0 w-full">
                  <span className="font-poppins font-medium leading-[20px] not-italic text-[14px]">Part F:</span>
                  <span className="leading-[22px] text-[15px]"> </span>
                  <span className="font-poppins leading-[20px] not-italic text-[#6d6d6d] text-[14px]">General Legal Terms</span>
                </p>
              </div>
            </div>
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] w-full">
              Welcome to Navyaa. By accessing or using our services, you agree to the following Terms of Service. Please read them carefully. If you don't agree with these terms, you must refrain from using the platform.
            </p>
          </div>

          {/* Terms Sections */}
          <div className="content-stretch flex flex-col gap-[25px] items-start relative shrink-0 w-full">
            {/* Part A */}
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] text-center text-nowrap underline whitespace-pre">
                <span className="[text-underline-position:from-font] decoration-solid">{`Part A: `}</span>
                <span className="[text-underline-position:from-font] decoration-solid font-poppins">About Navyaa</span>
              </p>
              <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Navyaa is a B2B Textile Marketplace that allows Buyers to source fabrics and Suppliers to list their textile inventory for sale. Our platform streamlines global supply chains, offering a marketplace for high-quality textiles and materials.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Navyaa facilitates the sourcing and supply of textile materials. Buyers can select, purchase, and reorder fabric items, while Suppliers can list and manage their wholesale inventory.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Users are responsible for providing accurate information when signing up. Navyaa cannot be held liable for any inaccuracies or issues arising from incorrect user information.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Users must be at least 18 years old to use the platform. By using Navyaa, you represent and warrant that you meet this age requirement and are legally able to enter into a binding agreement.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Part B */}
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] text-center text-nowrap underline whitespace-pre">
                <span className="[text-underline-position:from-font] decoration-solid">{`Part B: `}</span>
                <span className="[text-underline-position:from-font] decoration-solid font-poppins">General terms applying to all use of the Navyaa Offering</span>
              </p>
              <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>To access Navyaa, you must create an account. You are responsible for maintaining the confidentiality of your login credentials and agree to notify us immediately if you suspect any unauthorized use of your account.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Navyaa aims to provide uninterrupted access to its platform. However, we do not guarantee that the platform will be available at all times, and we are not responsible for any temporary outages or disruptions in service.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>By renting or listing items on Navyaa, users agree to pay the applicable rental fees, service fees, and security deposits. Payments are processed via secure third-party payment processors (e.g., Stripe).</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>The content displayed on Navyaa, including images, logos, and design elements, is owned by Navyaa or our licensors. You are granted a limited license to use the platform but cannot reproduce or distribute any content without our express permission.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Part C */}
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] text-center text-nowrap underline whitespace-pre">
                <span className="[text-underline-position:from-font] decoration-solid">{`Part C: `}</span>
                <span className="[text-underline-position:from-font] decoration-solid font-poppins">Renter specific terms</span>
              </p>
              <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Renters are responsible for returning rented items within the agreed rental period. Late returns may incur additional fees, and the security deposit will be used to cover such costs if necessary.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Renters must ensure the items are returned in the same condition as received. Any damage or loss will result in deductions from the security deposit or additional charges as necessary.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Renters agree to pay the full rental price, including any additional service fees or cleaning fees at the time of booking. Payment is processed through the platform's secure payment gateway.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>{`Renters may cancel a rental booking according to the platform's cancellation policy. Cancellations made too close to the rental period may result in a partial refund or no refund, depending on the timing and circumstances.`}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Part D */}
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] text-center text-nowrap underline whitespace-pre">
                <span className="[text-underline-position:from-font] decoration-solid">{`Part D: `}</span>
                <span className="[text-underline-position:from-font] decoration-solid font-poppins">Lender specific terms</span>
              </p>
              <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>{`Lenders are responsible for listing only quality items that meet our platform's standards. Items must be clean, undamaged, and in wearable condition at the time of listing.`}</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Lenders will receive payment for their items once the rental period is complete, and the item has been returned in good condition. Payments will be made via Stripe and are subject to the platform's processing fees.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Lenders must ensure that the items listed on Navyaa are available and ready to be shipped once a booking is confirmed. Lenders are required to honor rental agreements and ship items on time.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>If a Borrower damages an item during the rental period, Lenders will be compensated through the security deposit paid by the Borrower. Lenders must inspect the items and report any damage immediately after the item is returned.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Part E */}
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] text-center text-nowrap underline whitespace-pre">
                <span className="[text-underline-position:from-font] decoration-solid">{`Part E: `}</span>
                <span className="[text-underline-position:from-font] decoration-solid font-poppins">Sale terms</span>
              </p>
              <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>If Lenders choose to sell their listed items on the platform, the sale price must be clearly indicated at the time of listing. Once an item is marked for sale, it will no longer be available for rent.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>All sales transactions will be processed through Navyaa's secure payment system. Lenders will receive the sale price minus the platform's service fee, and the item will be removed from the rental pool once the sale is complete.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>When an item is sold, ownership is transferred from the Lender to the Buyer. Navyaa is not responsible for post-sale issues such as item defects or disputes between the Buyer and Lender.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Refunds for sale items will only be issued under exceptional circumstances and must comply with Navyaa's refund policy. Once a sale transaction is confirmed, it is considered final.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Part F */}
            <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full pb-20">
              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] text-center text-nowrap underline whitespace-pre">
                <span className="[text-underline-position:from-font] decoration-solid">{`Part F: `}</span>
                <span className="[text-underline-position:from-font] decoration-solid font-poppins">General legal terms</span>
              </p>
              <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full pb-8">
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Navyaa is not responsible for any damages, losses, or liabilities that may arise from the use of the platform. We strive to ensure a safe and secure experience for both Lenders and Borrowers, but we cannot guarantee that issues will not arise.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Any disputes between Borrowers and Lenders must first be attempted to resolve through Navyaa's dispute resolution process. If unresolved, the dispute will be subject to arbitration in accordance with local laws.</span>
                  </li>
                </ul>
                <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                  <li className="leading-[16px]">
                    <span>Navyaa respects your privacy. Please refer to our Privacy Policy for information on how your data is collected, stored, and used.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

