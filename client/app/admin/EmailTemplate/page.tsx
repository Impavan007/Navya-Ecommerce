'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMail, FiEdit } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import useEmailTemplateStore from '../store/EmailTemplate/EmailTemplateStore';
import Pagination from '../components/pagination';
import CommonLoader from '../../components/common/CommonLoader';

export default function EmailTemplatePage() {
  const router = useRouter();
  const {
    templates,
    isLoading,
    pagination,
    fetchTemplates
  } = useEmailTemplateStore();

  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTemplates({ search: searchInput, page, limit: 10 });
  }, [page, fetchTemplates]);

  const handleSearch = () => {
    setPage(1);
    fetchTemplates({ search: searchInput, page: 1, limit: 10 });
  };

  return (
    <div className="min-h-screen bg-[#FAF6F3] px-[40px] py-2">
      <div >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-8">
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-[380px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#D1D5DB] text-[14px] focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[#111827] text-white rounded-xl text-sm font-medium hover:bg-black transition shadow-sm"
            >
              Search
            </button>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/EmailTemplate/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] text-white text-[14px] font-medium hover:bg-black transition"
            >
              <FiPlus size={16} />
              Email Templates
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="mt-8  border border-[#F1F1F1] bg-[#F3D6DC] overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-5 px-8 py-4 text-[13px] font-semibold text-[#6B7280] bg-[#E9C8CE]">
            <div className="flex items-center">Template Name</div>
            <div className="flex items-center">Trigger</div>
            <div className="flex items-center">Last Updated</div>
            <div className="flex items-center">Status</div>
            <div className="flex items-center justify-end">Actions</div>
          </div>

          {/* Body */}
          <div className="divide-y divide-[#F1F1F1]">
            {(isLoading || (templates.length === 0 && !pagination)) ? (
              <div className="bg-white py-20">
                <CommonLoader pageCenter />
              </div>
            ) : templates.length > 0 ? (
              templates.map((template: any) => (
                <div
                  key={template.id}
                  className="grid grid-cols-1 md:grid-cols-5 items-center px-8 py-6 bg-[#FFFFFF]"
                >
                  {/* Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F1F1F1] border border-[#F1F1F1]">
                      <FiMail className="text-[#7C4B52]" size={18} />
                    </div>
                    <span className="text-[15px] font-medium text-[#1F2937]">
                      {template.name}
                    </span>
                  </div>

                  {/* Trigger */}
                  <div className="text-[14px] text-[#374151] mt-3 md:mt-0">
                    {template.trigger}
                  </div>

                  {/* Last Updated */}
                  <div className="text-[14px] text-[#374151] mt-3 md:mt-0">
                    {template.lastUpdated}
                  </div>

                  {/* Status */}
                  <div className="mt-3 md:mt-0">
                    <span className={`inline-flex px-3 py-1 text-[12px] font-medium ${template.status === "Active" ? "bg-[#CDEED6] text-[#1B5E20]" : "bg-gray-100 text-gray-500"} rounded-full`}>
                      {template.status}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="md:text-right mt-4 md:mt-0">
                    <button
                      onClick={() => router.push(`/admin/EmailTemplate/${template.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F2937] text-white text-[13px] font-medium hover:bg-black transition"
                    >
                      <FiEdit size={14} />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white py-20 text-center text-gray-500">
                No templates found.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination && !isLoading && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
