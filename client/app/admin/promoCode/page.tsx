"use client";

import React, { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { RiCoupon2Line, RiPencilLine, RiCloseCircleLine, RiBarChartLine } from 'react-icons/ri';
import PromoCodePerformance from "./components/PromoCodePerformance";
import EditPromoCode from "./components/EditPromoCode";
import DeletePromoCode from "./components/DeletePromoCode";
import CreatePromoCode from "./components/CreatePromoCode";
import Pagination from '../components/pagination';
import usePromoStore, { Promo } from "../store/PromoCode/PromoStore";
import CommonLoader from "../../components/common/CommonLoader";

export default function Page() {
    const {
        promoCodes,
        pagination,
        filters,
        isLoading,
        isPerformanceLoading,
        fetchPromoCodes,
        setFilters,
        fetchPromoCodePerformance,
        selectedPromoPerformance
    } = usePromoStore();

    // pagination
    const currentPage = pagination?.currentPage || 1;
    const totalPages = pagination?.totalPages || 1;

    const handlePageChange = (page: number) => {
        setFilters({ page });
    };

    // useState
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);


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
        fetchPromoCodes();
    }, []);

    return (
        <div className="min-h-screen bg-[#FAF6F3] p-4 sm:p-6 lg:p-10">
            <div className=" mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl text-gray-800 font-bold font-canela">
                            Promo Code Management
                        </h1>
                        <p className="text-base text-gray-500 mt-1 font-roboto">
                            Create and manage promotional codes to run engagement campaigns. Discounts apply only to the platform fee.
                        </p>
                    </div>

                    <button className="bg-[#1A1A1A] text-[#FFFFFF] px-4 py-2 rounded-lg text-base font-roboto hover:opacity-90 w-fit" onClick={() => setIsCreateOpen(true)}>
                        + Create Promo Code
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">

                    <div className="flex-1 flex max-w-xl">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by promo code..."
                                className="w-full border border-gray-300 rounded-l-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <i className="ri-search-line"></i>
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-r-lg text-sm font-medium hover:bg-black transition-colors border border-[#3D1126]"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex gap-4">
                        <select
                            className="border-[#F3D6DC] border rounded-lg px-3 py-2 font-roboto w-full md:w-40 bg-[#F3D6DC] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-normal"
                            value={filters.status}
                            onChange={(e) => setFilters({ status: e.target.value })}
                        >
                            <option className="bg-white">All Status</option>
                            <option className="bg-white">Active</option>
                            <option className="bg-white">Expired</option>
                            <option className="bg-white">Disabled</option>
                        </select>

                        <select
                            className="border-[#F3D6DC] border rounded-lg px-3 py-2 font-roboto w-full md:w-40 bg-[#F3D6DC] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-normal"
                            value={filters.type}
                            onChange={(e) => setFilters({ type: e.target.value })}
                        >
                            <option className="bg-white" value="All Types">All Types</option>
                            <option className="bg-white" value="Percentage">Percentage</option>
                            <option className="bg-white" value="Fixed Amount">Fixed Amount</option>
                        </select>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-[#F1F1F1] border border-[#F1F1F1] text-[#6D6D6D] text-sm font-roboto rounded-lg p-3 mb-6 flex items-center gap-2">
                    <AiOutlineInfoCircle className="flex-shrink-0" />
                    <span>Promo codes are applied during checkout and affect only the platform fee.</span>
                </div>

                {/* Table */}
                <div className="bg-[#F3D6DC] rounded-xl shadow-sm overflow-hidden border border-[#F1F1F1]">
                    <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-[#F3D6DC] text-[#4B5563] font-medium text-left">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Discount</th>
                                <th className="px-6 py-4">Applies To</th>
                                <th className="px-6 py-4">Usage</th>
                                <th className="px-6 py-4">Expiry</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10">
                                        <CommonLoader size="md" text="Loading promo codes..." />
                                    </td>
                                </tr>
                            ) : promoCodes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        No promo codes found.
                                    </td>
                                </tr>
                            ) : (
                                promoCodes.map((item) => {
                                    const percentage = Math.min(
                                        (item.used / item.limit) * 100,
                                        100
                                    );

                                    return (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[#F1F1F1] last:border-none hover:bg-[#FAF6F3] transition bg-white"
                                        >
                                            {/* Code */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#F1F1F1] flex items-center justify-center text-[#3D1126]">
                                                        <RiCoupon2Line size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#111827]">
                                                            {item.code}
                                                        </div>
                                                        <div className="text-xs text-[#6B7280]">{item.id}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Discount */}
                                            <td className="px-6 py-4 text-gray-800 font-medium">{item.discount}</td>

                                            {/* Applies To */}
                                            <td className="px-6 py-4 text-gray-600">
                                                {item.appliesTo}
                                            </td>

                                            {/* Usage */}
                                            <td className="px-6 py-4 w-64">
                                                <div className="text-xs text-gray-600 mb-1 font-medium">
                                                    {item.used} / {item.limit} used
                                                </div>
                                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-[#1A1A1A] h-full rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </td>

                                            {/* Expiry */}
                                            <td className="px-6 py-4 text-gray-800">
                                                {item.expiry}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold
                                                ${item.status === "Active"
                                                            ? "bg-[#DCFCE7] text-[#166534]"
                                                            : item.status === "Expired"
                                                                ? "bg-white text-gray-600 border border-gray-200"
                                                                : "bg-[#FEE2E2] text-[#991B1B]"
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button className="text-[#3B82F6] hover:text-blue-600 transition-colors"
                                                        onClick={async () => {
                                                            setSelectedPromo(item);
                                                            setIsOpen(true);
                                                            await fetchPromoCodePerformance(item._id);
                                                        }}>
                                                        <RiBarChartLine size={18} />
                                                    </button>
                                                    <button className="text-[#4B5563] hover:text-gray-600 transition-colors"
                                                        onClick={() => {
                                                            setSelectedPromo(item);
                                                            setIsEditOpen(true);
                                                        }}>
                                                        <RiPencilLine size={18} />
                                                    </button>
                                                    <button className="text-[#EF4444] hover:text-[#DC2626] transition-colors"
                                                        onClick={() => {
                                                            setSelectedPromo(item)
                                                            setIsDeleteOpen(true)
                                                        }}>
                                                        <RiCloseCircleLine size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    {isOpen && selectedPromo && (
                        <PromoCodePerformance
                            promo={selectedPromo}
                            performance={selectedPromoPerformance}
                            isLoading={isPerformanceLoading}
                            onClose={() => {
                                setIsOpen(false);
                                setSelectedPromo(null);
                            }}
                        />
                    )}


                    {isEditOpen && selectedPromo && (
                        <EditPromoCode
                            promo={selectedPromo}
                            onClose={() => {
                                setIsEditOpen(false);
                                setSelectedPromo(null);
                            }}
                        />
                    )}


                    {isDeleteOpen && selectedPromo && (
                        <DeletePromoCode
                            promo={selectedPromo}
                            onClose={() => {
                                setIsDeleteOpen(false);
                                setSelectedPromo(null);
                            }}
                        />
                    )}
                    {isCreateOpen && (
                        <CreatePromoCode
                            onClose={() => setIsCreateOpen(false)}
                        />
                    )}
                </div>

            </div>
            {!isLoading && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
