'use client';

import Breadcrumb from "../components/Breadcrumb";

export default function PrivacyPolicy() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full min-h-screen">
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
      </div>

      {/* Constrained Content Container */}
      <div className="content-stretch flex flex-col pt-10  gap-[40px] items-center relative shrink-0 w-full  mx-auto">
        {/* Header Section */}
        <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full">
          {/* Title Section */}
          <div className="box-border content-stretch flex flex-col gap-[20px] h-[49px] items-start px-[20px] lg:px-[40px] py-0 relative shrink-0 w-full">
            <p className="font-['Playfair_Display'] font-medium leading-[28px] relative shrink-0 text-[20px] text-black w-full">
              Privacy Policy
            </p>
            <div className="bg-black h-px shrink-0 w-full" />
          </div>
        </div>

        {/* Content Section */}
        <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full  mx-auto px-[20px] lg:px-[40px]">
          {/* Introduction */}
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] w-full">
              Welcome to our e-commerce platform. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases from us. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </div>

          {/* 2. Information We Collect */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              1. Information We Collect
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[14px] w-full">
                Personal Information
              </p>
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Name and contact details (email address, phone number, shipping address)</span></li>
                <li className="leading-[16px]"><span>Account information (username, password, profile data)</span></li>
                <li className="leading-[16px]"><span>Payment information (credit card details, billing address)</span></li>
                <li className="leading-[16px]"><span>Order history and purchase records</span></li>
                <li className="leading-[16px]"><span>Communication preferences</span></li>
              </ul>

              <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[14px] w-full mt-4">
                Technical Information
              </p>
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>IP address and browser type</span></li>
                <li className="leading-[16px]"><span>Device information and operating system</span></li>
                <li className="leading-[16px]"><span>Cookies and tracking technologies data</span></li>
                <li className="leading-[16px]"><span>Website usage statistics and analytics</span></li>
              </ul>
            </div>
          </div>

          {/* 3. How We Use Your Information */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              2. How We Use Your Information
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Process your orders and manage your account</span></li>
                <li className="leading-[16px]"><span>Provide customer support and respond to inquiries</span></li>
                <li className="leading-[16px]"><span>Send order confirmations and shipping notifications</span></li>
                <li className="leading-[16px]"><span>Personalize your shopping experience</span></li>
                <li className="leading-[16px]"><span>Send marketing communications (with your consent)</span></li>
                <li className="leading-[16px]"><span>Improve our website and services</span></li>
                <li className="leading-[16px]"><span>Prevent fraud and enhance security</span></li>
                <li className="leading-[16px]"><span>Comply with legal obligations</span></li>
              </ul>
            </div>
          </div>

          {/* 4. Data Sharing and Disclosure */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              3. Data Sharing and Disclosure
            </p>
            <p className="font-poppins leading-[22px] not-italic relative shrink-0 text-[#6d6d6d] text-[12px] w-full">
              We may share your information with third parties only in the following circumstances:
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Service providers (payment processors, shipping carriers)</span></li>
                <li className="leading-[16px]"><span>Legal requirements and law enforcement</span></li>
                <li className="leading-[16px]"><span>Business transfers (mergers, acquisitions)</span></li>
                <li className="leading-[16px]"><span>With your explicit consent</span></li>
              </ul>
            </div>
          </div>

          {/* 5. Cookies and Tracking Technologies */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              4. Cookies and Tracking Technologies
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                <span>We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.</span>
              </p>
              <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                <span>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.</span>
              </p>
            </div>
          </div>

          {/* 6. Data Security */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              5. Data Security
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                <span>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</span>
              </p>
            </div>
          </div>

          {/* 7. Your Rights */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              6. Your Rights
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <ul className="block relative shrink-0 text-[12px] w-full list-disc pl-[18px]">
                <li className="leading-[16px]"><span>Access and receive a copy of your personal data</span></li>
                <li className="leading-[16px]"><span>Rectify inaccurate or incomplete information</span></li>
                <li className="leading-[16px]"><span>Request deletion of your personal data</span></li>
                <li className="leading-[16px]"><span>Restrict or object to processing of your data</span></li>
                <li className="leading-[16px]"><span>Data portability rights</span></li>
                <li className="leading-[16px]"><span>Withdraw consent at any time</span></li>
              </ul>
            </div>
          </div>

          {/* 8. Data Retention */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              7. Data Retention
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                <span>We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.</span>
              </p>
            </div>
          </div>

          {/* 9. Children's Privacy */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              8. Children's Privacy
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                <span>Our service does not address anyone under the age of 16. We do not knowingly collect personally identifiable information from children under 16. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.</span>
              </p>
            </div>
          </div>

          {/* 10. Changes to This Privacy Policy */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              9. Changes to This Privacy Policy
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full">
              <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                <span>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</span>
              </p>
            </div>
          </div>

          {/* 11. Contact Us */}
          <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full pb-20">
            <p className="font-poppins font-medium leading-[22px] not-italic relative shrink-0 text-[#3D1126] text-[15px] underline">
              10. Contact Us
            </p>
            <div className="content-stretch flex flex-col font-poppins gap-[12px] items-start leading-[0] not-italic relative shrink-0 text-[#6d6d6d] w-full pb-8">
              <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                <span>If you have any questions about this Privacy Policy, please contact us:</span>
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                  <span className="font-medium text-[#3D1126]">Email:</span> <span>privacy@navyaa.eu.com</span>
                </p>
                <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                  <span className="font-medium text-[#3D1126]">Phone:</span> <span>+1 (555) 123-4567</span>
                </p>
                <p className="leading-[16px] relative shrink-0 text-[12px] w-full">
                  <span className="font-medium text-[#3D1126]">Address:</span> <span>123 Commerce Street, Business City, BC 12345</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}