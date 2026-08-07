'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icons from '../icons';

interface QuickActionsProps {
  openDisputes?: number;
  pendingListings?: number;
  PendingOnboarding?: number;
  loading: boolean;
}

export default function QuickActions({ openDisputes = 0, pendingListings = 0, PendingOnboarding = 0, loading }: QuickActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const router = useRouter();

  const actions = [
    {
      id: 'listings',
      title: 'Review New Listings',
      description: 'Approve or reject pending listings',
      // count: pendingListings || 0,
      icon: <Icons.ListingsDashboardIcon />,
      href: '/admin/listings',
      color: 'blue',
      Logo: '/Images/Vector (2).png',
      path: '/admin/listings'
    },
    {
      id: 'disputes',
      title: 'Resolve Disputes',
      description: 'Handle customer disputes and issues',
      // count: openDisputes || 0,
      icon: <Icons.DisputesDashboardIcon />,
      href: '/admin/disputes',
      color: 'red',
      Logo: '/Images/Vector (3).png',
      path: '/admin/disputes'
    },
    {
      id: 'New Boarding Requests',
      title: 'Approve Payouts',
      description: 'Process pending payout requests',
      // count: PendingOnboarding || 0, // You can add this to your API response if needed
      icon: <Icons.PayOutsDashboarIcons />,
      href: '/admin/waitlist',
      color: 'green',
      Logo: '/Images/Vector (4).png',
      path: '/admin/payouts'
    }
  ];

  const handleActionClick = (path: string) => {
    setSelectedAction(path);
    router.push(path);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-[24px] font-serif font-bold text-[#1A1A1A] mb-1">Quick Actions</h2>
          <p className="text-gray-500 font-poppins font-normal text-sm">Priority tasks requiring your attention</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-[#F0E6D2] shadow-xs"
            >
              <div className="animate-pulse">
                <div className="flex gap-4 items-center justify-center">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-1">Quick Actions</h2>
        <p className="text-gray-500 font-poppins text-sm">Priority tasks requiring your attention</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => handleActionClick(action.path)}
            className={`bg-white rounded-xl p-6 border border-[#F0E6D2] hover:border-[#BFA15F] hover:bg-[#FAF4E8]/40 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group ${selectedAction === action.path ? 'ring-2 ring-[#BFA15F]' : ''
              }`}
          >
            <div className='flex gap-4 items-center justify-center'>
              <span className="text-[#BFA15F] text-xl">{action.icon}</span>
              <h3 className="text-base font-semibold text-[#1A1A1A] font-poppins group-hover:text-[#BFA15F] transition-colors">
                {action.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}