"use client";

import { useState } from "react";

export default function FilterCalendar() {
  const [currentMonth, setCurrentMonth] = useState("October 2025");

  const prevMonth = () => {
    // Navigation logic
  };

  const nextMonth = () => {
    // Navigation logic
  };

  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Calendar">
      <div className="[grid-area:1_/_1] bg-[#f1f1f1] h-[310.969px] ml-0 mt-0 w-[333px]" />
      
      {/* Calendar Header */}
      <div className="[grid-area:1_/_1] bg-[#f1f1f1] box-border content-stretch flex h-[16.145px] items-center justify-between ml-[28.809px] mt-[23.725px] relative w-[258.859px]">
        <button onClick={prevMonth} className="flex items-center justify-center relative shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
          <div className="flex-none rotate-[180deg] scale-y-[-100%]">
            <div className="h-[8.881px] relative w-[4.123px]">
              <div className="absolute inset-[-7.14%_-20.99%_-7.14%_-15.38%]">
                <svg className="block max-w-none size-full" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5.5L1 10" stroke="rgba(44, 41, 48, 1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </button>
        
        <p className="capitalize font-poppins font-bold leading-[15.224px] not-italic relative shrink-0 text-[10.15px] text-black text-nowrap whitespace-pre m-0">
          {currentMonth}
        </p>
        
        <button onClick={nextMonth} className="h-[8.881px] relative shrink-0 w-[4.123px] cursor-pointer hover:opacity-70 transition-opacity">
          <div className="absolute inset-[-7.14%_-20.99%_-7.14%_-15.38%]">
            <svg className="block max-w-none size-full" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5.5L1 10" stroke="rgba(44, 41, 48, 1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      </div>

      {/* Day Headers */}
      <div className="[grid-area:1_/_1] flex flex-col font-poppins h-[13.557px] justify-center ml-[48.48px] mt-[70.328px] not-italic relative text-[#3D1126] text-[7.612px] text-center -translate-x-1/2 -translate-y-1/2 w-[22.03px]">
        <p className="leading-[10.15px] m-0">Mon</p>
      </div>
      <div className="[grid-area:1_/_1] flex flex-col font-poppins h-[13.557px] justify-center ml-[87.821px] mt-[70.328px] not-italic relative text-[#3D1126] text-[7.612px] text-center -translate-x-1/2 -translate-y-1/2 w-[18.641px]">
        <p className="leading-[10.15px] m-0">Tue</p>
      </div>
      <div className="[grid-area:1_/_1] flex flex-col font-poppins h-[13.557px] justify-center ml-[127.16px] mt-[70.328px] not-italic relative text-[#3D1126] text-[7.612px] text-center -translate-x-1/2 -translate-y-1/2 w-[23.725px]">
        <p className="leading-[10.15px] m-0">Wed</p>
      </div>
      <div className="[grid-area:1_/_1] flex flex-col font-poppins h-[13.557px] justify-center ml-[166.5px] mt-[70.328px] not-italic relative text-[#3D1126] text-[7.612px] text-center -translate-x-1/2 -translate-y-1/2 w-[18.641px]">
        <p className="leading-[10.15px] m-0">Thu</p>
      </div>
      <div className="[grid-area:1_/_1] flex flex-col font-poppins h-[13.557px] justify-center ml-[205.841px] mt-[70.328px] not-italic relative text-[#3D1126] text-[7.612px] text-center -translate-x-1/2 -translate-y-1/2 w-[11.863px]">
        <p className="leading-[10.15px] m-0">Fri</p>
      </div>
      <div className="[grid-area:1_/_1] flex flex-col font-poppins h-[13.557px] justify-center ml-[245.181px] mt-[70.328px] not-italic relative text-[#3D1126] text-[7.612px] text-center -translate-x-1/2 -translate-y-1/2 w-[16.947px]">
        <p className="leading-[10.15px] m-0">Sat</p>
      </div>
      <div className="[grid-area:1_/_1] flex flex-col font-poppins h-[13.557px] justify-center ml-[284.944px] mt-[70.328px] not-italic relative text-[#3D1126] text-[7.612px] text-center -translate-x-1/2 -translate-y-1/2 w-[19.489px]">
        <p className="leading-[10.15px] m-0">Sun</p>
      </div>

      {/* Calendar Grid */}
      <div className="[grid-area:1_/_1] bg-[#f1f1f1] box-border grid grid-cols-[repeat(7,_minmax(0px,_1fr))] grid-rows-[repeat(6,_minmax(0px,_1fr))] h-[194.644px] ml-[28.809px] mt-[96.838px] relative w-[275.382px]">
        {/* Row 1 */}
        <div className="[grid-area:1_/_1] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#d5d5d5] text-[10.15px] text-center">
          <p className="leading-[15.224px] m-0">28</p>
        </div>
        <div className="[grid-area:1_/_2] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#d5d5d5] text-[10.15px] text-center">
          <p className="leading-[15.224px] m-0">29</p>
        </div>
        <div className="[grid-area:1_/_3] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#d5d5d5] text-[10.15px] text-center">
          <p className="leading-[15.224px] m-0">30</p>
        </div>
        <div className="[grid-area:1_/_4] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#d5d5d5] text-[10.15px] text-center">
          <p className="leading-[15.224px] m-0">31</p>
        </div>
        <div className="[grid-area:1_/_5] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">1</p>
        </div>
        <div className="[grid-area:1_/_6] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">2</p>
        </div>
        <div className="[grid-area:1_/_7] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">3</p>
        </div>

        {/* Row 2 */}
        <div className="[grid-area:2_/_1] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">4</p>
        </div>
        <div className="[grid-area:2_/_2] bg-[#1A1A1A] box-border content-stretch flex gap-[6.343px] items-center justify-center p-[6.343px] relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="capitalize flex flex-col font-poppins font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[10.15px] text-center text-nowrap">
            <p className="leading-[15.224px] whitespace-pre m-0">5</p>
          </div>
        </div>
        <div className="[grid-area:2_/_3] bg-[#bebdbf] box-border content-stretch flex gap-[6.343px] items-center justify-center p-[6.343px] relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="capitalize flex flex-col font-poppins font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center text-nowrap">
            <p className="leading-[15.224px] whitespace-pre m-0">6</p>
          </div>
        </div>
        <div className="[grid-area:2_/_4] bg-[#bebdbf] box-border content-stretch flex gap-[6.343px] items-center justify-center p-[6.343px] relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="capitalize flex flex-col font-poppins font-medium justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center text-nowrap">
            <p className="leading-[15.224px] whitespace-pre m-0">7</p>
          </div>
        </div>
        <div className="[grid-area:2_/_5] bg-[#1A1A1A] box-border content-stretch flex gap-[6.343px] items-center justify-center p-[6.343px] relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="capitalize flex flex-col font-poppins font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#f1f1f1] text-[10.15px] text-center text-nowrap">
            <p className="leading-[15.224px] whitespace-pre m-0">8</p>
          </div>
        </div>
        <div className="[grid-area:2_/_6] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">9</p>
        </div>
        <div className="[grid-area:2_/_7] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">10</p>
        </div>

        {/* Row 3 */}
        <div className="[grid-area:3_/_1] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">11</p>
        </div>
        <div className="[grid-area:3_/_2] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">12</p>
        </div>
        <div className="[grid-area:3_/_3] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">13</p>
        </div>
        <div className="[grid-area:3_/_4] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">14</p>
        </div>
        <div className="[grid-area:3_/_5] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">15</p>
        </div>
        <div className="[grid-area:3_/_6] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">16</p>
        </div>
        <div className="[grid-area:3_/_7] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">17</p>
        </div>

        {/* Row 4 */}
        <div className="[grid-area:4_/_1] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">18</p>
        </div>
        <div className="[grid-area:4_/_2] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">19</p>
        </div>
        <div className="[grid-area:4_/_3] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">20</p>
        </div>
        <div className="[grid-area:4_/_4] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">21</p>
        </div>
        <div className="[grid-area:4_/_5] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">22</p>
        </div>
        <div className="[grid-area:4_/_6] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">23</p>
        </div>
        <div className="[grid-area:4_/_7] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[#8a8a8a] text-[10.15px] text-center">
          <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[15.224px] line-through m-0">24</p>
        </div>

        {/* Row 5 */}
        <div className="[grid-area:5_/_1] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">25</p>
        </div>
        <div className="[grid-area:5_/_2] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">26</p>
        </div>
        <div className="[grid-area:5_/_3] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">27</p>
        </div>
        <div className="[grid-area:5_/_4] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">28</p>
        </div>
        <div className="[grid-area:5_/_5] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">29</p>
        </div>
        <div className="[grid-area:5_/_6] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">30</p>
        </div>
        <div className="[grid-area:5_/_7] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-black text-center cursor-pointer hover:opacity-80 transition-opacity">
          <p className="leading-[15.224px] m-0">31</p>
        </div>

        {/* Row 6 - Next Month */}
        <div className="[grid-area:6_/_1] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-[grey] text-center">
          <p className="leading-[15.224px] m-0">1</p>
        </div>
        <div className="[grid-area:6_/_2] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-[grey] text-center">
          <p className="leading-[15.224px] m-0">2</p>
        </div>
        <div className="[grid-area:6_/_3] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-[grey] text-center">
          <p className="leading-[15.224px] m-0">3</p>
        </div>
        <div className="[grid-area:6_/_4] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-[grey] text-center">
          <p className="leading-[15.224px] m-0">4</p>
        </div>
        <div className="[grid-area:6_/_5] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-[grey] text-center">
          <p className="leading-[15.224px] m-0">5</p>
        </div>
        <div className="[grid-area:6_/_6] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-[grey] text-center">
          <p className="leading-[15.224px] m-0">6</p>
        </div>
        <div className="[grid-area:6_/_7] flex flex-col font-poppins justify-center leading-[0] not-italic relative shrink-0 text-[10.15px] text-[grey] text-center">
          <p className="leading-[15.224px] m-0">7</p>
        </div>
      </div>
    </div>
  );
}

