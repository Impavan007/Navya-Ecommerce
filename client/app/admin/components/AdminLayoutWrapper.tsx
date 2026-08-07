'use client';

import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AppSidebar from '../../components/common/AppSidebar';

export default function AdminLayoutWrapper({
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
    <div className="min-h-screen bg-[#FAFAF7]">
      <AdminHeader
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileOpenChange={setIsMobileOpen}
        />
        <main className="flex-1 overflow-y-hidden pt-16 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
