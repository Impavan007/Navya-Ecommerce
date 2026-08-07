'use client';

import { useState } from 'react';
import AppSidebar from '../../components/common/AppSidebar';
import DashboardHeader from './DashboardHeader';

export default function LenderLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAF7]">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileOpen}
        onMobileOpenChange={setIsMobileOpen}
      />
      <main className="flex-1 pt-16 transition-all duration-300 overflow-x-hidden border-l border-[#F0E6D2] bg-[#FAFAF7]">
        <DashboardHeader
          onToggleSidebar={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        {children}
      </main>
    </div>
  );
}
