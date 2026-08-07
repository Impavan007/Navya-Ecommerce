import Link from "next/link";
import { BreadCrumbIcon } from "../icons/icons";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const first = items[0];
  const last = items[items.length - 1];

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      {/* Full breadcrumb for sm and above */}
      <div className="hidden sm:flex  mx-auto px-[20px] sm:px-6 lg:px-[40px] pt-6 pb-3 items-center gap-4 overflow-hidden">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3 min-w-0">
            {item.href ? (
              <Link
                href={item.href}
                className="font-['Poppins'] text-sm sm:text-[16px] leading-[20px] text-[#3D1126] capitalize hover:text-gray-600 transition-colors truncate"
              >
                <span className="block min-w-0 truncate font-medium">{item.label}</span>
              </Link>
            ) : (
              <span className="font-['Poppins'] text-sm sm:text-[16px] leading-[20px] text-[#3D1126] capitalize truncate">
                <span className="block min-w-0 truncate font-medium">{item.label}</span>
              </span>
            )}

            {index < items.length - 1 && (
<BreadCrumbIcon/>
            )}
          </div>
        ))}
      </div>

      {/* Compact breadcrumb for small screens: show all if items <= 3, otherwise show first › ... › last */}
      <div className="flex sm:hidden w-full  mx-auto px-4 py-3 items-center justify-start gap-2 overflow-hidden">
        {items.length <= 3 ? (
          items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 min-w-0">
              {item.href ? (
                <Link href={item.href} className="text-sm text-[#3D1126] truncate font-medium">
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm text-[#3D1126] truncate font-medium">
                  {item.label}
                </span>
              )}
              {index < items.length - 1 && (
                <BreadCrumbIcon />
              )}
            </div>
          ))
        ) : (
          <>
            {first && (
              <div className="min-w-0">
                {first.href ? (
                  <Link href={first.href} className="text-sm text-[#3D1126] truncate">
                    <span className="block min-w-0 truncate font-medium">{first.label}</span>
                  </Link>
                ) : (
                  <span className="text-sm text-[#3D1126] truncate font-medium">{first.label}</span>
                )}
              </div>
            )}

             <BreadCrumbIcon />

            <span className="flex-1 text-sm text-[#9ca3af] truncate text-center">...</span>

          <BreadCrumbIcon />

            {last && (
              <div className="min-w-0">
                {last.href ? (
                  <Link href={last.href} className="text-sm text-[#3D1126] truncate">
                    <span className="block min-w-0 truncate text-right">{last.label}</span>
                  </Link>
                ) : (
                  <span className="text-sm text-[#3D1126] truncate text-right">{last.label}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
