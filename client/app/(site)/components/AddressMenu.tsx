"use client";

import React, { useEffect, useRef } from "react";

interface AddressMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AddressMenu({
  isOpen,
  onClose,
  onEdit,
  onDelete
}: AddressMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-0 mt-1 bg-white box-border flex flex-col items-start px-0 py-[8px] shadow-[0px_30px_84px_0px_rgba(19,10,46,0.08),0px_8px_32px_0px_rgba(19,10,46,0.07),0px_3px_14px_0px_rgba(19,10,46,0.03),0px_1px_3px_0px_rgba(19,10,46,0.13)]  min-w-[120px] z-50"
    >
      {/* Edit Option */}
      <div 
        className="bg-[#1A1A1A] box-border flex gap-[8px] items-start overflow-clip px-[16px] py-[4px] relative shrink-0 w-full cursor-pointer hover:bg-[#1a1719] transition-colors"
        onClick={handleEdit}
      >
        <p className="font-['Inter'] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f8f7fa] text-[14px]">
          Edit
        </p>
      </div>
      
      {/* Delete Option */}
      <div 
        className="box-border flex gap-[8px] items-start overflow-clip px-[16px] py-[4px] relative shrink-0 w-full cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleDelete}
      >
        <p className="font-['Inter'] font-normal leading-[24px] not-italic relative shrink-0 text-[#19181a] text-[14px]">
          Delete
        </p>
      </div>
    </div>
  );
}
