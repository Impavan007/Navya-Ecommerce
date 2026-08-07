import React from "react";

const QuoteSection = () => {
  return (
    <section className="w-full bg-[#F3D6DC] py-20 px-[20px] md:px-[60px] lg:px-[100px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="bg-white p-12 md:p-20 rounded-[4px] relative max-w-[1000px] mx-auto">
          {/* Quote Mark */}
          <div className="mb-8 text-[#3D1126]">
            <svg width="48" height="36" viewBox="0 0 48 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37258 0 0 5.37258 0 12V36H18V18H9C9 13.0294 13.0294 9 18 9V0H12ZM42 18H33C33 13.0294 37.0294 9 42 9V0H36C29.3726 0 24 5.37258 24 12V36H42V18Z" fill="#3D1126" fillOpacity="0.1" />
            </svg>
          </div>

          <blockquote className="mb-8">
            <p className="font-canela text-[32px] md:text-[44px] leading-[1.3] text-[#3D1126]">
              Navyaa is redefining access to designer wardrobes through a community-driven fashion model that prioritizes sustainability, accessibility, and style.
            </p>
          </blockquote>

          <cite className="font-poppins text-[#6D6D6D] text-lg not-italic">
            — David Mitchell, Designer
          </cite>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;
