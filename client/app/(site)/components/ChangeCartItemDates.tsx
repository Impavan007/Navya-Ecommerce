"use client";

import { useEffect, useMemo, useState } from "react";
import SimpleCalendar from "./SimpleCalendar";
import type { ApiCartItem } from "../types/api";

interface ChangeCartItemDatesProps {
  isOpen: boolean;
  onClose: () => void;
  item: ApiCartItem;
  blockedDates?: Array<{ start_date: string; end_date: string }>;
  onSave: (data: { size: string; startDate: string; endDate: string; rentalDays: number }) => Promise<void> | void;
}

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

import { BaseModal, ModalHeader, ModalBody, ModalFooter } from "./Modal";

export default function ChangeCartItemDates({ isOpen, onClose, item, blockedDates = [], onSave }: ChangeCartItemDatesProps) {
  const periods = [4, 7, 14, 30] as const;
  const [selectedDays, setSelectedDays] = useState<number>(4);
  const [selectedSize, setSelectedSize] = useState<string>(item.size || "");
  const initialStart = useMemo(() => new Date(item.start_date), [item.start_date]);
  const initialEnd = useMemo(() => new Date(item.end_date), [item.end_date]);
  const [range, setRange] = useState<{ startDate: Date; endDate: Date } | null>({ startDate: initialStart, endDate: initialEnd });
  const [saving, setSaving] = useState(false);

  // Merge blocked dates from product and from other cart items
  const mergedBlockedDates = useMemo(() => {
    const productBlocked = item.product?.blocked_dates || [];
    const cartBlocked = blockedDates || [];
    return [...productBlocked, ...cartBlocked];
  }, [item.product?.blocked_dates, blockedDates]);

  useEffect(() => {
    // Initialize selectedDays from duration if matches one of the allowed periods
    if (item.duration && periods.includes(item.duration as any)) {
      setSelectedDays(item.duration);
    } else {
      setSelectedDays(4);
    }
    setSelectedSize(item.size || "");
    setRange({ startDate: new Date(item.start_date), endDate: new Date(item.end_date) });
  }, [item]);

  const handleSave = async () => {
    if (!range || !selectedSize) return;
    try {
      setSaving(true);
      await onSave({
        size: selectedSize,
        startDate: formatYMD(new Date(range.startDate)),
        endDate: formatYMD(new Date(range.endDate)),
        rentalDays: selectedDays,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton>
      <ModalHeader title="Edit rental" onClose={onClose} />
      <ModalBody>
        <div className="space-y-6">
          {/* Period selector */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Select rental period</p>
            <div className="flex flex-wrap gap-2">
              {periods.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDays(d)}
                  className={`px-6 py-2 border transition-all ${selectedDays === d ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-black'}`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 outline-none focus:border-black transition-colors bg-transparent"
            >
              {(item.product?.size || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Calendar */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Select dates</p>
            <div className="border border-gray-100 p-4 bg-white/50">
              <SimpleCalendar rentalDays={selectedDays} onRangeChange={setRange} blockedDates={mergedBlockedDates} />
            </div>
            {range && (
              <p className="text-sm text-[#3D1126] mt-3 font-poppins">
                Selected: <span className="text-black font-semibold">{range.startDate.toDateString()}</span> → <span className="text-black font-semibold">{range.endDate.toDateString()}</span>
              </p>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-8 py-3 border border-black font-poppins text-[14px] font-medium text-black hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !range || !selectedSize}
          className="px-8 py-3 bg-black text-white font-poppins text-[14px] font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </ModalFooter>
    </BaseModal>
  );
}

