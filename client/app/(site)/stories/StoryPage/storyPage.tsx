"use client";

import Breadcrumb from "../../components/Breadcrumb";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { storiesApiService } from "../../services/api/stories";
import type { ApiStoryListItem } from "../../types/api";

export default function StoryPage() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = useMemo(() => {
    const p = Number(search.get("page") || "1");
    return Number.isNaN(p) || p < 1 ? 1 : p;
  }, [search]);

  const limit = useMemo(() => {
    const l = Number(search.get("limit") || "8");
    return Number.isNaN(l) || l < 1 ? 8 : l;
  }, [search]);

  const dummyStories: ApiStoryListItem[] = [
    {
      _id: "dummy-story-1",
      title: "Supplier Spotlight: Scaling Organic Cotton Production",
      cover_image: "https://images.unsplash.com/photo-1596205739958-8eb02f1a6f87?w=600",
      lender: {
        _id: "lender-1",
        name: "Priya Sharma",
        email: "priya@navyaa.com"
      },
      items: [],
      description: "How EcoWeave Textiles expanded their GOTS certified organic cotton capacity for global B2B buyers.",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    },
    {
      _id: "dummy-story-2",
      title: "Material Innovation: Sustainable Bamboo Knits",
      cover_image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600",
      lender: {
        _id: "lender-2",
        name: "Ananya Mehta",
        email: "ananya@navyaa.com"
      },
      items: [],
      description: "Exploring the manufacturing process of thermo-regulating bamboo viscose jersey.",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    },
    {
      _id: "dummy-story-3",
      title: "Bridging the Gap: Connecting Mills to Independent Designers",
      cover_image: "https://images.unsplash.com/photo-1601377850244-1246c76fcffb?w=600",
      lender: {
        _id: "lender-3",
        name: "Rohan Verma",
        email: "rohan@navyaa.com"
      },
      items: [],
      description: "Making premium silk crepe de chine sourcing accessible for boutique fashion brands.",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    },
    {
      _id: "dummy-story-4",
      title: "TechTex Innovations: The Future of Activewear Fabrics",
      cover_image: "https://images.unsplash.com/photo-1563851509675-905cbb66aeb5?w=600",
      lender: {
        _id: "lender-4",
        name: "Meera Nair",
        email: "meera@navyaa.com"
      },
      items: [],
      description: "A showcase of high-performance recycled polyester meshes and stretch scuba knits.",
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    }
  ];

  const [stories, setStories] = useState<ApiStoryListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalPages: number;
    totalStories: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await storiesApiService.getStories({ page, limit });
        if (!mounted) return;
        if (res.data && res.data.stories && res.data.stories.length > 0) {
          setStories(res.data.stories);
          setPagination({
            page: res.data.page,
            limit: res.data.limit,
            totalPages: res.data.totalPages,
            totalStories: res.data.totalStories,
          });
        } else {
          setStories(dummyStories);
          setPagination({
            page: 1,
            limit: 8,
            totalPages: 1,
            totalStories: dummyStories.length,
          });
        }
        setError(null);
      } catch (e) {
        if (!mounted) return;
        console.warn("Failed to load stories, falling back to dummy data", e);
        setStories(dummyStories);
        setPagination({
          page: 1,
          limit: 8,
          totalPages: 1,
          totalStories: dummyStories.length,
        });
        setError(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  const goToPage = (nextPage: number) => {
    if (nextPage < 1) return;
    const total = pagination?.totalPages || 1;
    const target = Math.min(Math.max(1, nextPage), total);
    const params = new URLSearchParams(search.toString());
    params.set("page", String(target));
    params.set("limit", String(limit));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="content-stretch flex flex-col items-start relative size-full min-h-screen">
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Stories" }]}
        />

        {/* Stories Section */}
        <div className="bg-[#FAF6F3]  box-border  px-[20px] lg:px-[40px] content-stretch flex flex-col gap-6 md:gap-8 lg:gap-[32px] items-end overflow-clip px-4 sm:px-6 lg:px-0 py-6 md:py-8 lg:py-[40px] relative shrink-0 w-full">
          {/* Page Title */}
          <div className="w-full mx-auto mb-4 md:mb-6 lg:mb-8">
            <h1 className="font-['canela'] text-2xl md:text-3xl lg:text-4xl font-normal text-[#1d2625] text-center">
              Member Stories
            </h1>
          </div>

          {/* Stories Grid */}
          <div className="content-stretch flex flex-col gap-6 md:gap-8 lg:gap-[32px] items-start relative shrink-0 w-full  mx-auto">
            {/* Stories Grid Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-[20px] w-full">
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[325/461] w-full bg-[#eaeaea] animate-pulse "
                  />
                ))}

              {!loading &&
                stories &&
                stories.length > 0 &&
                stories.map((s) => (
                  <a
                    key={s._id}
                    href={`/stories/${s._id}`}
                    className="group aspect-[325/461] w-full relative block overflow-hidden  hover:shadow-lg transition-shadow duration-300"
                  >
                    <Image
                      src={s.cover_image}
                      alt={s.title}
                      fill
                      className="object-cover pointer-events-none size-full group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute bg-[#F3D6DC] bottom-0 left-0 right-0 h-16 md:h-20 lg:h-[82px] p-2 md:p-3">
                      <div className="flex flex-col gap-1 md:gap-[4px] items-center justify-center h-full text-[#e1dac8]">
                        <p className="font-['Canela'] font-normal text-[#3D1126] leading-tight md:leading-[26px] text-sm md:text-base lg:text-[18px] text-center line-clamp-2">
                          {s.title}
                        </p>
                        <p className="font-poppins leading-[14px] md:leading-[16px] text-xs md:text-[12px] text-center opacity-90 text-[#3D1126]">
                          By {s.lender?.name || ""}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
            </div>

            {/* Error State */}
            {!loading && stories && stories.length === 0 && !error && (
              <div className="w-full text-center py-8 md:py-12">
                <p className="text-[#3D1126] text-lg md:text-xl">
                  No stories found.
                </p>
              </div>
            )}

            {error && (
              <div className="w-full text-center py-8 md:py-12">
                <p className="text-red-600 text-lg md:text-xl">{error}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-end mt-[80px] gap-2 font-poppins text-[13px] w-full">
              <button
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className={`px-4 py-2 border transition-colors ${page <= 1 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
              >
                &lt; Back
              </button>
              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-[36px] h-[38px] flex items-center justify-center border transition-colors ${p === page ? "bg-black text-white border-black" : "border-[#eee] bg-[#F3D6DC] text-[#1D2625] hover:border-[#ccc] hover:text-black"}`}>
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => goToPage(page + 1)}
                className={`px-4 py-2 border transition-colors ${page >= pagination.totalPages ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
              >
                Next &gt;
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
