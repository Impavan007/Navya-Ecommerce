"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from 'react-hot-toast';
import { bookingsApiService } from "../../../services/api/bookings";
import SuccessMessageModal from "../../../components/SuccessMessageModal";
import Breadcrumb from "../../../components/Breadcrumb";

export default function ReturnPage() {
  const routeParams = useParams();
  const id = (routeParams as { id: string }).id;
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<'good' | 'damaged'>('good');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        const resp = await bookingsApiService.getRenterBookingDetail(id);
        if (resp && (resp as any).success !== false) {
          setDetail((resp as any).data);
        }
      } catch (error) {
        console.error('Failed to fetch booking detail:', error);
      }
    };
    if (id) fetchBookingDetail();
  }, [id]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const added = Array.from(e.dataTransfer.files || []);
    if (added.length) setFiles((prev) => [...prev, ...added]);
  };

  const onChoose: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const added = Array.from(e.target.files || []);
    if (added.length) setFiles((prev) => [...prev, ...added]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const submit = async () => {
    if (!files.length) {
      toast.error("Please upload at least one proof image.");
      return;
    }
    try {
      setIsSubmitting(true);
      await bookingsApiService.returnBooking(id, {

        description,
        proof: files,
      });
      toast.success("Return submitted successfully.");
      setFiles([]);
      setDescription("");
      setCondition("good");
      setShowSuccessModal(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit return. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#FAF6F3] relative size-full overflow-x-hidden">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Order detail", href: `/bookings/${id}` }, { label: "Return" }]} />
      


        <div className="max-w-[1440px] mx-auto px-[20px] lg:px-[40px] pb-[80px] py-[40px]">
          <div className="flex flex-col gap-[32px] items-center">
            <div>
            </div>
            <div className="w-full max-w-[600px] flex flex-col gap-[12px]">
              <div className="px-0 py-[12px]">
                <p className="font-poppins text-[16px] leading-[24px] text-[#8A8A8A] border-b border-[#cbd0bc]">       {detail?.orderNumber}
                </p>
              </div>
              <div className="px-0 py-[12px]">
                <p className="font-poppins text-[16px] leading-[24px] text-[#8A8A8A]">Upload proof of the item</p>
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="border border-dashed border-[#cbd0dc] h-[158px] w-full flex flex-col items-center justify-center gap-[16px]"
              >
                <div className="size-[32px]">
                  <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25.8 8.05333C24.8933 3.45333 20.8533 0 16 0C12.1467 0 8.8 2.18667 7.13333 5.38667C3.12 5.81333 0 9.21333 0 13.3333C0 17.7467 3.58667 21.3333 8 21.3333H25.3333C29.0133 21.3333 32 18.3467 32 14.6667C32 11.1467 29.2667 8.29333 25.8 8.05333ZM18.6667 12V17.3333H13.3333V12H9.33333L15.5333 5.8C15.8 5.53333 16.2133 5.53333 16.48 5.8L22.6667 12H18.6667Z" fill="#323232" />
                  </svg>

                </div>
                <div className="text-center">
                  <p className="font-poppins text-[16px] leading-[24px] text-[#292d32]">Choose a file or drag & drop it here</p>
                  <p className="font-poppins text-[12px] leading-[16px] text-[#A9ACB4]">JPEG, PNG, PDG, and MP4 formats, up to 50MB</p>
                </div>
                <input type="file" multiple className="hidden" id="file-input-return" onChange={onChoose} />
                <label htmlFor="file-input-return" className="underline cursor-pointer font-poppins text-[12px]">Browse</label>
              </div>
              <p className="font-poppins text-[14px] leading-[20px] text-[#8a8a8a]">Upload at least 3 or 4 images of the product covering all sides</p>

              {files.length > 0 && (
                <div className="flex flex-wrap gap-[12px]">
                  {files.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="bg-[#E9DED4] flex items-center gap-[12px] px-[16px] py-[10px] h-[44px]">
                      <p className="font-poppins text-[16px] leading-[24px] text-[#3D1126] truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-[#3D1126] hover:text-black transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* <div className="border border-dashed border-[#cbd0dc] h-[138px] w-full flex flex-col items-center justify-center gap-[12px]">
              <div className="h-[34px]">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="#6D6D6D" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="4" stroke="#6D6D6D" strokeWidth="1.5"/>
                  <path d="M9 3L7 6H17L15 3" stroke="#6D6D6D" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-poppins text-[16px] leading-[24px] text-[#292d32]">Use Camera instead</p>
            </div> */}

              <div className="flex flex-col gap-[16px]">
                {/* <div className="flex flex-col gap-3">
                <p className="font-poppins font-medium text-[16px] text-[#3D1126]">Item condition</p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "Good condition", value: "good" },
                    { label: "Damaged", value: "damaged" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm font-poppins text-[#3D1126]">
                      <input
                        type="radio"
                        name="condition"
                        value={opt.value}
                        checked={condition === opt.value}
                        onChange={() => setCondition(opt.value as 'good' | 'damaged')}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div> */}

                <p className="font-poppins font-medium text-[16px] leading-[24px] text-[#3D1126]">Add a description</p>
                <div className="border border-[#6d6d6d] h-[148px]">
                  <textarea
                    placeholder="Make sure you add the return order id of the product for the lender’s convenience."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-full p-[16px] font-poppins text-[12px] leading-[16px] text-[#6d6d6d] bg-transparent resize-none outline-none"
                  />
                </div>
              </div>

              <button
                onClick={submit}
                disabled={isSubmitting}
                className="bg-[#1A1A1A] text-white px-[16px] py-[16px] font-poppins text-[14px] w-full disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">
                {isSubmitting ? 'Submitting...' : 'Submit Return'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {showSuccessModal && (
        <SuccessMessageModal
          title="Return Successfully Submitted!"
          message="Your return has been successfully submitted. The item will be processed, and your security deposit will be refunded shortly."
          redirectPath="/"
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </ProtectedRoute>
  );
}


