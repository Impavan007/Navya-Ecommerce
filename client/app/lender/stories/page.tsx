'use client';

import { useState } from 'react';
import AddItemsModal from '../components/stories/ItemModal';
import { useStoryStore } from '../stores/Story/storyStore';
import StoryPreviewModal from './Components/StoryPreiviewModal';
import { toast } from 'react-hot-toast';
import StoryTable from '../components/stories/StoryTable';

export default function AddStoryForm() {
  const [storyTitle, setStoryTitle] = useState('');
  const [showStories, setShowStories] = useState(false);
  const [storyDescription, setStoryDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const { createStory } = useStoryStore();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setCoverImage(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) setCoverImage(file);
  };

  const handleViewStories = () => {
    setShowStories(true);
  };

  const handlePublishStory = async () => {
    if (!storyTitle || !storyDescription || !coverImage || selectedItems.length === 0) {
      toast.error('Please fill all required fields.');
      return;
    }

    setPublishLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', storyTitle);
      formData.append('description', storyDescription);
      formData.append('items', JSON.stringify(selectedItems.map((item: any) => item?._id ?? item)));
      formData.append('status', 'Active');
      formData.append('storyImage', coverImage);

      const res = await createStory(formData);
      toast.success(res?.data?.message || 'Story published successfully!');

      // Reset form
      setStoryTitle('');
      setStoryDescription('');
      setCoverImage(null);
      setSelectedItems([]);
    } catch (error: any) {
      console.error('Error publishing story:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to publish story. Please try again.';
      toast.error(msg);
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-canela font-semibold text-[#3D1126]">
                {showStories ? 'Your Stories' : 'Add a New Story'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 max-w-2xl">
                {showStories
                  ? 'Manage your story collections and create new ones.'
                  : 'Create a theme collection of your listings for Borrowers to explore.'
                }
              </p>
            </div>
            <div className="flex-shrink-0">
              {!showStories ? (
                <button
                  onClick={handleViewStories}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-poppins hover:bg-gray-900 transition-colors active:scale-[0.98]"
                >
                  + Add Story
                </button>
              ) : (
                <button
                  onClick={() => setShowStories(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-poppins hover:bg-gray-50 transition-colors active:scale-[0.98]"
                >
                  View Stories
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {showStories ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div >
              {/* Story Information Section */}
              <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 rounded-xl">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 font-canela">
                  Story Information
                </h2>
                <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                  Tell Borrowers about your curated collection and what makes it special.
                </p>

                {/* Story Title */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">
                    Story Title *
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                    Keep it short and catchy – this is your story's headline.
                  </p>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair text-base sm:text-lg"
                    placeholder="Enter story title"
                  />
                </div>

                {/* Story Description */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2 font-poppins">
                    Story Description *
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                    Describe your story theme, inspiration, and what Borrowers can expect.
                    Keep it within 2-3 sentences for a quick read.
                  </p>
                  <textarea
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 font-playfair text-sm sm:text-base resize-none"
                    placeholder="Enter story description"
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Example: 'Red tones for confident women – featuring structured silhouettes and rich textures. Perfect for making a statement at work or evening events.'
                  </p>
                </div>
              </div>

              {/* Cover Image Section */}
              <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 rounded-xl">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 font-poppins">
                  Cover Image *
                </h2>
                <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                  Upload a high-quality image that represents your story.
                </p>

                {coverImage ? (
                  <div className="border border-gray-200 rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={URL.createObjectURL(coverImage)}
                          alt="Cover preview"
                          className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{coverImage.name}</p>
                        <p className="text-sm text-gray-500">{(coverImage.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => document.getElementById('cover-image-upload')?.click()}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-poppins"
                        >
                          Change
                        </button>
                        <button
                          onClick={() => setCoverImage(null)}
                          className="flex-1 sm:flex-none px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-poppins"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-gray-400 transition-colors active:bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('cover-image-upload')?.click()}
                  >
                    <div className="space-y-2 sm:space-y-3">
                      <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">
                          Drag and drop your cover image here
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          or click to browse files
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Recommended: 1200×600px, max 5MB, JPG or PNG
                      </p>
                    </div>
                  </div>
                )}

                <input
                  id="cover-image-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                />

                {/* Cover Image Tips */}
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3 font-poppins">
                    Cover Image Tips
                  </h3>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 list-disc list-inside pl-2">
                    <li>Use high-quality, well-lit images that explain your story's mood</li>
                    <li>Include 2-3 key items from your collection in the image</li>
                    <li>Keep background clean and minimal to highlight the items</li>
                    <li>Ensure the image looks good on both large banner and thumbnail</li>
                  </ul>
                </div>
              </div>

              {/* Add Items Section */}
              <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 rounded-xl">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 font-poppins">
                  Add Items to Your Story *
                </h2>
                <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                  Select 3–10 active listings for your story.
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-6 lg:p-8 text-center">
                  {selectedItems.length === 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">No Items Added Yet</p>
                        <p className="text-xs text-gray-500 mt-1">Select items to build your story collection</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">{selectedItems.length} item(s) selected</p>
                        <p className="text-xs text-gray-500 mt-1">Click 'Add Items' to manage your selection</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-3 sm:mt-4 bg-gray-800 text-white px-4 py-2.5 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins transition-colors active:scale-[0.98] w-full sm:w-auto text-sm sm:text-base"
                  >
                    Add Items
                  </button>
                </div>
              </div>

              {/* Visibility & Publish Section */}
              <div className="bg-white shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 rounded-xl">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    disabled={publishLoading}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    Preview Story
                  </button>
                  <button
                    onClick={handlePublishStory}
                    disabled={publishLoading}
                    className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 font-poppins transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center"
                  >
                    {publishLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Publishing...
                      </>
                    ) : (
                      'Publish Story'
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <StoryTable />
        )}

        {/* Include the modals */}
        {isModalOpen && (
          <AddItemsModal
            onClose={() => setIsModalOpen(false)}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        )}
        {isPreviewModalOpen && (
          <StoryPreviewModal
            onClose={() => setIsPreviewModalOpen(false)}
            storyTitle={storyTitle}
            storyDescription={storyDescription}
            coverImage={coverImage}
            selectedItems={selectedItems}
          />
        )}
      </div>
    </div>
  );
}