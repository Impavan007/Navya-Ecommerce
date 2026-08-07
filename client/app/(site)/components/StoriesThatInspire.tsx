"use client";

import Image from "next/image";
import Link from "next/link";
import StoryCard from "./StoryCard";
import { useEffect, useState } from "react";
import { storiesApiService } from "../services/api/stories";
import type { ApiStoryListItem } from "../types/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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

export default function StoriesThatInspire() {
  const [stories, setStories] = useState<ApiStoryListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await storiesApiService.getStories({ page: 1, limit: 4 });
        if (!mounted) return;
        if (res.data && res.data.stories && res.data.stories.length > 0) {
          setStories(res.data.stories);
        } else {
          setStories(dummyStories);
        }
      } catch (e: any) {
        if (!mounted) return;
        console.warn("Failed to fetch stories from API, falling back to dummy data", e);
        setStories(dummyStories);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="w-full bg-[#FAF6F3] flex justify-center py-[80px]">
      <div className="w-full px-[20px] md:px-8 lg:px-[40px]">
        {/* HEADER */}
        <div className="mb-[32px] md:mb-[64px]">
          <div className="w-full">
            <h2 className="font-['canela'] text-[32px] md:text-[48px] leading-[40px] md:leading-[56px] text-[#3D1126]">
              Stories That Inspire
            </h2>
            <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4 md:gap-0">
              <p className="font-poppins text-[14px] md:text-[18px] leading-[22px] md:leading-[26px] text-[#5A5A5A] mt-[8px] md:mt-[16px]">
                Discover how Navyaa is transforming the way we experience
                fashion, one story at a time.
              </p>
              <Link
                href="/stories"
                className="bg-[#1A1A1A] text-white px-[20px] md:px-[20px] py-[10px] md:py-[14px] flex items-center gap-[8px] md:gap-[12px] rounded-[8px] hover:opacity-90 transition-opacity whitespace-nowrap mt-4 md:mt-0"
              >
                <span className="font-poppins text-[12px] md:text-[14px]">
                  View More Members Stories
                </span>
                <Image
                  src="/assets/upload-icon.svg"
                  alt="Arrow"
                  width={15}
                  height={15}
                  className="brightness-0 invert w-[16px] h-[16px] md:w-[20px] md:h-[20px]"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* STORIES GRID */}
        {loading ? (
          <div className="grid grid-cols-5 gap-[32px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[461px] bg-[#E8E8E8] animate-pulse" />
            ))}
          </div>
        ) : error || !stories ? (
          <div className="text-center py-[60px]">
            <p className="text-[#3D1126] text-[18px]">
              {error || "No stories found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[32px]">
            {stories.map((s) => (
              <StoryCard
                key={s._id}
                id={s._id}
                imageSrc={s.cover_image}
                title={s.title}
                author={s.lender?.name || ""}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
