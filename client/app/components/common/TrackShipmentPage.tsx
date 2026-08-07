"use client";

import Breadcrumb from "../../(site)/components/Breadcrumb";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TrackShipmentContent() {
  const searchParams = useSearchParams();
  const initialTracking = searchParams.get("tracking") || "";

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-[40px] py-10 w-full">
      <h1 className="text-2xl font-bold font-poppins text-[#3D1126] mb-6">Track Shipment</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#e5e5e5]">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              defaultValue={initialTracking}
              placeholder="Enter your tracking number"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-black"
            />
            <button className="bg-[#111827] text-white px-8 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Track
            </button>
          </div>
        </div>

        <div className="mt-8 text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p>Please enter a tracking number to view real-time shipment updates</p>
        </div>
      </div>
    </div>
  );
}

export default function TrackShipmentPage() {
  return (
    <div className="bg-[#FAF6F3] min-h-screen">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My Bookings", href: "/bookings" },
          // { label: "Booking", href: `/bookings/${id}` },
          { label: "Track Shipment" }
        ]}
      />
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <TrackShipmentContent />
      </Suspense>
    </div>
  );
}
