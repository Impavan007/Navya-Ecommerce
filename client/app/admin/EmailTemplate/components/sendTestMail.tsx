import { FiX, FiInfo, FiSend } from "react-icons/fi";
import { useState } from "react";
import useEmailTemplateStore from "../../store/EmailTemplate/EmailTemplateStore";
import toast from "react-hot-toast";

interface SendTestMailProps {
    open: boolean;
    onClose: () => void;
}

export default function SendTestMail({ open, onClose }: SendTestMailProps) {
    const { selectedTemplate, mergeTags, sendTestEmail, isSendingTestEmail } = useEmailTemplateStore();
    const [email, setEmail] = useState("");

    if (!open) return null;

    const handleSend = async () => {
        if (!email) {
            toast.error("Please enter an email address.");
            return;
        }

        // Construct sample data from merge tags
        const sampleData: Record<string, string> = {};
        mergeTags.forEach(tag => {
            sampleData[tag.key] = tag.sample || `[${tag.label}]`;
        });

        const success = await sendTestEmail(selectedTemplate!._id, email, sampleData);
        if (success) {
            toast.success("Test email sent successfully!");
            onClose();
        } else {
            toast.error("Failed to send test email.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            {/* MODAL */}
            <div
                className="
          w-full
          max-w-[448px]
          bg-white
          rounded-[8px]
          shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]
          overflow-hidden
        "
            >
                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-[16px] bg-[#F3D6DC]">
                    <h2 className="text-[18px] font-semibold leading-[28px] text-[#111827]">
                        Send Test Email
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center"
                    >
                        <FiX size={20} className="text-[#9CA3AF]" />
                    </button>
                </div>

                {/* BODY */}
                <div className="bg-[#FAF6F3] px-6 py-6 space-y-4">
                    {/* EMAIL FIELD */}
                    <div>
                        <label className="text-[14px] font-medium text-[#374151] flex items-center gap-1">
                            Email Address
                            <span className="text-[#EF4444]">*</span>
                        </label>

                        <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
                            <input
                                id="test-delivery-recipient-field"
                                name="test-delivery-recipient-field"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className="
                mt-2
                w-full
                h-[42px]
                px-[17px]
                text-[16px]
                font-medium
                text-[#374151]
                bg-white
                border
                border-[#F1F1F1]
                rounded-[8px]
                placeholder:text-[#9CA3AF]
                focus:outline-none
              "
                                autoComplete="new-password"
                            />
                        </form>
                    </div>

                    {/* INTERNAL NOTE */}
                    <div>
                        <label className="text-[14px] font-medium text-[#374151]">
                            Internal Note (Optional)
                        </label>

                        <textarea
                            placeholder="Add a note for your records..."
                            className="
                mt-2
                w-full
                h-[90px]
                px-[17px]
                py-[9px]
                text-[16px]
                font-medium
                text-[#374151]
                bg-white
                border
                border-[#F1F1F1]
                rounded-[8px]
                placeholder:text-[#9CA3AF]
                resize-none
                focus:outline-none
              "
                        />
                    </div>

                    {/* INFO BOX */}
                    <div className="bg-[#F1F1F1] rounded-[8px] p-[17px] flex gap-3">
                        <FiInfo size={16} className="text-[#3D1126] mt-[2px] size-8" />

                        <p className="text-[14px] leading-[20px] text-[#3D1126]">
                            Test emails use sample data for merge tags. The email will be
                            sent to the address you specify below.
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end items-center gap-3 px-6 py-[16px] bg-[#FAF6F3] border-t border-[#F1F1F1]">
                    <button
                        onClick={onClose}
                        className="
              h-[38px]
              px-[17px]
              text-[14px]
              font-medium
              text-[#374151]
              bg-white
              border
              border-[#D1D5DB]
              rounded-[8px]
            "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={isSendingTestEmail}
                        className="
              flex
              items-center
              gap-2
              h-[36px]
              px-[16px]
              text-[14px]
              font-medium
              text-white
              bg-[#1A1A1A]
              rounded-[8px]
              disabled:opacity-50
            "
                    >
                        <FiSend size={14} />
                        {isSendingTestEmail ? "Sending..." : "Send Test Email"}
                    </button>
                </div>
            </div>
        </div>
    );
}
