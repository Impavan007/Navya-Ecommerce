
'use client';

import { useState } from 'react';
import AddListingForm from '../../components/listings/AddListingForm';

export default function AddListingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-[40px] py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-['Canela'] font-bold text-[#111827]">Add New Listing</h1>
            <p className="text-[#4B5563] font-roboto text-[16px] mt-1">Create a new rental listing for your fashion item</p>
          </div>

          <AddListingForm />
        </div>
    </div>
  );
}
