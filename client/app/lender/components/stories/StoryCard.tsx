"use client";

import React from 'react';
import ExpandableText from '@/shared/components/ExpandableText';

type Props = {
  title?: string;
  description?: string;
  status?: string;
  storyImage?: string;
  items?: Array<any>;
};

export default function StoryCard({ title, description, status, storyImage, items }: Props) {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Mobile Layout (stacked) */}
      <div className="block md:hidden">
        {/* Image Section - Full width on mobile */}
        <div className="relative h-48 w-full bg-gray-100">
          <img 
            src={storyImage || '/placeholder-story.jpg'} 
            alt={title || 'story cover'} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Section */}
        <div className="p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 mr-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
            </div>
            {status && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap">
                {status}
              </span>
            )}
          </div>
          
          <ExpandableText
            text={description || ''}
            lines={2}
            className="mb-3"
            textClassName="text-sm text-gray-600 leading-relaxed"
            buttonClassName="text-blue-600 text-sm font-medium"
            stopPropagation={false}
          />
          
          {/* Items Section - Mobile */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Items ({items?.length || 0})</p>
            <div className="flex overflow-x-auto pb-3 -mx-3 px-3 space-x-3">
              {items && items.length > 0 ? (
                items.slice(0, 4).map((it: any, idx: number) => (
                  <div key={idx} className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={it?.product?.cover_image || it?.product?.images?.[0] || '/placeholder-item.jpg'}
                        alt={it?.product?.name || 'item'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-700 mt-1 truncate w-24">
                      {it?.product?.name || 'Item'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="w-full py-4 text-center">
                  <p className="text-sm text-gray-500">No items added yet</p>
                </div>
              )}
            </div>
            {items && items.length > 4 && (
              <div className="text-center mt-2">
                <span className="text-xs text-gray-500">+{items.length - 4} more</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout (grid) */}
      <div className="hidden md:flex">
        {/* Image Section - Fixed width on desktop */}
        <div className="w-48 flex-shrink-0">
          <div className="h-full w-full bg-gray-100">
            <img 
              src={storyImage || '/placeholder-story.jpg'} 
              alt={title || 'story cover'} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0 mr-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
              <ExpandableText
                text={description || ''}
                lines={2}
                className="mb-2"
                textClassName="text-sm text-gray-600 leading-relaxed"
                buttonClassName="text-blue-600 text-sm font-medium"
                stopPropagation={false}
              />
            </div>
            {status && (
              <span className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full whitespace-nowrap">
                {status}
              </span>
            )}
          </div>
          
          {/* Items Section - Desktop */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Items ({items?.length || 0})</p>
            <div className="flex flex-wrap gap-3">
              {items && items.length > 0 ? (
                items.slice(0, 6).map((it: any, idx: number) => (
                  <div key={idx} className="group">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 group-hover:border-blue-300 transition-colors">
                      <img
                        src={it?.product?.cover_image || it?.product?.images?.[0] || '/placeholder-item.jpg'}
                        alt={it?.product?.name || 'item'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-700 mt-1 truncate w-20">
                      {it?.product?.name || 'Item'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="w-full py-3 text-center">
                  <p className="text-sm text-gray-500">No items added yet</p>
                </div>
              )}
            </div>
            {items && items.length > 6 && (
              <div className="mt-3">
                <span className="text-sm text-gray-500">+{items.length - 6} more items</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}