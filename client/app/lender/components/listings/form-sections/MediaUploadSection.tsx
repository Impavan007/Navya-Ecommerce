'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLenderStore } from '../../../stores/Listing/lenderListingstore';

interface MediaUploadSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  mode?: 'add' | 'edit';
}

export default function MediaUploadSection({ formData, setFormData, mode }: MediaUploadSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const deletePhotoAPI = useLenderStore((state) => state.deletePhoto);

  const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB total limit
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file limit

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  // Calculate total size of current photos
  const getCurrentTotalSize = (): number => {
    if (!formData.photos) return 0;
    
    return formData.photos.reduce((total: number, photo: any) => {
      if (photo.file) {
        return total + photo.file.size;
      }
      return total;
    }, 0);
  };

  const handleFiles = (files: File[]) => {
    if (!formData.photos) formData.photos = [];

    // Check maximum photo count
    if (files.length + formData.photos.length > 6) {
      toast.error(`Maximum 6 photos allowed. You have ${formData.photos.length} photos already.`);
      return;
    }

    const currentTotalSize = getCurrentTotalSize();
    const remainingSpace = MAX_TOTAL_SIZE - currentTotalSize;
    
    if (remainingSpace <= 0) {
      toast.error(`Total size limit of ${MAX_TOTAL_SIZE / (1024 * 1024)}MB reached. Please delete some photos to add new ones.`);
      return;
    }

    let totalNewSize = 0;
    const validFiles: File[] = [];

    // Filter valid files
    for (const file of files) {
      // Check individual file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Skipping.`);
        continue;
      }

      // Check if adding this file would exceed total limit
      if (totalNewSize + file.size <= remainingSpace) {
        totalNewSize += file.size;
        validFiles.push(file);
      } else {
        toast.error(`"${file.name}" would exceed total size limit.`);
        break;
      }
    }

    if (validFiles.length === 0) {
      return; // No valid files to add
    }

    // Check available slots
    const availableSlots = 6 - formData.photos.length;
    const filesToAdd = validFiles.slice(0, availableSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.error(`Only ${filesToAdd.length} photos added. Maximum 6 photos allowed.`);
    }

    if (filesToAdd.length < files.length) {
      const skipped = files.length - filesToAdd.length;
      toast.error(`${skipped} file(s) skipped due to size or count limits.`);
    }

    const newPhotos = filesToAdd.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      file,
      isCover: formData.photos.length === 0 && idx === 0, // first image is cover if none
      isNew: true,
    }));

    setFormData({ ...formData, photos: [...(formData.photos || []), ...newPhotos] });
    
    // Show size usage info
    const newTotalSize = currentTotalSize + totalNewSize;
    const usagePercentage = (newTotalSize / MAX_TOTAL_SIZE) * 100;
    const sizeInMB = newTotalSize / (1024 * 1024);
    const totalLimitMB = MAX_TOTAL_SIZE / (1024 * 1024);
    
    if (usagePercentage > 90) {
      toast.success(`Photos added. Total size: ${sizeInMB.toFixed(2)}MB/${totalLimitMB}MB (${usagePercentage.toFixed(1)}% used)`);
    } else if (newPhotos.length > 0) {
      toast.success(`${newPhotos.length} photo(s) added successfully`);
    }
  };

  const setCoverPhoto = (photoId: string) => {
    if (!formData.photos) return;
    const updatedPhotos = formData.photos.map((photo: any) => ({
      ...photo,
      isCover: photo.id === photoId,
    }));
    setFormData({ ...formData, photos: updatedPhotos });
  };

  const handleDeletePhoto = async (photo: any) => {
    if (!formData.photos) return;

    // Local deletion for new photos or if not in edit mode
    // (Note: Drafts handle their own cleanup on next step or final submit)
    const isNewPhoto = photo.isNew || photo.file;
    
    if (isNewPhoto || mode !== 'edit') {
      const updatedPhotos = formData.photos.filter((p: any) => 
        p.id ? p.id !== photo.id : p !== photo
      );
      setFormData({ photos: updatedPhotos });
      return;
    }

    // Existing server photo in EDIT mode: call API to delete
    try {
      await deletePhotoAPI(photo);
    } catch (err) {
      console.error('Error deleting photo from server:', err);
    }
  };

  // Calculate and display current size usage
  const currentTotalSize = getCurrentTotalSize();
  const sizeInMB = currentTotalSize / (1024 * 1024);
  const totalLimitMB = MAX_TOTAL_SIZE / (1024 * 1024);
  const usagePercentage = (currentTotalSize / MAX_TOTAL_SIZE) * 100;

  const photos = formData.photos || [];

  return (
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Photos</h3>
        <p className="text-gray-600 text-sm mb-6">
          High-quality photos are essential for attracting renters. Upload at least 2 and up to 6 photos showcasing your item.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="max-w-md mx-auto">
          <i className="ri-image-add-line text-4xl text-gray-400 mb-4 w-16 h-16 mx-auto flex items-center justify-center"></i>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Photos</h4>
          <p className="text-gray-600 text-sm mb-4">
            Drag and drop your photos here, or click to browse
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-yellow-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-upload-2-line mr-2 w-4 h-4 flex items-center justify-center"></i>
            Choose Files
          </label>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG up to 10MB each. Maximum 6 photos. Total size limit: 10MB.
          </p>
          
          {/* Size Usage Indicator */}
          {photos.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Storage: {sizeInMB.toFixed(2)}MB / {totalLimitMB}MB</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    usagePercentage > 90 ? 'bg-red-500' : 
                    usagePercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Uploaded Photos ({photos.length}/6) - Total Size: {sizeInMB.toFixed(2)}MB/{totalLimitMB}MB
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo: any, index: number) => (
              <div key={photo.id || photo} className="relative group">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={photo.url || photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Photo Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCoverPhoto(photo.id)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                      photo.isCover
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {photo.isCover ? 'Cover Photo' : 'Set as Cover'}
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo)}
                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <i className="ri-delete-bin-line w-3 h-3 flex items-center justify-center"></i>
                  </button>
                </div>

                {/* Size Info */}
                {photo.file && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {(photo.file.size / (1024 * 1024)).toFixed(2)}MB
                  </div>
                )}

                {/* Cover Badge */}
                {photo.isCover && (
                  <div className="absolute top-2 left-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}