'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddListingForm from '../../../components/listings/AddListingForm';
import axiosClient from '../../../LenderAPi/Axiosclient';
import { API_ENDPOINTS } from '../../../LenderAPi/LenderAPiendPoints';
import CommonLoader from '@/app/components/common/CommonLoader';

const formatDateOnly = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  if (typeof value === 'string') {
    const [firstPart] = value.split('T');
    return firstPart || value;
  }
  return null;
};

const expandRangeToDates = (start?: string, end?: string) => {
  const startDateStr = formatDateOnly(start);
  const endDateStr = formatDateOnly(end || start);
  if (!startDateStr || !endDateStr) return [];

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [];
  }

  const dates: string[] = [];
  for (
    let cursor = new Date(startDate);
    cursor <= endDate;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    dates.push(cursor.toISOString().split('T')[0]);
  }
  return dates;
};

const mapListingToFormData = (data: any) => {
  if (!data) return null;

  const listingId = data._id || data.id || '';
  const rawImages = Array.isArray(data.images) ? data.images : [];
  const coverImage = data.cover_image || data.coverImage || rawImages[0] || '';
  const urlSet = new Set<string>();
  if (coverImage) urlSet.add(coverImage);
  rawImages.forEach((url: string) => {
    if (url) urlSet.add(url);
  });
  const orderedUrls = Array.from(urlSet);
  const photos = orderedUrls.map((url, index) => ({
    id: `${listingId || 'listing'}-${index}`,
    url,
    isCover: url === coverImage || (!coverImage && index === 0),
    isNew: false,
  }));
  if (photos.length && !photos.some((photo) => photo.isCover)) {
    photos[0].isCover = true;
  }

  const blockedDatesInput = data.blockedDates || data.blocked_dates || [];
  const blockedDateSet = new Set<string>();
  if (Array.isArray(blockedDatesInput)) {
    blockedDatesInput.forEach((entry: any) => {
      if (!entry) return;
      if (typeof entry === 'string') {
        const formatted = formatDateOnly(entry);
        if (formatted) blockedDateSet.add(formatted);
        return;
      }
      if (entry.start_date || entry.date) {
        expandRangeToDates(entry.start_date || entry.date, entry.end_date).forEach(
          (date) => blockedDateSet.add(date)
        );
      }
    });
  }
  const blockedDates = Array.from(blockedDateSet);

  const numberToString = (value: any) =>
    value === undefined || value === null ? '' : String(value);

  return {
    id: listingId,
    title: data.title || data.name || '',
    description: data.description || '',
    category:
      typeof data.category === 'string'
        ? data.category
        : data.category?._id || '',
    brand: data.brand || '',
    size: Array.isArray(data.size) ? data.size : [],
    fabric: data.fabric || data.fabric || '',
    measurements: data.measurements || '',
    rentalPrice: numberToString(
      data.rentalPrice ?? data.rental_price_per_day ?? data.price
    ),
    cleaningPrice: numberToString(
      data.cleaningPrice ?? data.cleaning_fee ?? data.pricing?.cleaning_fee
    ),
    deposit: numberToString(
      data.deposit ?? data.security_deposit ?? data.pricing?.security_deposit
    ),
    photos,
    blockedDates,
    quantity: data.quantity ?? 1,
    subcategory:
      typeof data.sub_category === 'string'
        ? data.sub_category
        : (data.sub_category?._id || ''),
    cover_image: coverImage,
    images: rawImages,
    status: data.status || '',
    blocked_dates: data.blocked_dates || [],
    lender: data.lender,
    shipping_tier: data.shipping_tier || '',
  };
};

export default function UpdateItemPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosClient.get(
          `${API_ENDPOINTS.Update}/${id}`
        );
        const mapped = mapListingToFormData(response.data?.data);
        setListing(mapped);
      } catch (err) {
        console.error('Failed to fetch listing details', err);
        setError('Unable to load listing details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <CommonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        {error}
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Listing not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F3]">
      <div className="mx-auto px-[40px] py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-['Canela'] font-bold text-[#111827]">
            Edit Listing
          </h1>
          <p className="text-[#4B5563] text-[16px] font-roboto mt-1">
            Update your product details below.
          </p>
        </div>

        <AddListingForm initialData={listing} mode="edit" />
      </div>
    </div>
  );
}
