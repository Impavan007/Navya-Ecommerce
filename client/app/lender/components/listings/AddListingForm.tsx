'use client';

import { useEffect, useState } from 'react';
import BasicInfoSection from './form-sections/BasicInfoSection';
import MediaUploadSection from './form-sections/MediaUploadSection';
import PreviewModal from './PreviewModal';
import InfoModal from './form-sections/InfoModal'; // 👈 import new modal
import { useLenderStore } from '../../stores/Listing/lenderListingstore';
import CommonLoader from '@/app/components/common/CommonLoader';
import ListingUploadCriteria from './form-sections/ListingUploadCriteria';
import PhotoUploadGuide from './form-sections/PhotoUploadGuide';
import { toast } from 'react-hot-toast';

interface AddListingFormProps {
  initialData?: any;
  mode?: 'add' | 'edit';
}

export default function AddListingForm({ initialData, mode = 'add' }: AddListingFormProps) {
  const {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    showPreview,
    togglePreview,
    submitListing,
    updateListing,
    resetFormData,
    savedSteps,
    loading: storeLoading,
  } = useLenderStore();

  const [isInfoOpen, setIsInfoOpen] = useState(false); // 👈 local state

  useEffect(() => {
    if (initialData) {
      setFormData(initialData, true);
    } else {
      resetFormData();
    }
  }, [initialData, resetFormData, setFormData]);

  const steps = [
    { id: 1, title: 'Basic Info', component: BasicInfoSection },
    { id: 2, title: 'Photos', component: MediaUploadSection },
  ];
  const currentStepData = steps.find((step) => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const hasPhotos =
    Array.isArray(formData.photos) && formData.photos.length > 0;

  const validateStep = (stepId: number) => {
    const errors: string[] = [];
    switch (stepId) {
      case 1:
        if (!formData.title?.trim()) errors.push('Item title is required.');
        if (!formData.category) errors.push('Please select a category.');
        if (!formData.subcategory) errors.push('Please select a subcategory.');
        if (!formData.brand?.trim()) errors.push('Brand is required.');
        if (!Array.isArray(formData.size) || formData.size.length === 0) {
          errors.push('Please select at least one size.');
        }
        if (!formData.rentalPrice || Number(formData.rentalPrice) <= 0) {
          errors.push('Price is required and must be greater than 0.');
        }
        break;
      case 2:
        if (!hasPhotos || (formData.photos?.length || 0) < 2) {
          errors.push('Please upload at least 2 photos.');
        }
        break;
      default:
        break;
    }
    return errors;
  };

  const handleNext = async () => {
    const errors = validateStep(currentStep);
    if (errors.length) {
      toast.error(errors[0]);
      return;
    }

    // 1. If in Edit mode, just navigate (no draft API call)
    if (mode === 'edit') {
      if (currentStep < steps.length) setCurrentStep(currentStep + 1);
      return;
    }

    // 2. If already saved (and not modified), skip API call
    if (savedSteps.includes(currentStep)) {
      if (currentStep < steps.length) setCurrentStep(currentStep + 1);
      return;
    }

    const { saveDraft } = useLenderStore.getState();
    const success = await saveDraft(currentStep);
    if (success) {
      if (currentStep < steps.length) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    for (let stepId = 1; stepId <= steps.length; stepId++) {
      const errors = validateStep(stepId);
      if (errors.length) {
        toast.error(errors[0]);
        setCurrentStep(stepId);
        return;
      }
    }

    if (mode === 'edit') {
      const { updateListing } = useLenderStore.getState();
      updateListing();
    } else {
      submitListing();
    }
  };

  // 🧾 Info content mapping
  const stepInfo: Record<number, React.ReactNode> = {
    1: (
      <ListingUploadCriteria />
    ),
    2: (
      <PhotoUploadGuide />
    ),
  };

  return (
    <>
      <div className="bg-[#FAF6F3] shadow-sm border border-[#F3D6DC] poppins overflow-hidden">
        {/* Progress Steps */}
        <div className="px-4 md:px-6 py-4 border-b border-[#F3D6DC] flex justify-between items-center bg-[#F3D6DC]">
          <div className="flex flex-wrap items-center justify-start gap-2 md:gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= step.id ? 'bg-gray-800 text-white' : 'bg-[#F3D6DC] text-gray-800'
                    }`}
                >
                  {currentStep > step.id ? (
                    <i className="ri-check-line text-base"></i>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    } hidden sm:inline`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-12 h-0.5 mx-2 ${currentStep > step.id ? 'bg-gray-800' : 'bg-[#E8C0C0]'
                      }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Info Button */}

        </div>

        {/* Form Content */}
        <div className="p-4 md:p-6 h-[500px] sm:h-[600px] overflow-y-auto relative">
          {storeLoading && (
            <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
              <CommonLoader text={currentStep === 3 ? "Uploading images..." : "Saving..."} />
            </div>
          )}
          {CurrentStepComponent && (
            <CurrentStepComponent formData={formData} setFormData={setFormData} mode={mode} />
          )}
        </div>
        {/* <button
          onClick={() => setIsInfoOpen(true)}
          className="px-5 m-3 py-1.5 text-sm border border-gray-300 text-[#3D1126] bg-[#E1DAC8]  font-medium"
        >
          Info
        </button> */}
        {/* Navigation */}
        <div className="px-4 md:px-6 bg-[#F3D6DC] py-4 border-t border-[#F3D6DC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex w-full sm:w-auto justify-between sm:justify-start space-x-3">
            {mode !== 'edit' && (
              <button
                disabled={storeLoading}
                onClick={async () => {
                  const { saveDraft } = useLenderStore.getState();
                  const success = await saveDraft(currentStep);
                  if (success) toast.success('Draft saved successfully!');
                }}
                className="px-4 py-2 border rounded-lg border-[#8A8A8A] text-[#374151] hover:bg-gray-50 text-sm font-medium font-roboto flex items-center gap-2"
              >
                {storeLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : null}
                Save as Draft
              </button>
            )}
            <button
              onClick={() => togglePreview(true)}
              className="px-4 py-2 border border-[#3D1126] rounded-lg text-[#3D1126] bg-transparent hover:bg-gray-50 text-sm font-poppins "
            >
              Preview
            </button>
          </div>

          <div className="flex w-full sm:w-auto justify-between sm:justify-end space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep <= 1 || storeLoading}
              className={`px-4 py-2 border border-gray-300 text-gray-700 bg-white text-sm font-medium  ${currentStep <= 1 || storeLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={storeLoading}
                className="px-4 py-2 bg-[#1A1A1A] text-[#ffffff] text-sm font-medium font-roboto rounded-lg flex items-center gap-2"
              >
                {storeLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : null}
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={storeLoading}
                className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-black text-sm font-medium rounded-lg flex items-center gap-2"
              >
                {storeLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : null}
                {mode === 'edit' ? 'Update Listing' : 'Submit for Approval'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPreview && <PreviewModal listing={formData} onClose={() => togglePreview(false)} />}
      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} content={stepInfo[currentStep]} />}
    </>
  );
}
