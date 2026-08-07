"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
    FiBold,
    FiItalic,
    FiLink,
    FiList,
    FiCopy,
    FiInfo,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import useEmailTemplateStore from "../../store/EmailTemplate/EmailTemplateStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateEmail() {
    const {
        createTemplate,
        fetchMergeTags,
        mergeTags,
        isSaving,
    } = useEmailTemplateStore();
    const router = useRouter();

    const [subject, setSubject] = useState("");
    const [name, setName] = useState("");
    const [trigger, setTrigger] = useState("");
    const [status, setStatus] = useState("Active");
    const [requiredMergeTags, setRequiredMergeTags] = useState<string[]>([]);

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
        fetchMergeTags();
    }, [fetchMergeTags]);

    const handleCreate = async () => {
        if (!name || !trigger || !subject || !editor?.getHTML()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const success = await createTemplate({
            name,
            trigger,
            subject,
            status,
            requiredMergeTags,
            body: editor.getHTML(),
        });

        if (success) {
            toast.success("Email template created successfully!");
            router.push("/admin/EmailTemplate");
        }
    };

    if (!editor) return null;

    return (
        <div className="min-h-screen bg-[#FAF6F3]">
            {/* HEADER SECTION */}
            <div className="px-12 pt-10 pb-8 border-b border-[#E5E7EB]">
                <div className="text-sm text-[#6B7280] mb-4">
                    Content Management &nbsp;›&nbsp; Email Templates &nbsp;›&nbsp; New Template
                </div>

                <h1 className="text-[28px] font-semibold text-[#1F2937] font-canela">
                    Create Email Template
                </h1>

                <p className="text-[14px] text-[#6B7280] mt-2">
                    Define the core details and content for your new email template.
                </p>

                <div className="flex justify-end mt-6 gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 rounded-xl border border-[#9CA3AF] text-sm font-medium text-[#374151]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl bg-[#10151c] text-white text-sm font-medium disabled:opacity-50"
                    >
                        {isSaving ? "Creating..." : "Create Template"}
                    </button>
                </div>
            </div>

            {/* BODY SECTION */}
            <div className="px-12 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.1fr] gap-12">
                    {/* LEFT CARD */}
                    <div className="bg-[#F1F1F1] border border-[#E3E3E3] rounded-2xl p-10 space-y-8">
                        {/* NAME & TRIGGER */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">
                                    Template Name *
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Welcome Email"
                                    className="w-full px-4 py-3 rounded-xl border border-[#E3E3E3] bg-[#FAF6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">
                                    Trigger Event *
                                </label>
                                <input
                                    value={trigger}
                                    onChange={(e) => setTrigger(e.target.value)}
                                    placeholder="e.g. User Signup"
                                    className="w-full px-4 py-3 rounded-xl border border-[#E3E3E3] bg-[#FAF6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                                />
                            </div>
                        </div>

                        {/* STATUS & REQUIRED TAGS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E3E3E3] bg-[#FAF6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-2">
                                    Required Merge Tags (comma-separated)
                                </label>
                                <input
                                    value={requiredMergeTags.join(", ")}
                                    onChange={(e) => setRequiredMergeTags(e.target.value.split(",").map(t => t.trim()).filter(t => t))}
                                    placeholder="e.g. name, order_id"
                                    className="w-full px-4 py-3 rounded-xl border border-[#E3E3E3] bg-[#FAF6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                                />
                            </div>
                        </div>

                        {/* SUBJECT */}
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-2">
                                Email Subject *
                            </label>
                            <input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject line"
                                className="w-full px-4 py-3 rounded-xl border border-[#E3E3E3] bg-[#FAF6F3] text-sm focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                            />
                        </div>

                        {/* BODY */}
                        <div>
                            <label className="block text-sm font-medium text-[#374151] mb-3">
                                Email Body *
                            </label>
                            <div className="flex items-center gap-4 bg-[#F3D6DC] rounded-t-xl px-5 py-3">
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
                            <div className="bg-[#FAF6F3] rounded-b-xl px-6 py-6 min-h-[400px]">
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-6 text-sm text-[#1E3A8A]">
                            <FiInfo className="mt-1 text-[#2563EB]" />
                            <div>
                                <div className="font-semibold mb-1">Design Guidance</div>
                                Provide a clear and engaging structure for your email.
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CARD */}
                    <div className="bg-[#F1F1F1] border border-[#E5E7EB] rounded-2xl p-8 h-fit">
                        <h3 className="text-sm font-semibold text-[#1F2937] mb-4">
                            Available Merge Tags
                        </h3>
                        <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">
                            Click to copy and paste into subject or body.
                        </p>
                        <div className="space-y-3">
                            {mergeTags.map((tag) => (
                                <div
                                    key={tag.key}
                                    className="flex items-center justify-between bg-[#FAF6F3] rounded-xl px-4 py-3 hover:bg-[#c6c4c2] transition"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-[#D97706]">
                                            {`{{${tag.key}}}`}
                                        </div>
                                        <div className="text-xs text-[#4B5563]">
                                            {tag.label}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`{{${tag.key}}}`);
                                            editor.chain().focus().insertContent(`{{${tag.key}}}`).run();
                                        }}
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
        </div>
    );
}
