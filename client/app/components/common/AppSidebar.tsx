'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import CommonSidebar, { SidebarSection } from './Sidebar';
import { Icons } from '@/app/admin/icons';

// Icons for Lender (Imported from the original file to keep custom SVGs)
import {
  DashboardIcon,
  OrdersIcon,
  ListingsIcon,
  EarningsIcon,
  ReviewsIcon,
  DisputesIcon,
  SupportIcon,
  AccountIcon,
  StoriesIcon,
  MessagesIcon
} from '../../lender/components/Icons';

interface AppSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function AppSidebar({ collapsed, onToggleCollapse, isMobileOpen, onMobileOpenChange }: AppSidebarProps) {
  const pathname = usePathname();
  const isadmin = pathname.startsWith('/admin');

  const sections = useMemo((): SidebarSection[] => {
    if (isadmin) {
      return [
        {
          title: 'Users',
          items: [
            { name: 'Users', href: '/admin/users', icon: <Icons.UserFill /> },
            { name: 'Waitlist', href: '/admin/waitlist', icon: <Icons.UserAdd /> }
          ]
        },
        {
          title: 'Operations',
          items: [
            { name: 'Listings', href: '/admin/listings', icon: <Icons.ListingAlt /> },
            { name: 'Orders', href: '/admin/orders', icon: <Icons.OrderAlt /> }
          ]
        },
        {
          title: 'Finance',
          items: [
            { name: 'Transactions', href: '/admin/transactions', icon: <Icons.TransactionGBP /> },
            { name: 'Payouts', href: '/admin/payouts', icon: <Icons.TransactionEUR /> }
          ]
        },
        {
          title: 'System',
          items: [
            { name: 'Settings', href: '/admin/settings', icon: <Icons.SettingsAlt /> }
          ]
        }
      ];
    } else {
      // Lender Sidebar
      return [
        {
          items: [
            { name: 'Dashboard', href: '/lender/dashboard', icon: <Icons.DashboardFill /> },
            { name: 'Listings', href: '/lender/listings', icon: <ListingsIcon /> },
            { name: 'Orders', href: '/lender/orders', icon: <Icons.OrderAlt /> },
            { name: 'Account', href: '/lender/account', icon: <AccountIcon /> },
          ]
        }
      ];
    }
  }, [isadmin]);

  return (
    <CommonSidebar
      sections={sections}
      basePath={isadmin ? "/admin" : "/lender"}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      isMobileOpen={isMobileOpen}
      onMobileOpenChange={onMobileOpenChange}
    />
  );
}
