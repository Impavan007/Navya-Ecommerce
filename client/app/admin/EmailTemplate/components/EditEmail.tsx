"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { RiMailLine, RiHistoryLine, RiArrowLeftLine, RiEyeLine, RiLayout5Line, RiEdit2Line, RiErrorWarningLine, RiSaveLine, RiSettings3Line } from "react-icons/ri";
import { FiBold, FiItalic, FiLink, FiList, FiCopy, FiInfo, FiEye, FiSend, FiClock, FiAlertTriangle } from "react-icons/fi";
import CommonLoader from "../../../components/common/CommonLoader";
import VersionHistory from "./VersionHistory";
import SendTestMail from "./sendTestMail";
import PreviewEmail from "./PreviewEmail";
import { useEffect, useState } from "react";
import useEmailTemplateStore from "../../store/EmailTemplate/EmailTemplateStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


interface EditEmailProps {
    id: string;
}

export default function EditEmail({ id }: EditEmailProps) {
    const {
        selectedTemplate,
        fetchTemplateById,
        fetchMergeTags,
        mergeTags,
        updateTemplate,
        previewTemplate,
        isSaving,
        isLoading,
        error
    } = useEmailTemplateStore();
    const router = useRouter();

    const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null);

    const [showHistory, setShowHistory] = useState(false);
    const [showSendTestMail, setShowSendTestMail] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);
    const [subject, setSubject] = useState("");
    const [templateLoaded, setTemplateLoaded] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2] },
            }),

            Link.configure({ openOnClick: false }),
            Placeholder.configure({
                placeholder: "Write your email content here...",
            }),
        ],
        content: "",
        immediatelyRender: false,
    });

    useEffect(() => {
        setTemplateLoaded(false); // Reset loaded state when ID changes
        fetchTemplateById(id);
        fetchMergeTags();
    }, [id, fetchTemplateById, fetchMergeTags]);

    useEffect(() => {
        // Only initialize if we have the correct template data
        if (selectedTemplate && (selectedTemplate._id === id || selectedTemplate.id === id) && !templateLoaded) {
            setSubject(selectedTemplate.subject);
            if (editor && !editor.isFocused) {
                editor.commands.setContent(selectedTemplate.body);
            }
            setTemplateLoaded(true);
        }
    }, [selectedTemplate, editor, templateLoaded, id]);

    const handleSave = async () => {
        const success = await updateTemplate(id, {
            subject,
            body: editor?.getHTML(),
            name: selectedTemplate?.name,
            trigger: selectedTemplate?.trigger,
            status: selectedTemplate?.status,
            requiredMergeTags: selectedTemplate?.requiredMergeTags,
            note: `Updated on ${new Date().toLocaleString()}` // Added a note as per API requirements
        });
        if (success) {
            toast.success("Template updated successfully!");
            router.push("/admin/EmailTemplate");
        }
    };

    const handlePreview = async () => {
        // Construct sample data from merge tags
        const sampleData: Record<string, string> = {};
        mergeTags.forEach(tag => {
            sampleData[tag.key] = tag.sample || `[${tag.label}]`;
        });

        const result = await previewTemplate(id, sampleData);
        if (result) {
            setPreviewData(result);
            setOpenPreview(true);
        } else {
            // Fallback to raw content if API fails or for safety
            setPreviewData({ subject, body: editor?.getHTML() || "" });
            setOpenPreview(true);
        }
    };

    if (isLoading || !selectedTemplate || (selectedTemplate._id !== id && selectedTemplate.id !== id) || !editor) {
        return <CommonLoader pageCenter />;
    }

    return (
        <div className="min-h-screen bg-[#FAF6F3]">

            {/* HEADER SECTION */}
            <div className="px-12 pt-10 pb-8 border-b border-[#E5E7EB]">
                <div className="text-sm text-[#6B7280] mb-4">
                    Content Management &nbsp;›&nbsp; Email Templates &nbsp;›&nbsp; {selectedTemplate?.name || "Loading..."}
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-[28px] font-semibold text-[#1F2937] font-canela flex items-center gap-3">
                            {isLoading ? (
                                <>
                                    <CommonLoader size="sm" />

                                </>
                            ) : (
                                `Edit ${selectedTemplate?.name}`
                            )}
                        </h1>
                        {selectedTemplate && (
                            <p className="text-[14px] text-[#6B7280] mt-1">
                                Last updated: {selectedTemplate.lastUpdated}
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-[14px] text-[#6B7280] mt-2">
                    Customise the content of this email. You can use merge tags to personalise messages.
                </p>

                <div className="flex flex-wrap items-center justify-between mt-6">
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handlePreview}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#374151]"
                        >
                            <FiEye size={16} />
                            Preview Email
                        </button>


                        <button
                            onClick={() => setShowSendTestMail(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#374151]"
                        >
                            <FiSend size={16} />
                            Send Test Email
                        </button>

                        <button
                            onClick={() => setShowHistory(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#374151]"
                        >
                            <FiClock size={16} />
                            Version History
                        </button>
                    </div>

                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button
                            onClick={() => router.push("/admin/EmailTemplate")}
                            className="px-6 py-2.5 rounded-xl border border-[#9CA3AF] text-sm font-medium text-[#374151] "
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl bg-[#10151c] text-white text-sm font-medium disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            {/* BODY SECTION */}
            <div className="px-12 py-10">

                <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.1fr] gap-12">

                    {/*LEFT CARD */}
                    <div className="bg-[#F1F1F1] border border-[#E3E3E3] rounded-2xl p-10 space-y-10">

                        {/* SUBJECT */}
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-3">
                                Email Subject
                            </label>

                            <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
                                <input
                                    id="template-meta-subject-id"
                                    name="template-meta-subject-name"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E3E3E3] bg-[#FAF6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                                    autoComplete="off"
                                />
                            </form>

                            <p className="text-xs text-[#6B7280] mt-3">
                                Merge tags personalise subject lines.
                            </p>
                        </div>

                        {/* BODY */}
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-4">
                                Email Body
                            </label>

                            {/* Toolbar */}
                            <div className="flex items-center gap-4 bg-gray-50 rounded-t-xl px-5 py-3">
                                <button onClick={() => editor.chain().focus().toggleBold().run()} className="text-[#374151]">
                                    <FiBold size={16} />
                                </button>
                                <button onClick={() => editor.chain().focus().toggleItalic().run()} className="text-[#374151]">
                                    <FiItalic size={16} />
                                </button>
                                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="text-[#374151]">
                                    <FiList size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        const url = prompt("Enter URL");
                                        if (url) editor.chain().focus().setLink({ href: url }).run();
                                    }}
                                    className="text-[#374151]"
                                >
                                    <FiLink size={16} />
                                </button>
                            </div>

                            {/* Editor */}
                            <div className="bg-[#FAF6F3] rounded-b-xl px-6 py-6 min-h-[420px]">
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        {/* REQUIRED MERGE TAGS */}
                        <div className="flex items-start gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-6 text-sm text-[#92400E]">
                            <FiAlertTriangle className="mt-1 text-[#F59E0B]" />
                            <div>
                                <div className="font-semibold mb-1">Required Merge Tags</div>
                                <span className="text-[#B45309]">
                                    This template requires: {"{{first_name}}"}
                                </span>
                            </div>
                        </div>

                        {/* DESIGN GUIDANCE */}
                        <div className="flex items-start gap-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-6 text-sm text-[#1E3A8A]">
                            <FiInfo className="mt-1 text-[#2563EB]" />
                            <div>
                                <div className="font-semibold mb-1">Design Guidance</div>
                                Keep emails friendly, clear, and supportive — aligned with Navyaa's calm, fashion-led tone.
                            </div>
                        </div>

                    </div>

                    {/*  RIGHT CARD */}
                    <div className="bg-[#F1F1F1] border border-[#E5E7EB] rounded-2xl p-8 h-fit">

                        <h3 className="text-sm font-semibold text-[#1F2937] mb-4">
                            Available Merge Tags
                        </h3>

                        <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">
                            Click to copy and paste into subject or body.
                            Merge tags automatically pull user and booking data.
                        </p>

                        <div className="space-y-3">
                            {[
                                ["{{first_name}}", "User first name"],
                                ["{{last_name}}", "User last name"],
                                ["{{email}}", "User email address"],
                                ["{{order_id}}", "Order ID number"],
                                ["{{item_name}}", "Item name"],
                                ["{{rental_start_date}}", "Rental start date"],
                                ["{{rental_end_date}}", "Rental end date"],
                                ["{{city}}", "User city"],
                                ["{{lender_name}}", "Lender name"],
                                ["{{borrower_name}}", "Borrower name"],
                            ].map(([tag, desc]) => (
                                <div
                                    key={tag}
                                    className="flex items-center justify-between bg-[#FAF6F3] rounded-xl px-4 py-3 hover:bg-[#c6c4c2] transition"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-[#D97706]">
                                            {tag}
                                        </div>
                                        <div className="text-xs text-[#4B5563]">
                                            {desc}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => editor.chain().focus().insertContent(tag).run()}
                                        className="text-[#6B7280] hover:text-[#1F2937] transition"
                                    >
                                        <FiCopy size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>
            {/* COMPONENT RENDER */}
            <SendTestMail open={showSendTestMail} onClose={() => setShowSendTestMail(false)} />
            <VersionHistory open={showHistory} onClose={() => setShowHistory(false)} />
            <PreviewEmail
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                subject={previewData?.subject || subject}
                body={previewData?.body || editor?.getHTML() || ""}
            />
        </div>
    );
}
