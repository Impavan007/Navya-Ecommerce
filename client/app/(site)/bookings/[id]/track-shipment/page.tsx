"use client";

import Breadcrumb from "../../../components/Breadcrumb";
import ShipmentTrackingDetails from "../../../../components/common/ShipmentTrackingDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { bookingsApiService } from "../../../services/api/bookings";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function BookingTrackShipmentPage() {
  const params = useParams();
  const id = params?.id as string;
  const [trackingData, setTrackingData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch tracking info
        try {
          const resp = await bookingsApiService.getTrackingInfo(id);
          if (resp && (resp as any).success) {
            setTrackingData((resp as any).data);
          } else {
            throw new Error((resp as any)?.message || "Tracking failed");
          }
        } catch (err: any) {
          const errorMsg = err?.response?.data?.message || err?.message || "";
          if (errorMsg.includes("404") || errorMsg.includes("not found")) {
            setTrackingData(null);
          } else {
            toast.error(errorMsg || "Something went wrong fetching tracking");
          }
        }

        // Fetch booking info for address/item details
        try {
          const bResp = await bookingsApiService.getRenterBookingDetail(id);
          if (bResp && (bResp as any).success !== false) {
            setBookingData((bResp as any).data);
          }
        } catch (err) {
          console.error("Failed to load booking details for tracking view.", err);
        }

      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  return (
    <div className="bg-[#FAF6F3] min-h-screen pb-20 font-poppins">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My Orders", href: "/bookings" },
          { label: `Order #${id}`, href: `/bookings/${id}` },
          { label: "Track Shipment" }
        ]}
      />
      <div className="pt-8 px-4 lg:px-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <Loader2 className="animate-spin text-gray-500 w-12 h-12" />
          </div>
        ) : (
          <ShipmentTrackingDetails orderId={id} trackingData={trackingData} bookingData={bookingData} />
        )}
      </div>
    </div>
  );
}
