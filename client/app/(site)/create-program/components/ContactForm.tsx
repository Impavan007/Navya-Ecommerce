import React from "react";
import { FooterIcons1 } from "../../icons/icons";

const ContactForm = () => {
  return (
    <section className="w-full bg-[#F3D6DC] py-24 px-[20px] md:px-[60px] lg:px-[100px]">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        <div className="text-center mb-12 max-w-[700px]">
          <h2 className="font-canela text-[40px] md:text-[56px] text-[#3D1126] mb-4 font-medium">
            Press & Media Enquiries
          </h2>
          <p className="font-poppins text-[#3D1126] text-lg">
            Get in touch with our media team for interview requests and brand inquiries.
          </p>
          <a href="mailto:press@navyaa.com" className="font-poppins font-semibold text-xl text-[#3D1126] underline underline-offset-4 mt-4 block leading-tight">
            press@navyaa.com
          </a>
        </div>

        <div className="w-full max-w-[800px] bg-[#FAF6F3] p-8 md:p-16 rounded-[4px] shadow-sm">
          <form className="space-y-10">
            <h3 className="font-poppins font-bold text-xl text-center text-[#3D1126] mb-8">
              Contact Media Team
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="relative">
                <label className="block font-poppins text-[10px] text-[#6D6D6D] font-bold uppercase tracking-widest mb-2">FULL NAME / NAME</label>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  className="w-full border-b border-[#3D1126]/20 py-3 bg-transparent font-poppins text-base outline-none focus:border-[#3D1126] transition-colors"
                />
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-poppins text-[10px] text-[#6D6D6D] font-bold uppercase tracking-widest">ENTER YOUR EMAIL</label>
                  <FooterIcons1 className="w-4 h-4 opacity-50" />
                </div>
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  className="w-full border-b border-[#3D1126]/20 py-3 bg-transparent font-poppins text-base outline-none focus:border-[#3D1126] transition-colors"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-poppins text-[10px] text-[#6D6D6D] font-bold uppercase tracking-widest">PUBLICATION / AGENCY</label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D6D6D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Where do you work?"
                className="w-full border-b border-[#3D1126]/20 py-3 bg-transparent font-poppins text-base outline-none focus:border-[#3D1126] transition-colors"
              />
            </div>

            <div className="relative">
              <label className="block font-poppins text-[10px] text-[#6D6D6D] font-bold uppercase tracking-widest mb-2">MESSAGE</label>
              <textarea 
                rows={1}
                placeholder="How can we help?"
                className="w-full border-b border-[#3D1126]/20 py-3 bg-transparent font-poppins text-base outline-none focus:border-[#3D1126] transition-colors resize-none"
              ></textarea>
            </div>

            <div className="flex justify-center pt-6">
              <button 
                type="submit"
                className="bg-[#1A1A1A] text-white px-16 py-4 rounded-[4px] font-poppins text-sm font-bold tracking-widest hover:bg-black transition-all w-full md:w-auto uppercase"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
