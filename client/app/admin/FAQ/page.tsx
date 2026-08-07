"use client";

import { useState, useEffect } from "react";
import {
    RiAddLine,
    RiSearchLine,
    RiArrowDownSLine,
    RiArrowUpSLine,
    RiEdit2Line,
    RiDeleteBinLine,
    RiShoppingBag3Line,
    RiMoneyDollarCircleLine,
    RiQuestionAnswerLine,
    RiTimeLine,
    RiUser3Line,
} from "react-icons/ri";
import { format } from "date-fns";
import FaqModal from "./components/FaqModal";
import useFaqStore, { Faq } from "../store/FAQ/FaqStore";
import DeleteModal from "../components/DeleteModal";
import CommonLoader from "../../components/common/CommonLoader";
import Pagination from "../components/pagination";

/* ================= PAGE ================= */

const roleOptions = [
    { label: "All roles", value: "All roles" },
    { label: "Renter", value: "Renter" },
    { label: "Lender", value: "Lender" },
    { label: "Both", value: "Both" },
];

const statusOptions = [
    { label: "All status", value: "All status" },
    { label: "Active", value: "Active" },
    { label: "Archived", value: "Archived" },
];

export default function FAQ() {
    const [openId, setOpenId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState<Faq | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<string | null>(null);

    const {
        categories,
        faqs,
        filters,
        isLoading,
        isSaving,
        pagination,
        currentPage,
        fetchCategories,
        fetchFaqs,
        setFilters,
        setCurrentPage,
        deleteFaq
    } = useFaqStore();

    const [localSearch, setLocalSearch] = useState(filters.search || "");

    const handleSearch = () => {
        setFilters({ search: localSearch.trim() });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchFaqs();
    }, []);

    const toggleFAQ = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFaqToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!faqToDelete) return;
        const success = await deleteFaq(faqToDelete);
        if (success) {
            setIsDeleteModalOpen(false);
            setFaqToDelete(null);
        }
    };

    const dynamicCategoryOptions = [
        { label: "All categories", value: "All categories" },
        ...categories.map(cat => ({ label: cat.name, value: cat.name }))
    ];

    return (
        <div className="min-h-screen bg-[#f9f5f6] px-8 py-8">
            <div className=" mx-auto space-y-8">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#111827] flex items-center gap-3 font-canela">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <RiQuestionAnswerLine className="text-xl text-[#3D1126]" />
                            </div>
                            FAQ Management
                        </h1>
                        <p className="text-sm text-[#4B5563] mt-1 max-w-2xl">
                            Create and manage frequently asked questions for renters and lenders.
                            Updates reflect instantly on the website.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditData(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#39353e] text-white px-4 py-2 rounded-lg text-sm border border-[#3e3a42] transition-colors w-full md:w-auto justify-center"
                    >
                        <RiAddLine />
                        Add new FAQ
                    </button>
                </div>

                {/* SEARCH */}
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    <div className="relative w-full lg:max-w-lg flex">
                        <div className="relative flex-1">
                            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                placeholder="Search FAQs by question, answer, category, or role..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-l-lg text-sm bg-white border-none focus:outline-none text-[#374151]"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-r-lg text-sm font-medium hover:bg-black transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                        <FilterSelect
                            options={roleOptions}
                            value={filters.role}
                            onChange={(val) => setFilters({ role: val })}
                        />
                        <FilterSelect
                            options={dynamicCategoryOptions}
                            value={filters.category}
                            onChange={(val) => setFilters({ category: val })}
                        />
                        <FilterSelect
                            options={statusOptions}
                            value={filters.status}
                            onChange={(val) => setFilters({ status: val })}
                        />
                    </div>
                </div>

                {isLoading && (
                    <div className="py-12">
                        <CommonLoader pageCenter />
                    </div>
                )}

                {!isLoading && (
                    <div className="space-y-3">
                        {faqs.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No FAQs found matching your criteria.</p>
                            </div>
                        )}
                        {faqs?.map((faq) => {
                        const isOpen = openId === faq._id;
                        const categoryName = faq.category?.name || "Uncategorized";

                        return (
                            <div
                                key={faq._id}
                                className="bg-[#FFFFFF] rounded-xl p-4 sm:p-5 shadow-sm border border-[#F1F1F1]"
                            >
                                <div
                                    className="flex flex-col md:flex-row md:justify-between gap-4 cursor-pointer"
                                    onClick={() => toggleFAQ(faq._id)}
                                >
                                    <div className="flex gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-lg shrink-0">
                                            <RiQuestionAnswerLine />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-1 text-xs  mb-1 ">
                                                <span className="text-gray-600 font-medium">{categoryName}</span>
                                                <div className=" ml-1">
                                                    <span className="text-[#9CA3AF] font-normal">•</span>
                                                    <span className="ml-2 text-[#9CA3AF] font-normal"># <span className="text-[#9CA3AF] font-normal">{faq.faq_slug_id}</span></span>
                                                </div>
                                            </div>

                                            <h3 className="text-[16px] font-bold text-[#111827] mb-2 break-words">
                                                {faq.question}
                                            </h3>

                                            {!isOpen && (
                                                <>
                                                    {/* <hr className="border-gray-300 my-2" /> */}
                                                    <p className="text-xs text-[#6B7280] truncate">
                                                        {faq.answer}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap md:flex-nowrap items-start gap-3 md:justify-end shrink-0">
                                        {faq.roles.map(role => (
                                            <RoleBadge key={role} role={role} />
                                        ))}
                                        <StatusBadge status={faq.status} />
                                        <div className="mt-1">
                                            {isOpen ? (
                                                <RiArrowUpSLine className="text-xl text-gray-400" />
                                            ) : (
                                                <RiArrowDownSLine className="text-xl text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isOpen && (

                                    <div className="mt-4 md:pl-14">
                                        <hr className="border-gray-200 my-2" />

                                        <div className="bg-[#F1F1F1] rounded-lg p-4 text-xs text-[#374151] leading-relaxed break-words">
                                            {faq.answer}
                                        </div>

                                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mt-4 text-xs">
                                            <div className="flex flex-wrap items-center gap-4 text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <RiTimeLine className="text-[#6B7280]" />
                                                    <span className="text-[#6B7280]">Updated {format(new Date(faq.updated_at), 'd MMM yyyy')}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 w-full md:w-auto">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditData(faq);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FFFBEB] text-[#D97706] rounded-md hover:bg-[#f6dbbb] transition-colors font-medium w-full md:w-auto justify-center"
                                                >
                                                    <RiEdit2Line /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, faq._id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#FFFBEB] text-[#DC2626] rounded-md hover:bg-[#fee1e1] transition-colors font-medium w-full md:w-auto justify-center"
                                                >
                                                    <RiDeleteBinLine /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                {!isLoading && pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center pt-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}

                {/* FOOTER */}
                {!isLoading && (
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-xs text-gray-500 pt-4 px-2">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center text-xs">
                                i
                            </span>
                            Showing {faqs.length} of {pagination?.totalItems || faqs.length} FAQs
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <FaqModal
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditData(null);
                    }}
                    editData={editData}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isDeleting={isSaving}
                title="Delete FAQ"
                description="Do you want to delete this FAQ? This action cannot be undone."
            />
        </div>
    );
}

/* ================= COMPONENTS ================= */

function FilterSelect({
    options,
    value,
    onChange
}: {
    options: { label: string; value: string }[],
    value?: string,
    onChange: (val: string) => void
}) {
    return (
        <select
            className="bg-[#FFF1F2] border-none rounded-lg px-4 py-2 text-sm text-[#374151] font-medium focus:outline-none cursor-pointer hover:bg-white transition-colors"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

function RoleBadge({ role }: { role: string }) {
    const styles =
        role === "Renter"
            ? "text-blue-600 bg-blue-50 border border-blue-100"
            : role === "Lender"
                ? "text-green-600 bg-green-50 border border-green-100"
                : "text-purple-600 bg-purple-50 border border-purple-100";

    const icon =
        role === "Renter" ? <RiShoppingBag3Line className="text-xs" />
            : role === "Lender" ? <RiMoneyDollarCircleLine className="text-xs" />
                : <RiUser3Line className="text-xs" />;

    return (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 ${styles}`}>
            {icon}
            {role}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isActive = status === "Active";
    const styles = isActive
        ? "text-green-600 bg-green-50 border border-green-100"
        : "text-gray-500 bg-gray-100 border border-gray-200";

    return (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 ${styles}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
            {status}
        </span>
    );
}
