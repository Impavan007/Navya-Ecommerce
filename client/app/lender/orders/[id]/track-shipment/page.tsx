"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ShipmentTrackingDetails from "../../../../components/common/ShipmentTrackingDetails";
import axiosClient from "../../../LenderAPi/Axiosclient";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Breadcrumb from "../../../../(site)/components/Breadcrumb";

export default function LenderTrackShipmentPage() {
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
          const response = await axiosClient.get(`/lender/orders/${id}/tracking`);
          if (response.data?.success) {
            setTrackingData(response.data.data);
          } else {
            throw new Error(response.data?.message || "Tracking failed");
          }
        } catch (err: any) {
          const errorMsg = err?.response?.data?.message || err?.message || "";
          if (errorMsg.includes("404") || errorMsg.includes("not found")) {
            setTrackingData(null);
          } else {
            toast.error(errorMsg || "Something went wrong fetching tracking");
          }
        }

        // Fetch order info for address/item details
        try {
          const oResp = await axiosClient.get(`/lender/orders/${id}`);
          if (oResp.data?.success) {
            setBookingData(oResp.data.data);
          }
        } catch (err) {
          console.error("Failed to load order details for tracking view.", err);
        }

      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  return (
    <div className="bg-[#FAF6F3] min-h-screen pb-20 font-poppins">
      <div className="pt-6 px-4 lg:px-8 mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/lender" },
            { label: "Orders", href: "/lender/orders" },
            { label: `Order #${id}`, href: "/lender/orders" },
            { label: "Track Shipment" }
          ]}
        />
      </div>
      <div className="px-4 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <Loader2 className="animate-spin text-gray-500 w-12 h-12" />
          </div>
        ) : (
          <ShipmentTrackingDetails
            orderId={id}
            trackingData={trackingData}
            bookingData={bookingData}
            backUrl="/lender/orders"
            supportUrl="/lender/support"
          />
        )}
      </div>
    </div>
  );
}
