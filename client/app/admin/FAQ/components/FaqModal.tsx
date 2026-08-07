"use client";

import { useState } from "react";
import {
    RiCheckboxBlankLine,
    RiCheckboxLine,
} from "react-icons/ri";
import useFaqStore, { Faq } from "../../store/FAQ/FaqStore";
import { toast } from "react-hot-toast";
import CommonModal from "@/app/components/common/CommonModal";

interface FaqModalProps {
    onClose: () => void;
    editData?: Faq | null;
}

export default function FaqModal({ onClose, editData }: FaqModalProps) {
    const isEdit = !!editData;

    const [question, setQuestion] = useState(editData?.question || "");
    const [answer, setAnswer] = useState(editData?.answer || "");
    const [renterChecked, setRenterChecked] = useState(editData?.roles.includes("Renter") || false);
    const [lenderChecked, setLenderChecked] = useState(editData?.roles.includes("Lender") || false);
    const [category, setCategory] = useState(typeof editData?.category === 'object' ? editData.category._id : "");
    const [status, setStatus] = useState(editData?.status || "Active");
    const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const { categories, addFaq, updateFaq, addCategory, isSaving } = useFaqStore();

    const handleSave = async () => {
        if (!question || !answer || (!renterChecked && !lenderChecked) || !category) return;

        const roles = [];
        if (renterChecked) roles.push("Renter");
        if (lenderChecked) roles.push("Lender");

        if (isEdit && editData) {
            const payload: any = {};
            if (question !== editData.question) payload.question = question;
            if (answer !== editData.answer) payload.answer = answer;
            if (JSON.stringify(roles) !== JSON.stringify(editData.roles)) payload.roles = roles;
            if (category !== (typeof editData.category === 'object' ? editData.category._id : "")) payload.category = category;
            if (status !== editData.status) payload.status = status;

            if (Object.keys(payload).length === 0) {
                onClose();
                return;
            }

            const success = await updateFaq(editData._id, payload);
            if (success) {
                toast.success("FAQ updated successfully");
                onClose();
            } else {
                toast.error("Failed to update FAQ");
            }
        } else {
            const success = await addFaq({ question, answer, roles, category, status });

            if (success) {
                toast.success("FAQ added successfully");
                onClose();
            } else {
                toast.error("Failed to add FAQ");
            }
        }
    };
    
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const success = await addCategory(newCategoryName);
        if (success) {
            toast.success("Category added successfully");
            setNewCategoryName("");
            setShowAddCategoryInput(false);
        } else {
            toast.error("Failed to add category");
        }
    };

    return (
        <CommonModal
            isOpen={true}
            onClose={onClose}
            title={isEdit ? "Update FAQ" : "Add New FAQ"}
            size="md"
            loading={isSaving}
        >
            <div className="space-y-6 font-poppins">
                <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter the FAQ question"
                        className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Answer</label>
                    <textarea
                        rows={5}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Write a clear, simple answer that helps users resolve questions quickly"
                        className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 text-sm resize-none focus:outline-none"
                    />
                    <p className="text-xs text-gray-400  leading-relaxed">
                        Write clear, simple answers that help users resolve questions quickly.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Who is this FAQ for?</label>
                    <div className="space-y-3">
                        <div
                            onClick={() => setRenterChecked(!renterChecked)}
                            className="border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition"
                        >
                            {renterChecked ? (
                                <RiCheckboxLine className="text-lg text-blue-600 mt-1" />
                            ) : (
                                <RiCheckboxBlankLine className="text-lg text-gray-400 mt-1" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Renter</p>
                                <p className="text-xs text-gray-500">This FAQ will appear on renter help pages</p>
                            </div>
                        </div>
                        <div
                            onClick={() => setLenderChecked(!lenderChecked)}
                            className="border border-[#E5E7EB] rounded-lg px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition"
                        >
                            {lenderChecked ? (
                                <RiCheckboxLine className="text-lg text-blue-600 mt-1" />
                            ) : (
                                <RiCheckboxBlankLine className="text-lg text-gray-400 mt-1" />
                            )}
                            <div>
                                <p className="text-sm font-medium">Lender</p>
                                <p className="text-xs text-gray-500">This FAQ will appear on lender help pages</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Select at least one role. This controls where the FAQ appears.
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    
                    <div className="mt-2">
                        {!showAddCategoryInput ? (
                            <button
                                type="button"
                                onClick={() => setShowAddCategoryInput(true)}
                                className="text-sm font-medium text-[#3D1126] hover:underline flex items-center gap-1"
                            >
                                + Add new category
                            </button>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                    className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="px-3 py-1.5 bg-[#1A1A1A] text-white rounded-lg text-xs font-medium hover:bg-[#39353e] transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddCategoryInput(false);
                                        setNewCategoryName("");
                                    }}
                                    className="px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#374151] hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mt-2">
                        Categories help users browse FAQs more easily.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Status</label>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                checked={status === "Active"}
                                onChange={() => setStatus("Active")}
                            />
                            Active (visible on website)
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="status"
                                checked={status === "Archived"}
                                onChange={() => setStatus("Archived")}
                            />
                            Archived (hidden but preserved)
                        </label>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!question || !answer || (!renterChecked && !lenderChecked) || !category || isSaving}
                        className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${!question || !answer || (!renterChecked && !lenderChecked) || !category || isSaving
                            ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                            : "bg-[#1A1A1A] text-white hover:bg-[#39353e]"
                            }`}
                    >
                        {isSaving ? "Saving..." : isEdit ? "Update FAQ" : "Save FAQ"}
                    </button>
                </div>
            </div>
        </CommonModal>
    );
}
