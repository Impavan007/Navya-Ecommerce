"use client";

import Image from "next/image";
import CommonModal from '../../../components/common/CommonModal';

interface StoryPreviewModalProps {
  onClose: () => void;
  storyTitle: string;
  storyDescription: string;
  coverImage: File | null;
  selectedItems: any[];
}

export default function StoryPreviewModal({
  onClose,
  storyTitle,
  storyDescription,
  coverImage,
  selectedItems,
}: StoryPreviewModalProps) {
  const imageUrl = coverImage ? URL.createObjectURL(coverImage) : "";
  return (
    <CommonModal
      isOpen={true}
      onClose={onClose}
      title="Story Preview"
      size="md"
    >
      <div className="flex flex-col h-full font-playfair">

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 font-playfair  flex-grow">
          {/* Cover Image */}
          {imageUrl && (
            <div className="w-full h-60 relative rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt="Cover Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Story Details */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {storyTitle || "Untitled Story"}
            </h3>
            <p className="text-gray-700 text-base leading-relaxed">
              {storyDescription ||
                "No description provided. Add some context to your story."}
            </p>
          </div>
        </div>
      </div>
    </CommonModal>
  );
}
