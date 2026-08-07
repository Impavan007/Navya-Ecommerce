"use client";

import { AiOutlineInfoCircle } from "react-icons/ai";
import { RiDeleteBinLine, RiUpload2Line, RiHistoryLine, RiEyeLine, RiSaveLine, RiUploadCloud2Line, RiCloseLine } from "react-icons/ri";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import HeroImage from "../../../public/assets/HeroSEctionImage3.png"
import Image from "next/image"
import { MdDragIndicator } from 'react-icons/md';
import { useState, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import useHowItWorksStore, { HowItWorksStep } from "../store/HowItWorks/HowItWorksStore";
import toast from "react-hot-toast";
import CommonLoader from "../../components/common/CommonLoader";
import HowItWorksPreviewModal from "./components/HowItWorksPreviewModal";
import VersionHistoryModal from "./components/VersionHistoryModal";

interface Step {
    id: string;
    title: string;
    description: string;
    image: string | File | null;
}

const initialData = {}; // Keeping it clean

export default function HowItWork() {
    const {
        data,
        isLoading,
        isSaving,
        isAddingStep,
        setIsAddingStep,
        setData,
        fetchHowItWorks,
        updateHowItWorks,
        saveHowItWorksDraft,
        addHowItWorksStep,
        deleteHowItWorksStep,
        isDraftSaving
    } = useHowItWorksStore();
    const [steps, setSteps] = useState<Step[]>([]);
    const [stepToDelete, setStepToDelete] = useState<Step | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"renter" | "lender">("renter");
    const [selectedVersionData, setSelectedVersionData] = useState<any>(null);
    const [isVersionPreviewOpen, setIsVersionPreviewOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        fetchHowItWorks();
    }, [fetchHowItWorks]);

    useEffect(() => {
        const currentSteps = activeTab === "renter" ? data.renter_steps : data.lender_steps;
        if (currentSteps) {
            setSteps(currentSteps.map((step, index) => ({
                id: step._id || (index + 1).toString(),
                title: step.title,
                description: step.description,
                image: step.icon || null
            })));
        } else {
            setSteps([]);
        }
    }, [data.renter_steps, data.lender_steps, activeTab]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#ffffffef] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <CommonLoader size="lg" color="gray" className="mb-4" />

                </div>
            </div>
        );
    }

    const handleAddStep = () => {
        const newStep: Step = {
            id: Date.now().toString(),
            title: "",
            description: "",
            image: null
        };
        setSteps([...steps, newStep]);
        setIsAddingStep(true);
        setIsDirty(true);
    };

    const handleDeleteStep = async (id: string) => {
        // If it's a real Mongo ID, call the delete API
        if (id.length > 20) {
            try {
                await deleteHowItWorksStep(id);
                setSteps(steps.filter(step => step.id !== id));
                setIsDirty(true);
            } catch (error) {
                console.error("Failed to delete step through API:", error);
            }
        } else {
            // It's a local-only step (not yet added to DB)
            setSteps(steps.filter(step => step.id !== id));
            setIsDirty(true);
            // Also reset isAddingStep if we delete the last added step
            if (steps.length > 0 && steps[steps.length - 1].id === id) {
                setIsAddingStep(false);
            }
        }
    };

    const handleUpdateStep = (id: string, field: keyof Step, value: string | File | null) => {
        setSteps(steps.map(step =>
            step.id === id ? { ...step, [field]: value } : step
        ));
        setIsDirty(true);
    };

    const handleImageUpload = (id: string | 'hero', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsDirty(true);
            if (id === 'hero') {
                setData({ hero_image: file });
            } else {
                setSteps(steps.map(step =>
                    step.id === id ? { ...step, image: file } : step
                ));
            }
        }
    };

    const handleTabChange = (newTab: "renter" | "lender") => {
        // Sync current steps to store before switching
        const payloadSteps: HowItWorksStep[] = steps.map((step, index) => ({
            title: step.title,
            description: step.description,
            icon: step.image || "",
            order: index + 1,
            _id: step.id.length > 20 ? step.id : undefined
        }));

        if (activeTab === "renter") {
            setData({ renter_steps: payloadSteps });
        } else {
            setData({ lender_steps: payloadSteps });
        }

        setActiveTab(newTab);
    };

    const handleSaveDraft = async () => {
        const payloadSteps: HowItWorksStep[] = steps.map((step, index) => ({
            title: step.title,
            description: step.description,
            icon: step.image || "",
            order: index + 1,
            _id: step.id.length > 20 ? step.id : undefined
        }));

        if (activeTab === "renter") {
            setData({ renter_steps: payloadSteps });
        } else {
            setData({ lender_steps: payloadSteps });
        }

        try {
            await saveHowItWorksDraft();
            setIsDirty(false);
        } catch (error) {
            console.error("Error saving draft:", error);
        }
    };

    const handlePublish = async () => {
        if (isAddingStep) {
            const latestStep = steps[steps.length - 1];
            if (!latestStep.title || !latestStep.description) {
                toast.error("Please fill in the new step details");
                return;
            }

            try {
                await addHowItWorksStep({
                    title: latestStep.title,
                    description: latestStep.description,
                    order: steps.length,
                    icon: latestStep.image || ""
                });
                // After adding, we might want to refresh to get the real ID
                await fetchHowItWorks();
                setIsDirty(false);
            } catch (error) {
                console.error("Error adding step:", error);
            }
        } else {
            const payloadSteps: HowItWorksStep[] = steps.map((step, index) => ({
                title: step.title,
                description: step.description,
                icon: step.image || "",
                order: index + 1,
                _id: step.id.length > 20 ? step.id : undefined
            }));

            // Prepare the full data for update
            if (activeTab === "renter") {
                setData({ renter_steps: payloadSteps });
            } else {
                setData({ lender_steps: payloadSteps });
            }

            try {
                await updateHowItWorks();
                setIsDirty(false);
            } catch (error) {
                console.error("Error update in publish process:", error);
            }
        }
    };

    return (
        <>
            <div className="min-h-screen bg-[#ffffffef] px-8 py-8">
                <div className="w-full space-y-8">

                    {/* ================= HEADER BANNER ================= */}
                    <div className="bg-[#F3D6DC] border border-[#E3B8BF] rounded-xl p-6">
                        <h1 className="text-2xl font-bold text-[#111827] font-canela">
                            Edit "How It Works"
                        </h1>

                        <p className="text-sm text-[#6B7280] mt-2">
                            Update text and images shown on the "How It Works" section of the website.
                            Changes can be previewed before publishing.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-6 justify-between">
                            <div>
                                <button
                                    onClick={() => setIsVersionModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#FFFFFF] border border-[#D1D5DB] rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <RiHistoryLine className="text-sm" />
                                    Version History
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setIsPreviewOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#FFFFFF] border border-[#D1D5DB] rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <RiEyeLine className="text-sm" />
                                    Preview Changes
                                </button>
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={!isDirty || isSaving || isDraftSaving}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm border border-[#D1D5DB] rounded-lg transition-colors ${!isDirty || isSaving || isDraftSaving
                                        ? "bg-[#F1E4E8] text-gray-400 cursor-not-allowed"
                                        : "bg-[#FFFFFF] text-[#111827] hover:bg-gray-50"
                                        }`}
                                >
                                    {isDraftSaving ? (
                                        <CommonLoader size="sm" color="gray" />
                                    ) : (
                                        <RiSaveLine className="text-sm" />
                                    )}
                                    {isDraftSaving ? "Saving..." : "Save as Draft"}
                                </button>
                                <button
                                    onClick={handlePublish}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1A1A1A] text-white rounded-lg disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <CommonLoader size="sm" color="white" />
                                    ) : (
                                        <RiUploadCloud2Line className="text-sm" />
                                    )}
                                    {isSaving ? "Publishing..." : "Publish Changes"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ================= PAGE HEADER SECTION ================= */}
                    <Card title="Page Header Section">
                        <Input
                            label="Section Title"
                            value={data.section_title}
                            onChange={(e) => {
                                setData({ section_title: e.target.value });
                                setIsDirty(true);
                            }}
                        />
                        <Input
                            label="Primary CTA Label"
                            value={data.primary_cta_label}
                            onChange={(e) => {
                                setData({ primary_cta_label: e.target.value });
                                setIsDirty(true);
                            }}
                        />
                        <Input
                            label="CTA Link"
                            value={data.primary_cta_link}
                            onChange={(e) => {
                                setData({ primary_cta_link: e.target.value });
                                setIsDirty(true);
                            }}
                        />
                    </Card>

                    {/* ================= HERO SECTION ================= */}
                    <Card title="Hero / Intro Content">
                        <Input
                            label="Headline"
                            value={data.headline}
                            onChange={(e) => {
                                setData({ headline: e.target.value });
                                setIsDirty(true);
                            }}
                        />
                        <Input
                            label="Sub-headline"
                            value={data.sub_headline}
                            onChange={(e) => {
                                setData({ sub_headline: e.target.value });
                                setIsDirty(true);
                            }}
                        />
                        <Textarea
                            label="Supporting Paragraph"
                            value={data.supporting_paragraph}
                            onChange={(e) => {
                                setData({ supporting_paragraph: e.target.value });
                                setIsDirty(true);
                            }}
                        />

                        <div>
                            <label className="block text-sm font-medium text-[#111827] mb-2">
                                Hero Image
                            </label>

                            <div className="border border-dashed border-[#E3E3E3] rounded-xl p-4">
                                {data.hero_image ? (
                                    <img
                                        src={data.hero_image instanceof File ? URL.createObjectURL(data.hero_image) : data.hero_image}
                                        alt="Hero"
                                        className="rounded-lg w-[70%] h-[230px] object-cover"
                                    />
                                ) : (
                                    <Image
                                        src={HeroImage}
                                        alt="Hero"
                                        className="rounded-lg w-[70%] h-[230px] object-cover"
                                    />
                                )}

                                <div className="flex justify-center gap-3 mt-4 w-[70%]">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => handleImageUpload('hero', e)}
                                        />
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm bg-transparent border border-[#E3E3E3] rounded-lg text-[#374151] pointer-events-none">
                                            <RiUpload2Line className="text-lg" />
                                            Replace Image
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setData({ hero_image: "" });
                                            setIsDirty(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm bg-[#FEE2E2] text-[#B91C1C] border border-[#E3E3E3] rounded-lg"
                                    >
                                        <RiDeleteBinLine className="text-lg" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ================= STEPS SECTION ================= */}
                    <Card
                        icon={<MdDragIndicator />}
                        title="Steps Section"
                        action={
                            <div className="flex items-center gap-4">
                                {/* Toggle Buttons */}
                                <div className="bg-white p-1 rounded-xl flex gap-1 shadow-sm border border-[#FDE7E9]">
                                    <button
                                        onClick={() => handleTabChange("renter")}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "renter"
                                            ? "bg-[#F3D6DC] text-[#3D1126]"
                                            : "text-[#6F6F6F] hover:bg-gray-50"
                                            }`}
                                    >
                                        Renter
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("lender")}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "lender"
                                            ? "bg-[#F3D6DC] text-[#3D1126]"
                                            : "text-[#6F6F6F] hover:bg-gray-50"
                                            }`}
                                    >
                                        Lender
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddStep}
                                    className="bg-[#1A1A1A] text-white px-4 py-2 text-sm rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                    + Add Step
                                </button>
                            </div>
                        }
                    >
                        <Reorder.Group axis="y" values={steps} onReorder={(newSteps) => {
                            setSteps(newSteps);
                            setIsDirty(true);
                        }} className="space-y-4">
                            {steps.map((step, index) => (
                                <Reorder.Item key={step.id} value={step}>
                                    <div className="bg-[#F1F1F1] border border-[#E3E3E3] rounded-xl p-6 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                                                <MdDragIndicator className="text-gray-400 text-lg" />
                                                <span className="text-sm text-[#6B7280]">Step {index + 1}</span>
                                            </div>
                                            <button onClick={() => setStepToDelete(step)}>
                                                <RiDeleteBinLine className="text-[#EF4444] cursor-pointer hover:text-red-600 transition-colors" />
                                            </button>
                                        </div>

                                        <Input
                                            label="Step Title"
                                            value={step.title}
                                            onChange={(e) => handleUpdateStep(step.id, 'title', e.target.value)}
                                        />
                                        <Textarea
                                            label="Step Description"
                                            value={step.description}
                                            onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-[#111827] mb-2">
                                                Icon
                                            </label>

                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        onChange={(e) => handleImageUpload(step.id, e)}
                                                    />
                                                    <button className="flex items-center gap-2 px-4 py-2 text-sm bg-transparent border border-[#E3E3E3] rounded-lg text-[#374151] hover:bg-gray-50 transition-colors pointer-events-none">
                                                        Upload Image
                                                        <RiUpload2Line />
                                                    </button>
                                                </div>
                                                {step.image && (
                                                    <div className="relative w-10 h-10">
                                                        <img
                                                            src={step.image instanceof File ? URL.createObjectURL(step.image) : step.image}
                                                            alt="Step Icon"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    </Card>

                    {/* ================= DESIGN GUIDANCE ================= */}
                    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-6">
                        <div className="flex gap-2">
                            <AiOutlineInfoCircle className="text-[#B45309] mt-1" />
                            <div>
                                <h3 className="text-sm font-semibold text-[#92400E]">
                                    Design Guidance
                                </h3>
                                <p className="text-xs text-[#92400E] mt-2">
                                    Step titles use editorial typography. Supporting text should feel light,
                                    friendly, and reassuring — not instructional.
                                    Keep headlines short and impactful. Use the description to add warmth and clarity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {stepToDelete && (
                <DeleteConfirmationModal
                    stepTitle={stepToDelete.title}
                    onClose={() => setStepToDelete(null)}
                    onConfirm={() => {
                        handleDeleteStep(stepToDelete.id);
                        setStepToDelete(null);
                    }}
                />
            )}

            <VersionHistoryModal
                isOpen={isVersionModalOpen}
                onClose={() => setIsVersionModalOpen(false)}
                onViewVersion={(v) => {
                    setSelectedVersionData(v);
                    setIsVersionPreviewOpen(true);
                }}
            />

            {selectedVersionData && (
                <HowItWorksPreviewModal
                    isOpen={isVersionPreviewOpen}
                    onClose={() => setIsVersionPreviewOpen(false)}
                    data={selectedVersionData}
                    steps={((activeTab === "renter" ? selectedVersionData.renter_steps : selectedVersionData.lender_steps) || selectedVersionData.renter_steps || selectedVersionData.steps || []).map((s: any, i: number) => ({
                        id: s._id || i.toString(),
                        title: s.title,
                        description: s.description,
                        image: s.icon
                    }))}
                    activeTab={activeTab}
                />
            )}

            <HowItWorksPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                data={data}
                steps={steps}
                activeTab={activeTab}
            />
        </>
    );
}

/* ================= COMPONENTS ================= */

function Card({
    title,
    children,
    action,
    icon,
}: {
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="bg-[#F1F1F1] border border-[#E3E3E3] rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-[16px] font-semibold text-[#111827]">
                        {title}
                    </h2>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

function Input({
    label,
    defaultValue,
    value,
    onChange,
}: {
    label: string;
    defaultValue?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
                {label}
            </label>
            <input
                defaultValue={defaultValue}
                value={value}
                onChange={onChange}
                className="w-full bg-[#F9FAFB] border border-[#E3E3E3] rounded-lg px-4 py-2 text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
        </div>
    );
}

function Textarea({
    label,
    defaultValue,
    value,
    onChange,
}: {
    label: string;
    defaultValue?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-[#111827] mb-2">
                {label}
            </label>
            <textarea
                rows={3}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange}
                className="w-full bg-[#F9FAFB] border border-[#E3E3E3] rounded-lg px-4 py-2 text-sm text-[#111827] resize-none focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
        </div>
    );
}

function DeleteConfirmationModal({
    onClose,
    onConfirm,
    stepTitle
}: {
    onClose: () => void;
    onConfirm: () => void;
    stepTitle: string
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-[#111827]">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                <HiOutlineExclamationTriangle className="text-red-600 text-xl" />
                            </div>
                            <h3 className="text-lg font-semibold">Delete Step</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <RiCloseLine className="text-gray-400 text-xl" />
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-[#4B5563] text-sm leading-relaxed">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">"{stepTitle || "this step"}"</span>?
                            This action cannot be undone and will be removed from the platform immediately.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#EF4444] border border-[#EF4444] rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Confirm Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
