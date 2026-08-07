"use client";

import {
  FileText, Package, Truck, Target, CheckCircle2,
  Clock, MapPin, Search, Calendar, ArrowLeft, HeadphonesIcon, RefreshCcw, Eye
} from "lucide-react";
import Link from "next/link";
import React from "react";
import Image from "next/image";

interface ShipmentTrackingDetailsProps {
  orderId?: string;
  trackingNumber?: string;
  trackingData?: any;
  bookingData?: any;
  backUrl?: string;
  supportUrl?: string;
}

export default function ShipmentTrackingDetails({
  orderId = "OD43848583939292020",
  trackingNumber = "3SNPWS819079128",
  trackingData = null,
  bookingData = null,
  backUrl,
  supportUrl
}: ShipmentTrackingDetailsProps) {
  const barcodeWidths = [4, 2, 6, 3, 2, 4, 2, 5, 3, 6, 2, 4, 3, 2, 5, 6, 2, 4, 2, 5, 3, 4, 2, 6, 3, 2, 4, 5, 2, 6, 3, 2, 4, 2, 5, 3, 6, 2, 4];

  // Restoring your exact requested local testing framework overrides so it visually renders in your local browser when real orders missing
  const fallbackEvents = [
    {
      "occurred_at": "2026-03-19T04:15:00Z",
      "description": "Shipment expected, but not yet arrived or processed at PostNL",
      "event_code": "M02",
      "status": "UN",
      "status_description": "Unknown",
      "carrier_status_code": "M02",
      "carrier_status_description": "Shipment expected, but not yet arrived or processed at PostNL",
      "location": null,
      "city": null,
      "state": null,
      "postal_code": null,
      "country": null,
      "coordinates": null,
      "signer": null
    },
    {
      "occurred_at": "2026-03-18T08:40:11.768Z",
      "description": "Shipment expected, but not yet arrived or processed at PostNL",
      "event_code": "A01",
      "status": "IT",
      "status_description": "In Transit",
      "carrier_status_code": "A01",
      "carrier_status_description": "Shipment expected, but not yet arrived or processed at PostNL",
      "location": null,
      "city": null,
      "state": null,
      "postal_code": null,
      "country": null,
      "coordinates": null,
      "signer": null
    }
  ];

  const displayEvents = trackingData?.events && trackingData.events.length > 0
    ? trackingData.events
    : fallbackEvents;

  const tNumber = trackingData?.outbound_tracking_number || trackingNumber;

  // Use "postnl_walleted" as the fallback raw carrier if no trackingData is present
  const rawCarrier = trackingData?.outbound_carrier || "postnl_walleted";
  const carrier = rawCarrier.toLowerCase().includes("postnl") ? "PostNL" : rawCarrier;

  // Using fallback URL for local testing visibility since API tracking data is occasionally missing.
  const labelUrl = trackingData?.outbound_label_url || "https://api.eu.shipengine.com/v1/downloads/14/66OjP4QCWkuu7YNKYdeOmw/label-126843226.pdf";
  const labelPngUrl = trackingData?.outbound_label_png_url || "https://api.eu.shipengine.com/v1/downloads/14/66OjP4QCWkuu7YNKYdeOmw/label-126843226.png";

  const currentStatus = trackingData?.current_status || "unknown";

  // Try to find specific events
  const findDate = (codes: string[]) => {
    if (!trackingData?.events) return null;
    const ev = trackingData.events.find((e: any) => codes.includes(e.carrier_status_code) || codes.includes(e.status));
    return ev?.occurred_at ? new Date(ev.occurred_at) : null;
  };

  const shipDate = trackingData?.ship_date ? new Date(trackingData.ship_date) : null;
  const deliveryDate = trackingData?.actual_delivery_date || trackingData?.estimated_delivery_date
    ? new Date(trackingData.actual_delivery_date || trackingData.estimated_delivery_date)
    : null;

  // Derive step completions
  const isLabelCreated = Boolean(trackingData?.outbound_tracking_number || trackingData?.ship_date);
  const isPickedUp = currentStatus === "in_transit" || currentStatus === "out_for_delivery" || currentStatus === "delivered" || currentStatus === "picked_up";
  const isInTransit = currentStatus === "in_transit" || currentStatus === "out_for_delivery" || currentStatus === "delivered";
  const isOutForDelivery = currentStatus === "out_for_delivery" || currentStatus === "delivered";
  const isDelivered = currentStatus === "delivered";

  const getStatusText = () => {
    switch (currentStatus) {
      case "delivered": return "Delivered";
      case "out_for_delivery": return "Out for Delivery";
      case "in_transit": return "In Transit";
      case "picked_up": return "Picked Up";
      case "unknown":
      default: return isLabelCreated ? "Label Created" : "Processing";
    }
  };

  const getStatusDesc = () => {
    return trackingData?.carrier_status_description || trackingData?.status_description || "Your item is on its way — registered and heading to the facility.";
  };

  const formatDate = (d: Date | null) => {
    if (!d) return null;
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d: Date | null) => {
    if (!d) return null;
    return d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const lastUpdated = trackingData?.last_status_update ? new Date(trackingData.last_status_update) : new Date();

  const deliverTo = bookingData?.deliveryDetails?.deliverTo || "N/A";

  // Format address nicely
  const addrObj = bookingData?.deliveryDetails?.address;
  let formattedAddress = "N/A";
  if (typeof addrObj === 'string') {
    formattedAddress = addrObj;
  } else if (addrObj) {
    const street = addrObj.street_name ? `${addrObj.street_name} ${addrObj.house_number || ''}`.trim() : addrObj.street;
    formattedAddress = `${street || ''}, ${addrObj.city || ''}`.replace(/^, /, '');
  }

  const productName = bookingData?.productName || "Product Name N/A";
  const rentalDetails = `Size ${bookingData?.size || 'N/A'} · ${bookingData?.rentalPeriod || 'N/A'}`;

  return (
    <div className="w-full font-poppins max-w-[1360px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-['Canela'] font-bold text-[40px] md:text-[48px] leading-[48px] md:leading-[58px] text-[#3D1126]">
          Track Shipment
        </h1>
        <p className="text-[16px] leading-[24px] text-[#3D1126] mt-2">
          Your item is on its way — everything is under control.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-[24px]">

        {/* Left Column - 981px */}
        <div className="flex-1 lg:max-w-[981.34px] flex flex-col gap-[20px]">

          {/* Shipment Journey Section */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_16px_rgba(180,130,150,0.08)] px-[28px] py-[28px]">
            <div className="flex justify-between items-center border-b border-transparent pb-7">
              <h2 className="font-inter text-[24px] md:text-[30px] leading-[36px] text-[#111827]">
                Shipment Journey
              </h2>
              <div className="bg-[#FFF6E8] border border-[#F5D9A8] rounded-full px-3 py-[7px] flex items-center gap-1.5 h-[30px]">
                <div className="w-1.5 h-1.5 bg-[#E8983A] rounded-full"></div>
                <span className="text-[12px] leading-[16px] text-[#C17D30]">In Progress</span>
              </div>
            </div>

            <div className="flex flex-col">
              {displayEvents && displayEvents.length > 0 ? (
                [...displayEvents]
                  .sort((a: any, b: any) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
                  .map((event: any, index: number, arr: any[]) => {
                    const isLast = index === arr.length - 1;
                    const status = event.status;

                    let IconComponent = FileText;
                    let iconColor = "#52B788";
                    let bgClass = "bg-[#E6F4EF]";
                    let borderClass = "border-[#52B788]";
                    let title = event.status_description || event.carrier_status_description || "Tracking Update";

                    if (status === "UN" || status === "NY") {
                      IconComponent = FileText;
                    } else if (status === "AC") {
                      IconComponent = Package;
                    } else if (status === "IT") {
                      IconComponent = Truck;
                    } else if (status === "OF") {
                      IconComponent = Target;
                    } else if (status === "DE") {
                      IconComponent = CheckCircle2;
                    } else if (status === "EX") {
                      IconComponent = RefreshCcw;
                      iconColor = "#E07040";
                      bgClass = "bg-[#FEF5F0]";
                      borderClass = "border-[#E07040]";
                    }

                    if (isLast && status !== "DE" && status !== "EX") {
                      iconColor = "#3D1126";
                      bgClass = "bg-[#F3D6DC]";
                      borderClass = "border-[#3D1126] ring-[4px] ring-[#F3D6DC]";
                    }

                    return (
                      <div key={index} className="flex gap-[16px] md:gap-[20px] min-h-[98px]">
                        <div className="flex flex-col items-center w-[44px]">
                          <div className={`w-[44px] h-[44px] rounded-full ${bgClass} border-[2px] ${borderClass} flex items-center justify-center shrink-0 z-10`}>
                            <IconComponent size={16} color={iconColor} />
                          </div>
                          {!isLast && <div className="w-[2px] h-full mt-1 bg-gradient-to-b from-[#B7E5CD] to-[#D5EDE0]"></div>}
                        </div>
                        <div className="flex flex-col pb-7 w-full pt-[10px]">
                          <div className="flex items-center gap-[10px] mb-1 flex-wrap">
                            <span className="font-semibold text-[14px] leading-[20px] text-[#1A1A1A] font-poppins capitalize">{title}</span>
                            {isLast ? (
                              <span className="bg-[#F3D6DC] border border-[#F3D6DC] rounded-full px-[11px] py-[3px] text-[12px] font-medium text-[#3D1126] h-[22px] flex items-center tracking-wide font-poppins">Now</span>
                            ) : (
                              <span className="bg-[#E6F4EF] border border-[#B7E5CD] rounded-full px-[11px] py-[3px] text-[12px] font-medium text-[#3D9E6E] h-[22px] flex items-center tracking-wide font-poppins">Done</span>
                            )}
                          </div>
                          <p className="text-[14px] leading-[23px] text-[#777777] mb-1.5 mt-0.5 font-poppins">
                            {event.carrier_status_description || event.description}
                          </p>
                          <div className="flex items-center gap-[4px] text-[12px] text-[#AAAAAA] flex-wrap font-poppins">
                            <Clock size={12} color="#AAAAAA" className="mr-1" />
                            <span>{event.occurred_at ? formatDate(new Date(event.occurred_at)) : "Pending"}</span>
                            <span className="mx-1">·</span>
                            <span>{event.occurred_at ? formatTime(new Date(event.occurred_at)) : ""}</span>
                            {(event.city || event.location) && (
                              <>
                                <span className="mx-1">·</span>
                                <MapPin size={12} color="#AAAAAA" className="mr-1" />
                                <span>{[event.location, event.city, event.country].filter(Boolean).join(", ")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="flex justify-center flex-col items-center py-12 opacity-50">
                  <Package size={40} className="mb-4 text-[#AAAAAA]" />
                  <p className="text-[15px] font-poppins text-[#777777]">Waiting for tracking updates from carrier...</p>
                </div>
              )}

            </div>

            {/* Last updated */}
            <div className="border-t border-[#F0F0F0] mt-[24px] pt-[21px] flex items-center gap-2">
              <Clock size={12} color="#BBBBBB" />
              <span className="text-[12px] text-[#BBBBBB]">Last updated: {formatDate(lastUpdated)} {formatTime(lastUpdated)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-[12px] h-auto sm:h-[50px] w-[733.33px] max-w-full">
            <Link href={backUrl || `/bookings/${orderId}`} className="bg-[#1F1F1F] text-white flex-1 rounded-[16px] flex items-center justify-center font-medium text-[14px] gap-[10px] hover:bg-black transition-colors shadow-sm py-[14px] sm:py-0">
              <ArrowLeft size={16} color="#FFFFFF" /> Back to Order
            </Link>
            <Link href={supportUrl || "/support"} className="bg-white/60 backdrop-blur-sm border border-[#E8DDE0] text-[#555555] flex-1 rounded-[16px] flex items-center justify-center font-medium text-[14px] gap-[10px] hover:bg-white transition-colors shadow-sm py-[14px] sm:py-0">
              <HeadphonesIcon size={16} color="#555555" /> Contact Support
            </Link>
          </div>

        </div>

        {/* Right Column - 355px */}
        <div className="w-full lg:w-[354.66px] flex flex-col gap-[20px]">

          {/* Current Status Card */}
          <div className="bg-[#F3D6DC] border border-[#F3D6DC] rounded-[12px] p-[20px] flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#F3D6DC] flex items-center justify-center">
                  <Package size={16} color="#3D1126" />
                </div>
                <span className="font-medium text-[13px] text-[#3D1126]">Current Status</span>
              </div>
              <h2 className="font-['Canela'] font-medium text-[32px] leading-[48px] text-[#1A1A1A] mb-2">{getStatusText()}</h2>
              <p className="text-[14px] leading-[21px] text-[#3D1126]">
                {getStatusDesc()}
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-[14px] flex gap-[10px] items-start mt-4">
              <MapPin size={14} color="#3D1126" className="mt-0.5 shrink-0" />
              <span className="text-[12px] leading-[20px] text-[#6D6D6D]">
                {trackingData?.current_location
                  ? `Last at ${trackingData.current_location}, ${trackingData.current_city || ''}`
                  : "Location will be updated once scanned at sorting facility"}
              </span>
            </div>
          </div>

          {/* Tracking Info Card */}
          <div className="bg-[#F3D6DC] border border-[#F3D6DC] rounded-[12px] p-[20px]">
            <h3 className="font-inter text-[20px] leading-[28px] text-[#111827] mb-[20px]">Tracking Info</h3>
            <div className="flex flex-col gap-[0]">
              <div className="pb-[16px] mb-[16px] border-b border-[#F3D6DC] flex flex-col gap-[4px]">
                <p className="text-[12px] font-medium tracking-[1.2px] text-[#C0A0A8]  m-0 leading-[16px] font-poppins">Order ID</p>
                <p className="font-mono text-[14px] text-[#1F2937] m-0 leading-[20px]">{orderId || trackingData?.order}</p>
              </div>
              <div className="pb-[16px] mb-[16px] border-b border-[#F3D6DC] flex flex-col gap-[4px]">
                <p className="text-[12px] font-medium tracking-[1.2px] text-[#C0A0A8]  m-0 leading-[16px] font-poppins">Tracking Number</p>
                <p className="font-mono text-[14px] text-[#1F2937] break-all m-0 leading-[20px]">{tNumber}</p>
              </div>
              <div className="flex flex-col gap-[4px] border-none">
                <p className="text-[12px] font-medium tracking-[1.2px] text-[#C0A0A8]  m-0 leading-[16px] font-poppins">Carrier</p>
                <div className="flex items-center gap-[10px]">
                  <div className="w-[28px] h-[28px] rounded-[8px] bg-[#FF6200] flex items-center justify-center">
                    <Truck size={12} color="#FFFFFF" strokeWidth={3} />
                  </div>
                  <span className="font-semibold text-[14px] text-[#1F2937] font-poppins ">{carrier}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Details Card */}
          <div className="bg-[#F3D6DC] border border-[#F3D6DC] rounded-[12px] p-[20px]">
            <h3 className="font-inter text-[20px] leading-[28px] text-[#111827] mb-[20px]">Delivery Details</h3>
            <div className="flex flex-col gap-[0]">

              {/* Est Delivery */}
              <div className="flex gap-[12px] pb-[16px] mb-[16px] border-b border-[#F3D6DC]">
                <div className="w-[32px] h-[32px] rounded-[12px] bg-[#F0F9F5] flex items-center justify-center shrink-0">
                  <Calendar size={15} color="#52B788" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[12px] font-medium text-[#C0A0A8] mb-[4px] leading-[16px ] font-poppins">Est. Delivery</p>
                  {deliveryDate ? (
                    <p className="text-[14px] font-semibold text-[#1F2937] m-0 leading-[20px] font-poppins">{formatDate(deliveryDate)}</p>
                  ) : (
                    <p className="text-[14px] italic text-[#6D6D6D] m-0 leading-[20px] font-poppins">Will be updated shortly</p>
                  )}
                </div>
              </div>

              {/* Deliver To */}
              <div className="flex gap-[12px] pb-[16px] mb-[16px] border-b border-[#F3D6DC]">
                <div className="w-[32px] h-[32px] rounded-[12px] bg-[#F5F0F6] flex items-center justify-center shrink-0">
                  <MapPin size={15} color="#9B7DB3" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[12px] font-medium text-[#C0A0A8] mb-[4px] leading-[16px]">Deliver To</p>
                  <p className="text-[14px] font-semibold text-[#1F2937] m-0 leading-[20px]">{deliverTo}</p>
                  <p className="text-[12px] text-[#9CA3AF] capitalize m-0 leading-[16px] mt-[2px]">{formattedAddress}</p>
                </div>
              </div>

              {/* Item */}
              <div className="flex gap-[12px] pb-[16px] mb-[16px] border-b border-[#F3D6DC]">
                <div className="w-[32px] h-[32px] rounded-[12px] bg-[#FEF5F0] flex items-center justify-center shrink-0">
                  <Package size={15} color="#E07040" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[12px] font-medium text-[#C0A0A8] mb-[4px] leading-[16px]">Item</p>
                  <p className="text-[14px] font-semibold text-[#1F2937] break-words line-clamp-2 m-0 leading-[20px]">{productName}</p>
                  <p className="text-[12px] text-[#9CA3AF] m-0 leading-[16px] mt-[2px]">{rentalDetails}</p>
                </div>
              </div>

              {/* Service */}
              <div className="flex gap-[12px] border-none">
                <div className="w-[32px] h-[32px] rounded-[12px] bg-[#F0F5FF] flex items-center justify-center shrink-0">
                  <Truck size={15} color="#5080D0" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[12px] font-medium text-[#C0A0A8] mb-[4px] leading-[16px]">Service</p>
                  <p className="text-[14px] font-semibold text-[#1F2937] m-0 leading-[20px]">Standard Delivery</p>
                  <p className="text-[12px] text-[#9CA3AF] uppercase m-0 leading-[16px] mt-[2px]">{carrier} · {(trackingData?.outbound_shipment_cost || 0)?.toFixed(2)} {trackingData?.outbound_shipment_cost_currency || "INR"}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Shipment Label Card */}
          {(labelUrl || labelPngUrl) && (
            <div className="bg-[#F3D6DC] border border-[#F3D6DC] rounded-[12px] p-[20px] flex flex-col gap-[16px] mt-2 box-border w-full">
              <div className="flex justify-between items-center h-[30px] w-full">
                <h3 className="font-inter font-normal text-[20px] leading-[28px] text-[#111827] m-0 flex items-center h-[28px]">Shipment Label</h3>
                <a href={labelUrl || labelPngUrl} target="_blank" rel="noreferrer" className="bg-[#F3D6DC] border border-[#F3D6DC] rounded-full px-[14px] h-[30px] flex items-center justify-center gap-[6px] hover:bg-[#ebd0d7] transition-colors">
                  <Eye size={13} color="#777777" strokeWidth={2} />
                  <span className="text-[13px] font-medium text-[#777777] font-poppins pt-[1px]">View Full</span>
                </a>
              </div>

              <div className="bg-[#FAF6F3] border border-[#EBEBEB] rounded-[12px] p-[21px] flex flex-col box-border w-full">
                <div className="flex justify-between items-center mb-[16px] h-[20px] w-full">
                  <span className="font-poppins font-bold text-[12px] leading-[16px] tracking-[1.2px] text-[#4B5563] uppercase m-0 flex items-center">{carrier}</span>
                  <span className="bg-[#F0F0F0] rounded-[4px] font-poppins font-medium text-[12px] leading-[16px] px-[8px] py-[2px] text-[#888888] m-0 flex items-center h-[20px] box-border">Priority</span>
                </div>

                <div className="w-full flex justify-between h-[40px] px-1 box-border">
                  {barcodeWidths.map((w, i) => (
                    <div key={i} className="h-full bg-[#1A1A1A]" style={{ width: `${w}px` }}></div>
                  ))}
                </div>

                <div className="w-full pt-[8px]">
                  <p className="text-center font-mono font-normal text-[12px] leading-[16px] tracking-[0.6px] text-[#6B7280] break-all m-0 flex justify-center items-center">
                    {tNumber}
                  </p>
                </div>

                <div className="border-t border-[#E8E8E8] pt-[13px] mt-[13px] flex flex-col box-border w-full">
                  <p className="font-poppins font-semibold text-[12px] leading-[16px] text-[#1F2937] m-0 flex items-center">{deliverTo}</p>
                  <p className="font-poppins font-normal text-[12px] leading-[16px] text-[#9CA3AF] capitalize m-0 mt-[2px] flex items-center">{formattedAddress}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
