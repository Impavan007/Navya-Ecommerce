'use client';

import { useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: ReactNode;
  badge?: number;
}

export interface SidebarSection {
  title?: string;
  items: NavigationItem[];
  id?: string;
  isCollapsible?: boolean;
  icon?: ReactNode;
}

interface CommonSidebarProps {
  sections: SidebarSection[];
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  basePath?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function CommonSidebar({
  sections,
  logoSrc = "/Images/Logo2.png",
  logoWidth = 100,
  logoHeight = 50,
  basePath = "",
  collapsed: controlledCollapsed,
  onToggleCollapse,
  isMobileOpen: controlledMobileOpen,
  onMobileOpenChange
}: CommonSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const isMobileOpen = controlledMobileOpen !== undefined ? controlledMobileOpen : internalMobileOpen;
  const setIsMobileOpen = onMobileOpenChange || setInternalMobileOpen;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  // Determine if we should show full labels (expanded view)
  const isExpandedView = !isCollapsed || isMobileOpen;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* 📱 Mobile Hamburger Button (Only if not controlled externally or if explicitly needed) */}
      {!isMobileOpen && controlledMobileOpen === undefined && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-2 left-2 z-[60] p-2 bg-white shadow-md border border-[#F0E6D2] rounded-md text-[#BFA15F]"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>
      )}

