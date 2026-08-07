'use client';

import React, { useEffect, useState } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiMapPin, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useCityStore, { City } from '../../store/cities/CityStore';
import CommonLoader from '../../../components/common/CommonLoader';
import CityModal, { CityFormData } from './CityModal';
import Pagination from '../../components/pagination';
import DeleteModal from '../../components/DeleteModal';

export default function CityManagement() {
    const { cities, isLoading, isSaving, pagination, stats, fetchCities, createCity, updateCity, deleteCity } = useCityStore();

    const [isExpanded, setIsExpanded] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cityToDelete, setCityToDelete] = useState<City | null>(null);

    const handleSearch = () => {
        setAppliedSearch(searchInput.trim());
        setPage(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Initial and filtered fetch
    useEffect(() => {
        fetchCities({ search: appliedSearch, status: statusFilter, page, limit: 10 });
    }, [fetchCities, appliedSearch, statusFilter, page]);

    // Derived statistics
    const totalCities = stats?.totalCities || pagination?.totalItems || cities.length;
    const activeCount = stats?.activeCities ?? cities.filter(c => c.is_active).length;
    const inactiveCount = stats?.inactiveCities ?? cities.filter(c => !c.is_active).length;

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setPage(1);
    };

    const handleEditClick = (city: City) => {
        setEditingCity(city);
        setModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingCity(null);
        setModalOpen(true);
    };

    const handleDeleteClick = (city: City) => {
        setCityToDelete(city);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!cityToDelete) return;
        const success = await deleteCity(cityToDelete.id);
        if (success) {
            toast.success(`${cityToDelete.name} deleted successfully!`);
            setIsDeleteModalOpen(false);
            setCityToDelete(null);
            fetchCities({ search: appliedSearch, status: statusFilter, page, limit: 10 });
        }
    };

    const handleSaveCity = async (data: CityFormData) => {
        let success = false;
        if (editingCity) {
            success = await updateCity(editingCity.id, data);
            if (success) toast.success("City updated successfully!");
        } else {
            success = await createCity(data);
            if (success) toast.success("City added successfully!");
        }

        if (success) {
            fetchCities({ search: appliedSearch, status: statusFilter, page, limit: 10 });
        }
        return success;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toISOString().split('T')[0];
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8 font-poppins overflow-hidden">
            {/* Header / Accordion Toggle */}
            {/* <div
                className="flex justify-between items-center p-6 cursor-pointer hover:bg-[#F2EDEA] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-1 h-6 bg-[#D8B4A0] rounded-full"></div>
                    <h2 className="text-[20px] font-semibold text-gray-900 font-playfair">City & Location Management</h2>
                </div>
                {isExpanded ? <FiChevronUp size={20} className="text-gray-500" /> : <FiChevronDown size={20} className="text-gray-500" />}
            </div> */}

            {/* Expandable Body */}

            <div className="px-6 pb-6 border-t border-gray-200 pt-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-5">
                        <p className="text-[13px] font-medium text-[#6B7280] mb-1">Total Cities</p>
                        <p className="text-[24px] font-bold text-[#111827]">{totalCities}</p>
                    </div>
                    <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-5">
                        <p className="text-[13px] font-medium text-[#16A34A] mb-1">Active</p>
                        <p className="text-[24px] font-bold text-[#15803D]">{activeCount}</p>
                    </div>
                    <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-5">
                        <p className="text-[13px] font-medium text-[#6B7280] mb-1">Inactive</p>
                        <p className="text-[24px] font-bold text-[#6B7280]">{inactiveCount}</p>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <div className="relative w-full lg:w-80 flex">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                                <input
                                    type="text"
                                    placeholder="Search cities, regions, countries..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-l-lg border border-[#E5E7EB] bg-[#F9FAFB] text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-[#1A1A1A] text-white px-4 py-2.5 rounded-r-lg text-xs font-medium hover:bg-black transition-colors"
                            >
                                Search
                            </button>
                        </div>
                        <div className="flex bg-[#F3F4F6] p-1 rounded-lg w-full sm:w-auto">
                            {['All', 'Active', 'Inactive'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusFilter(status)}
                                    className={`px-6 py-2 rounded-md text-[13px] font-medium transition-all ${statusFilter === status
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddClick}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] text-[#FFFFFF] rounded-lg text-sm font-medium hover:bg-black transition-colors"
                    >
                        <FiPlus size={16} />
                        Add City
                    </button>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b border-gray-200 text-[12px] font-medium text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">City</th>
                                    <th className="px-6 py-4">State</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Added</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8">
                                            <CommonLoader size="md" text="Loading cities..." />
                                        </td>
                                    </tr>
                                ) : cities.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No cities found.
                                        </td>
                                    </tr>
                                ) : (
                                    cities.map((city) => (
                                        <tr key={city.id} className="hover:bg-gray-50 transition-colors">
                                            {/* City Name */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#D97706]">
                                                        <svg width="15" height="20" viewBox="0 0 15 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M7.28914 16.3359L3.58047 12.6259C2.90404 11.957 2.4492 11.1637 2.21595 10.2459C1.9827 9.35927 1.9827 8.4726 2.21595 7.58594C2.4492 6.66816 2.9021 5.87288 3.57463 5.2001C4.24717 4.52733 5.04217 4.07038 5.95962 3.82927C6.84597 3.60371 7.73232 3.60371 8.61867 3.82927C9.53612 4.07038 10.3311 4.52733 11.0036 5.2001C11.6762 5.87288 12.1291 6.66816 12.3623 7.58594C12.5956 8.4726 12.5956 9.35927 12.3623 10.2459C12.1291 11.1637 11.6742 11.957 10.9978 12.6259L7.28914 16.3359ZM10.1698 11.7976C10.6985 11.2765 11.0561 10.662 11.2427 9.95427C11.4216 9.26205 11.4216 8.56983 11.2427 7.8776C11.0561 7.16983 10.7004 6.55344 10.1756 6.02844C9.6508 5.50344 9.03463 5.1476 8.3271 4.96094C7.63513 4.78205 6.94315 4.78205 6.25118 4.96094C5.54365 5.1476 4.92748 5.50344 4.40267 6.02844C3.87786 6.55344 3.52215 7.16983 3.33555 7.8776C3.15673 8.56983 3.15673 9.26205 3.33555 9.95427C3.52215 10.662 3.8798 11.2765 4.4085 11.7976L7.28914 14.6909L10.1698 11.7976ZM7.28914 10.0826C7.07922 10.0826 6.88484 10.0301 6.70602 9.9251C6.52719 9.8201 6.3853 9.67816 6.28033 9.49927C6.17537 9.32038 6.12289 9.12594 6.12289 8.91594C6.12289 8.70594 6.17537 8.51149 6.28033 8.3326C6.3853 8.15372 6.52719 8.01177 6.70602 7.90677C6.88484 7.80177 7.07922 7.74927 7.28914 7.74927C7.49907 7.74927 7.69344 7.80177 7.87227 7.90677C8.05109 8.01177 8.19298 8.15372 8.29795 8.3326C8.40291 8.51149 8.45539 8.70594 8.45539 8.91594C8.45539 9.12594 8.40291 9.32038 8.29795 9.49927C8.19298 9.67816 8.05109 9.8201 7.87227 9.9251C7.69344 10.0301 7.49907 10.0826 7.28914 10.0826Z" fill="#3D1126" />
                                                        </svg>

                                                    </div>
                                                    <span className="text-[14px] font-semibold text-gray-900">
                                                        {city.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* State */}
                                            <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                                                {city.state}
                                            </td>

                                            {/* Status */}
                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${city.is_active ? 'bg-[#DCFCE7]' : 'bg-gray-100'
                                                    }`}>
                                                    <div className={`w-2 h-2 rounded-full ${city.is_active ? 'bg-[#10B981]' : 'bg-gray-400'}`}></div>
                                                    <span className={`text-[13px] font-medium ${city.is_active ? 'text-[#059669]' : 'text-gray-500'}`}>
                                                        {city.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Added Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500">
                                                {formatDate(city.created_at)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(city)}
                                                        className="text-gray-400 hover:text-gray-700 transition"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(city)}
                                                        className="text-gray-400 hover:text-red-600 transition"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && !isLoading && (
                        <div className="border-t border-gray-200 p-4 flex justify-center bg-[#F9FAFB]">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={(p: number) => setPage(p)}
                            />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100">
                    <FiInfo size={14} className="text-[#9CA3AF] shrink-0" />
                    <p className="text-[#9CA3AF] text-[12px]">Only active cities appear in user-facing search filters and listing location options. Click a status badge to toggle it instantly.</p>
                </div>
            </div>


            {/* Modal */}
            <CityModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveCity}
                isSaving={isSaving}
                initialData={editingCity ? { name: editingCity.name, state: editingCity.state, is_active: editingCity.is_active } : null}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCityToDelete(null);
                }}
                onConfirm={confirmDelete}
                isDeleting={isSaving}
                title="Delete City"
                description={`Are you sure you want to delete ${cityToDelete?.name}? This action cannot be undone.`}
            />
        </div>
    );
}
