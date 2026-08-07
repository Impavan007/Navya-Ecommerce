"use client";

import { FiEye, FiInfo, FiX, FiAlertCircle } from "react-icons/fi";
import { MdRestore } from "react-icons/md";
import { useEffect, useState } from "react";
import useEmailTemplateStore from "../../store/EmailTemplate/EmailTemplateStore";
import toast from "react-hot-toast";
import PreviewEmail from "./PreviewEmail";

interface VersionHistoryProps {
    open: boolean;
    onClose: () => void;
}

export default function VersionHistory({ open, onClose }: VersionHistoryProps) {
    const {
        selectedTemplate,
        versions,
        fetchVersions,
        restoreVersion,
        isVersionsLoading,
        isSaving
    } = useEmailTemplateStore();

    const [previewVersion, setPreviewVersion] = useState<any>(null);
    const [confirmRestore, setConfirmRestore] = useState<{ isOpen: boolean; version: number | null }>({
        isOpen: false,
        version: null,
    });

    useEffect(() => {
        if (open && selectedTemplate?._id && !isVersionsLoading) {
            fetchVersions(selectedTemplate._id);
        }
    }, [open, selectedTemplate?._id]);

    if (!open) return null;

    const handleRestoreClick = (version: number) => {
        setConfirmRestore({ isOpen: true, version });
    };

    const handleConfirmRestore = async () => {
        if (confirmRestore.version !== null && selectedTemplate?._id) {
            const version = confirmRestore.version;
            setConfirmRestore({ isOpen: false, version: null });
            const success = await restoreVersion(selectedTemplate._id, version);
            if (success) {
                toast.success(`Version v${version} restored successfully.`);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

            {/* MODAL */}
            <div className="
        w-full 
        max-w-[672px] 
        bg-[#FAF6F3] 
        rounded-[12px] 
        shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.1),0px_20px_25px_-5px_rgba(0,0,0,0.1)]
        overflow-hidden
      ">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 bg-[#F3D6DC]">

                    <div>
                        <h2 className="text-[18px] font-semibold text-[#111827] leading-[28px]">
                            Version History
                        </h2>

                        <p className="text-[14px] text-[#6B7280] leading-[20px]">
                            {selectedTemplate?.name}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center"
                    >
                        <FiX size={20} className="text-[#9CA3AF]" />
                    </button>

                </div>

                {/* BODY */}
                <div className="bg-[#FAF6F3] px-6 py-6 space-y-6  " >

                    {versions.map((item, i) => (
                        <div
                            key={i}
                            className="border border-[#F1F1F1] shadow-md rounded-[8px] p-[17px] bg-transparent"
                        >
                            {/* TOP ROW */}
                            <div className="flex justify-between">

                                <div className="flex gap-3 items-center">

                                    {/* VERSION CIRCLE */}
                                    <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center">
                                        <span className="text-[14px] font-semibold text-[#374151]">
                                            {item.version}
                                        </span>
                                    </div>

                                    {/* USER INFO */}
                                    <div>
                                        <div className="flex items-center gap-2">

                                            <span className="text-[14px] font-medium text-[#111827]">
                                                {item.name}
                                            </span>

                                            {item.current && (
                                                <span className="
                          bg-[#FEF3C7] 
                          text-[#B45309] 
                          text-[12px] 
                          px-2 py-[2px] 
                          rounded-full 
                          font-medium
                        ">
                                                    Current
                                                </span>
                                            )}

                                        </div>

                                        <p className="text-[12px] text-[#6B7280] leading-[16px] mt-[2px]">
                                            {item.date}
                                        </p>
                                    </div>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex items-center gap-3">

                                    <button
                                        onClick={() => setPreviewVersion(item)}
                                        className="flex items-center gap-1 px-3 py-1 h-7 rounded-[8px] text-[12px] font-medium text-[#8A8A8A]"
                                    >
                                        <FiEye size={12} />
                                        View
                                    </button>

                                    {!item.current && (
                                        <button
                                            onClick={() => handleRestoreClick(item.version)}
                                            disabled={isSaving}
                                            className="flex items-center gap-1 px-3 py-1 h-7 rounded-[8px] text-[12px] font-medium text-[#3D1126] disabled:opacity-50"
                                        >
                                            <MdRestore size={14} />
                                            {isSaving ? "Restoring..." : "Restore"}
                                        </button>
                                    )}

                                </div>
                            </div>

                            {/* DESCRIPTION */}
                            <div className="mt-3 ml-[52px]">
                                <p className="text-[14px] text-[#4B5563] leading-[20px]">
                                    {item.desc}
                                </p>
                            </div>

                        </div>
                    ))}

                    {/* INFO BOX */}
                    <div className="border border-[#c9cfd6] bg-[#F1F1F1] rounded-[8px] p-[17px] flex gap-3 items-start">

                        <FiInfo size={16} className="text-[] mt-[2px]" />

                        <p className="text-[12px] text-[#3D1126] leading-[20px]">
                            All changes are tracked and reversible. You can view or restore any previous version.
                        </p>

                    </div>

                </div>

                {/* VERSION PREVIEW MODAL */}
                {previewVersion && (
                    <PreviewEmail
                        open={!!previewVersion}
                        onClose={() => setPreviewVersion(null)}
                        subject={previewVersion.subject}
                        body={previewVersion.body}
                    />
                )}

                {/* CONFIRM RESTORE MODAL */}
                {confirmRestore.isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
                        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiAlertCircle size={32} className="text-[#EF4444]" />
                            </div>

                            <h3 className="text-[20px] font-semibold text-[#1F2937] mb-2">
                                Restore Version
                            </h3>

                            <p className="text-[14px] text-[#6B7280] mb-8 leading-relaxed">
                                Are you sure you want to restore <strong>v{confirmRestore.version}</strong>?
                                This will replace your current draft with the content from this version.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setConfirmRestore({ isOpen: false, version: null })}
                                    className="flex-1 px-6 py-3 rounded-xl border border-[#D1D5DB] text-sm font-medium text-[#374151] hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRestore}
                                    className="flex-1 px-6 py-3 rounded-xl bg-[#111827] text-white text-sm font-medium hover:bg-black transition"
                                >
                                    Confirm Restore
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