      {/* 🌑 Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[100]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-[#F0E6D2] z-[110] lg:z-30 transition-all duration-300 ease-in-out shadow-xs
        ${isMobileOpen ? 'w-[280px] translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
      >
        <div className="flex flex-col h-full font-poppins overflow-hidden">

          {/* 🔝 Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#F0E6D2] overflow-hidden min-h-[81px]">
            <Link href="/" className="flex items-center transition-all duration-300">
              <span className="font-serif tracking-[0.2em] text-2xl font-bold bg-gradient-to-r from-[#BFA15F] to-[#E5C9A4] bg-clip-text text-transparent uppercase select-none">
                NAVYAA
              </span>
            </Link>

            <div className="flex items-center">
              {/* Mobile Close */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-2 hover:bg-[#FAF4E8] rounded-md transition-colors duration-200"
              >
                <i className="ri-close-line text-gray-600 text-lg"></i>
              </button>
            </div>
          </div>

          {/* 🧾 Navigation */}
          <nav className="flex-1 sm:h-full overflow-y-auto scrollbar-hide overflow-x-hidden py-4">
            {sections.map((section, sIdx) => {
              const sectionId = section.id || `section-${sIdx}`;
              const isGroupExpanded = expandedGroups[sectionId] !== false;

              return (
                <div key={sIdx} className="mb-4 last:mb-0">
                  {/* Section Title (only in expanded view) */}
                  {section.title && (
                    <div
                      className={`px-6 flex items-center justify-between cursor-pointer group/title overflow-hidden transition-all duration-300 
                      ${section.isCollapsible ? 'hover:bg-[#FAF4E8] h-full' : ''} 
                      ${isExpandedView ? 'max-h-20 py-2 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                      onClick={() => section.isCollapsible && toggleGroup(sectionId)}
                    >
                      <div className="flex items-center space-x-3 whitespace-nowrap">
                        {section.icon && (
                          <span className={`text-lg flex items-center font-bold font-roboto justify-center transition-colors duration-200 ${section.items.some(item => isActive(item.href))
                            ? 'text-[#BFA15F]'
                            : 'text-[#8A8A8A]'
                            }`}>
                            {typeof section.icon === 'string' ? <i className={section.icon}></i> : section.icon}
                          </span>
                        )}
                        <p className={`transition-all duration-300 font-roboto ${section.icon
                          ? 'text-[16px] leading-[24px] font-bold text-[#8A8A8A] capitalize'
                          : 'text-[12px] font-bold tracking-widest uppercase ' + (section.items.some(item => isActive(item.href)) ? 'text-[#BFA15F] font-semibold' : 'text-[#8A8A8A]')
                          }`}>
                          {section.title}
                        </p>
                      </div>
                      {section.isCollapsible && isExpandedView && (
                        <i className={`ri-arrow-${isGroupExpanded ? 'up' : 'down'}-s-line text-[#8A8A8A] transition-transform duration-200`}></i>
                      )}
                    </div>
                  )}

                  {/* Single Group Icon (only in collapsed view when items have no icons) */}
                  {!isExpandedView && section.icon && section.items.every(item => !item.icon) && (
                    <button
                      onClick={toggleCollapse}
                      className="w-full flex justify-center py-4 hover:bg-[#FAF4E8] text-[#8A8A8A] hover:text-[#BFA15F] transition-colors duration-200"
                      title={section.title}
                    >
                      <span className="text-xl flex items-center justify-center min-w-[24px]">
                        {typeof section.icon === 'string' ? <i className={section.icon}></i> : section.icon}
                      </span>
                    </button>
                  )}

                  {/* Section Items */}
                  <div className={`overflow-hidden transition-all duration-300 ${section.isCollapsible && !isGroupExpanded && isExpandedView ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      const isStringIcon = typeof item.icon === 'string';
                      const hasNoIcon = !item.icon;

                      // Hide individual items in collapsed view if group icon is shown
                      if (!isExpandedView && section.icon && section.items.every(i => !i.icon)) return null;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={`w-full flex items-center transition-all duration-300 whitespace-nowrap group relative
                          ${active
                              ? 'bg-[#FAF4E8] border-r-4 border-[#BFA15F] text-[#BFA15F] font-semibold'
                              : 'hover:bg-[#FAF6F0] text-[#4B5563] hover:text-[#BFA15F] font-normal'
                            }
                          ${isExpandedView
                              ? (section.icon && hasNoIcon ? 'pl-[64px]' : (item.icon ? 'pl-6' : 'pl-[52px]')) + ' py-3.5 justify-between'
                              : 'px-0 justify-center py-3.5'
                            }
                          `}
                          title={!isExpandedView ? item.name : undefined}
                        >
                          <div className={`flex items-center transition-all duration-300 ${isExpandedView ? 'space-x-3' : 'space-x-0'}`}>
                            {/* Standard Icon */}
                            {(isExpandedView && (item.icon || !section.icon)) && (
                              <span
                                className={`text-xl flex items-center justify-center min-w-[24px] transition-colors duration-200 ${active
                                  ? 'text-[#BFA15F]'
                                  : 'text-[#8A8A8A] group-hover:text-[#BFA15F]'
                                  }`}
                              >
                                {isStringIcon ? <i className={item.icon as string}></i> : item.icon}
                              </span>
                            )}

                            {/* Collapsed Icon/Fallback */}
                            {!isExpandedView && (
                              <span
                                className={`text-xl flex items-center  justify-center min-w-[24px] transition-all duration-300 ${active
                                  ? 'text-[#BFA15F] font-medium'
                                  : 'text-[#8A8A8A] group-hover:text-[#BFA15F]'
                                  }`}
                              >
                                {item.icon ? (isStringIcon ? <i className={item.icon as string}></i> : item.icon) : (typeof section.icon === 'string' ? <i className={section.icon}></i> : section.icon)}
                              </span>
                            )}

                            {/* Label */}
                            <span className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpandedView ? 'opacity-100 max-w-[200px] text-[16px] font-medium leading-[24px]' : 'opacity-0 max-w-0 ml-0'}`}>
                              {item.name}
                            </span>
                          </div>

                          {/* Badge */}
                          {item.badge !== undefined && (
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpandedView ? 'opacity-100 max-w-[50px]' : 'opacity-0 max-w-0'}`}>
                              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center mr-4">
                                {item.badge}
                              </span>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Desktop Spacer */}
      <div
        className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
      />
    </>
  );
}
