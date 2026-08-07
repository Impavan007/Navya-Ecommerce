import Link from "next/link";
import Skeleton from "../../components/common/Skeleton";

export default function KPICards({ summaryCards, loading }: any) {


  const kpis = summaryCards ? [
    {
      title: summaryCards.totalActiveUsers?.label || "Total Active Users",
      value: summaryCards.totalActiveUsers?.count?.toLocaleString() || "0",
      change: summaryCards.totalActiveUsers?.trend || "0%",
      isPositive: summaryCards.totalActiveUsers?.trendDirection === "up",
      subtitle: summaryCards.totalActiveUsers?.subtitle || "Active users in the last 30 days",
      link: "/admin/users"
    },
    {
      title: summaryCards.totalBookings?.label || "Total Bookings",
      value: summaryCards.totalBookings?.count?.toLocaleString() || "0",
      change: summaryCards.totalBookings?.trend || "0%",
      isPositive: summaryCards.totalBookings?.trendDirection === "up",
      subtitle: summaryCards.totalBookings?.subtitle || "Bookings completed in the last 30 days",
      link: "/admin/orders"
    },
    {
      title: summaryCards.gmv?.label || "GMV",
      value: `${summaryCards.gmv?.currency || "Rs."}${summaryCards.gmv?.amount?.toLocaleString() || "0"}`,
      change: summaryCards.gmv?.trend || "0%",
      isPositive: summaryCards.gmv?.trendDirection === "up",
      subtitle: summaryCards.gmv?.subtitle || "Gross Merchandise Value this month",
      link: "/admin/transactions"
    },
    {
      title: summaryCards.pendingListings?.label || "Pending Listings",
      value: summaryCards.pendingListings?.count?.toLocaleString() || "0",
      change: summaryCards.pendingListings?.trend || "0%",
      isPositive: summaryCards.pendingListings?.trendDirection === "up",
      subtitle: summaryCards.pendingListings?.subtitle || "Listings awaiting approval",
      link: "/admin/listings"
    },
    {
      title: summaryCards.openDisputes?.label || "Open Disputes",
      value: summaryCards.openDisputes?.count?.toLocaleString() || "0",
      change: summaryCards.openDisputes?.trend || "0%",
      isPositive: summaryCards.openDisputes?.trendDirection === "up",
      subtitle: summaryCards.openDisputes?.subtitle || "Active disputes requiring attention",
      link: "/admin/disputes"
    }
  ] : [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 border-t-4 border-[#BFA15F] border-x border-b border-[#F0E6D2] rounded-xl shadow-xs h-[180px] flex flex-col justify-between">
            <Skeleton variant="text" width="70%" className="bg-gray-100 h-4" />
            <div className="space-y-4">
              <Skeleton variant="text" width="50%" className="bg-gray-200 h-10" />
              <div className="flex gap-2">
                <Skeleton variant="rect" width={40} height={16} className="bg-gray-100" />
                <Skeleton variant="circle" width={16} height={16} className="bg-gray-100" />
              </div>
            </div>
            <Skeleton variant="text" width="90%" className="bg-gray-100 h-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {kpis.map((kpi, index) => (
        <Link
          href={kpi.link}
          key={index}
          className="bg-white p-6 rounded-xl border-t-4 border-[#BFA15F] border-x border-b border-[#F0E6D2] shadow-xs hover:shadow-md hover:border-[#BFA15F] transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider font-poppins">{kpi.title}</h3>
              <span className="w-2 h-2 rounded-full bg-[#BFA15F]" />
            </div>

            <div className="space-y-2">
              <p className="text-3xl font-extrabold text-[#1A1A1A] font-poppins group-hover:text-[#BFA15F] transition-colors">{kpi.value}</p>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kpi.isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {kpi.change}
                </span>
                {kpi.isPositive ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2.5L2.5 6M6 2.5L9.5 6M6 2.5V9.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9.5L2.5 6M6 9.5L9.5 6M6 9.5V2.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-poppins leading-tight pt-1">
              {kpi.subtitle}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
