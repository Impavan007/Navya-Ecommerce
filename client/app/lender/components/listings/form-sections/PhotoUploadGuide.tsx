'use client';

import React from 'react';

export default function PhotoUploadGuide() {
  return (
    <div className="font-poppins bg-white  p-6 border border-gray-200 shadow-sm">
      <h2 className="font-['Playfair_Display'] text-2xl text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Photo Upload Guide
      </h2>
      <ul className="list-disc pl-5 space-y-3 text-gray-700 leading-relaxed">
        <li>
          <span className="font-semibold">High-Quality Photos:</span> Upload clear, well-lit images from different angles.
        </li>
        <li>
          <span className="font-semibold">Show Details:</span> Include close-ups of fabric, stitching, or buttons.
        </li>
        <li>
          <span className="font-semibold">Simple Background:</span> Use a clean, neutral background to highlight your item.
        </li>
        <li>
          <span className="font-semibold">Accepted File Formats:</span> JPG, PNG, or MP4 (max 5MB).
        </li>
        <li>
          <span className="font-semibold">Number Of Photos:</span> Upload at least 2-6 images for better visibility.
        </li>
        <li>
          <span className="font-semibold">Preview And Edit:</span> Preview your photos before publishing. Replace or delete as needed.
        </li>
      </ul>
    </div>
  );
}
