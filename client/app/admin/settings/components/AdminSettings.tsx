'use client';

import { useEffect, useState } from 'react';
import usePageSettingsStore from '../../store/Pagesettings/PageSettingsstore';
import toast from 'react-hot-toast';
import CommonLoader from '@/app/components/common/CommonLoader';

export default function SettingsPage() {
  const { settings, setSettings, fetchSettings, updateSettings } =
    usePageSettingsStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getImageUrl = (image: any) => {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('http') || image.startsWith('data:')) return image;
      // Extract domain from API_BASE_URL or use the known dev tunnel domain
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.split('/api/v1')[0] || 'https://8r859v3d-5000.inc1.devtunnels.ms';
      return `${baseUrl}/${image}`;
    }
    return null;
  };

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        await fetchSettings();
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [fetchSettings]);

  const handleInputChange = (field: string, value: string) => {
    setSettings({ [field]: value });
  };

  const handleSocialChange = (field: keyof typeof settings.social_links, value: string) => {
    setSettings({
      social_links: { ...settings.social_links, [field]: value },
    });
  };

  const handleMetaChange = (field: keyof typeof settings.meta_title, value: string) => {
    setSettings({
      meta_title: { ...settings.meta_title, [field]: value },
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSettings({ logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSettings({ favicon: file });
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings();
      toast.success('Settings updated successfully!');
      // Clear local object URLs to prevent memory leaks
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
      setLogoPreview(null);
      setFaviconPreview(null);
      fetchSettings();
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf9] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <CommonLoader size="lg" className="mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf9] py-[40px] font-poppins">
      <div className=" mx-auto px-6">
        {/* Settings Section Container */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-12">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">General Settings</h2>
            <form onSubmit={handleSubmit}>
              {/* Logo & Favicon Management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Logo Management */}
                <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo Management</h2>
                  <div className="flex items-center space-x-6">
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors bg-[#fdfbf9] overflow-hidden relative group rounded-lg">
                      {logoPreview || getImageUrl(settings.logo) ? (
                        <img src={logoPreview || (getImageUrl(settings.logo) as string)} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <i className="ri-image-add-line text-2xl text-gray-400 mb-2"></i>
                          <span className="text-xs text-gray-500">Upload Logo</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Change Logo</span>
                      </div>
                    </label>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Site Logo</p>
                      <p className="text-xs text-gray-500">Recommended: 512x512px. PNG/JPG/SVG.</p>
                    </div>
                  </div>
                </div>

                {/* Favicon Management */}
                <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Favicon Management</h2>
                  <div className="flex items-center space-x-6">
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors bg-[#fdfbf9] overflow-hidden relative group rounded-lg">
                      {faviconPreview || getImageUrl(settings.favicon) ? (
                        <img src={faviconPreview || (getImageUrl(settings.favicon) as string)} alt="Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <i className="ri-image-add-line text-2xl text-gray-400 mb-2"></i>
                          <span className="text-xs text-gray-500">Upload Favicon</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Change Favicon</span>
                      </div>
                    </label>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Site Favicon</p>
                      <p className="text-xs text-gray-500">Recommended: 32x32px. PNG/ICO.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Details</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={settings.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Title"
                    className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2"
                  />
                  <textarea
                    value={settings.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2"
                  />
                </div>
              </div>

              {/* Company Info */}
              <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <input
                    type="url"
                    value={settings.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="Website URL"
                    className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2"
                  />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email Address"
                    className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2"
                  />
                </div>
              </div>

              {/* Notification Banner */}
              <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Banner</h2>
                <textarea
                  value={settings.notification_banner}
                  onChange={(e) => handleInputChange('notification_banner', e.target.value)}
                  className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2 resize-none"
                />
              </div>

              {/* Social Links */}
              <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
                {(['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok'] as const).map((key) => (
                  <input
                    key={key}
                    type="url"
                    value={settings.social_links[key]}
                    onChange={(e) => handleSocialChange(key, e.target.value)}
                    placeholder={`${key} URL`}
                    className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2 mb-3"
                  />
                ))}
              </div>

              {/* Meta Details */}
              <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Meta Details</h2>
                <input
                  type="text"
                  placeholder="Meta Title"
                  value={settings.meta_title.title}
                  onChange={(e) => handleMetaChange('title', e.target.value)}
                  className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2 mb-3"
                />
                <textarea
                  placeholder="Meta Description"
                  value={settings.meta_title.description}
                  onChange={(e) => handleMetaChange('description', e.target.value)}
                  className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2 resize-none mb-3"
                  rows={2}
                />
                <textarea
                  placeholder="Meta Keywords"
                  value={settings.meta_title.keyword}
                  onChange={(e) => handleMetaChange('keyword', e.target.value)}
                  className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2 resize-none"
                  rows={2}
                />
              </div>

              {/* Platform Fee Management */}
              <div className="bg-[#FAF6F3]/50 border border-gray-100 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Fee Management</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-500 mb-1">Platform Fee (%)</label>
                    <input
                      type="number"
                      placeholder="Platform Fee (%)"
                      value={settings.platform_fee_percent}
                      onChange={(e) => handleInputChange('platform_fee_percent', e.target.value)}
                      className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-500 mb-1">Platform Fee for Renter (%)</label>
                    <input
                      type="number"
                      placeholder="Platform Fee for Renter (%)"
                      value={settings.platform_fee_renter_percent}
                      onChange={(e) => handleInputChange('platform_fee_renter_percent', e.target.value)}
                      className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-500 mb-1">Platform Fee for Lender (%)</label>
                    <input
                      type="number"
                      placeholder="Platform Fee for Lender (%)"
                      value={settings.platform_fee_lender_percent}
                      onChange={(e) => handleInputChange('platform_fee_lender_percent', e.target.value)}
                      className="w-full border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-700 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  className="px-5 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-900 text-white hover:bg-black transition-all flex items-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-sm"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}