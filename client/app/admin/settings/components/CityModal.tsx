'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CommonModal from '@/app/components/common/CommonModal';

export interface CityFormData {
    name: string;
    state: string;
    is_active: boolean;
}

interface CityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CityFormData) => Promise<boolean>;
    initialData?: CityFormData | null;
    isSaving?: boolean;
}

export default function CityModal({ isOpen, onClose, onSave, initialData, isSaving = false }: CityModalProps) {
    const [formData, setFormData] = useState<CityFormData>({
        name: '',
        state: '',
        is_active: true,
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({ name: '', state: '', is_active: true });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.state.trim()) {
            toast.error("Name and State are required fields.");
            return;
        }
        const success = await onSave(formData);
        if (success) onClose();
    };

    return (
        <CommonModal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit City' : 'Add New City'} size="sm" loading={isSaving}>
            <p className='text-[#6B7280] text-[12px] -mt-2 mb-6 font-poppins'>Add a new city to the platform.</p>
            <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-roboto font-semibold text-[#111827] mb-1">
                            City Name <span className="text-red-500">*</span>
                        </label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Jaipur" className="w-full px-4 py-2.5 rounded-md border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-roboto font-semibold text-[#111827] mb-1">
                            State/Region <span className="text-red-500">*</span>
                        </label>
                        <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="e.g. Rajasthan" className="w-full px-4 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-xs" />
                    </div>
                    <div>
                        <label className="block text-sm font-roboto font-semibold text-[#111827] mb-2">Status</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" checked={formData.is_active === true} onChange={() => setFormData({ ...formData, is_active: true })} className="w-4 h-4 text-[#767676] focus:ring-black" />
                                <span className="text-sm text-[#374151] font-poppins">Active - Visible To Users</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="status" checked={formData.is_active === false} onChange={() => setFormData({ ...formData, is_active: false })} className="w-4 h-4 text-black focus:ring-black" />
                                <span className="text-sm text-[#374151] font-poppins">Inactive - hidden</span>
                            </label>
                        </div>
                        <p className="text-[12px] text-gray-500 mt-2">Only active cities appear in search and listing filters.</p>
                    </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-md bg-[#F3F4F6] border text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-5 py-2.5 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black transition disabled:opacity-50 flex items-center gap-2">
                        {isSaving && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                        {initialData ? 'Save Changes' : 'Add City'}
                    </button>
                </div>
            </form>
        </CommonModal>
    );
}