"use client";

import CityManagement from "../settings/components/CityManagement";

export default function CityManagementPage() {
    return (
        <div className="py-5 px-8">
            <div className=" mx-auto ">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold text-[#111827] font-canela">City & Location Management</h1>
                    {/* <p className="text-gray-500 mt-1 font-playfair">
                            Manage cities, regions, and location-based settings for the platform
                        </p> */}
                </div>
                <CityManagement />
            </div>
        </div>
    );
}
