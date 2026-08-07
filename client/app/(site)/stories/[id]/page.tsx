"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Breadcrumb from "../../components/Breadcrumb";
import ProductCard from "../../components/ProductCard";
import { storiesApiService } from "../../services/api/stories";
import type { ApiStoryDetail } from "../../types/api";
import { ShimmerRenterStory } from "../../components/Shimmer";

export default function StoryDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const productFilter = search.get("product") || undefined;

  const [story, setStory] = useState<ApiStoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dummyStoryDetails = {
    "dummy-story-1": {
      _id: "dummy-story-1",
      title: "Supplier Spotlight: Scaling Organic Cotton Production",
      description: "How EcoWeave Textiles expanded their GOTS certified organic cotton capacity for global B2B buyers.",
      cover_image: "https://images.unsplash.com/photo-1596205739958-8eb02f1a6f87?w=600",
      lender: {
        _id: "lender-1",
        name: "Priya Sharma",
        email: "priya@navyaa.com"
      },
      items: [
        {
          product: {
            _id: "prod-1-1",
            name: "GOTS Certified Organic Cotton Canvas",
            brand: "EcoWeave Textiles",
            cover_image: "https://images.unsplash.com/photo-1596205739958-8eb02f1a6f87?w=500",
            images: [],
            size: ["150cm width"],
            rental_price_per_day: 450,
            rating: 4.9,
            rating_count: 12
          }
        },
        {
          product: {
            _id: "prod-1-2",
            name: "Heavyweight Recycled Denim",
            brand: "EcoWeave Textiles",
            cover_image: "https://images.unsplash.com/photo-1596205739958-8eb02f1a6f87?w=500",
            images: [],
            size: ["140cm width"],
            rental_price_per_day: 350,
            rating: 4.8,
            rating_count: 8
          }
        }
      ],
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    },
    "dummy-story-2": {
      _id: "dummy-story-2",
      title: "Material Innovation: Sustainable Bamboo Knits",
      description: "Exploring the manufacturing process of thermo-regulating bamboo viscose jersey.",
      cover_image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=600",
      lender: {
        _id: "lender-2",
        name: "Ananya Mehta",
        email: "ananya@navyaa.com"
      },
      items: [
        {
          product: {
            _id: "prod-2-1",
            name: "Sustainable Bamboo Viscose Jersey",
            brand: "GreenLeaf Knits",
            cover_image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=500",
            images: [],
            size: ["150cm width"],
            rental_price_per_day: 280,
            rating: 4.7,
            rating_count: 5
          }
        }
      ],
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    },
    "dummy-story-3": {
      _id: "dummy-story-3",
      title: "Bridging the Gap: Connecting Mills to Independent Designers",
      description: "Making premium silk crepe de chine sourcing accessible for boutique fashion brands.",
      cover_image: "https://images.unsplash.com/photo-1601377850244-1246c76fcffb?w=600",
      lender: {
        _id: "lender-3",
        name: "Rohan Verma",
        email: "rohan@navyaa.com"
      },
      items: [
        {
          product: {
            _id: "prod-3-1",
            name: "Premium Silk Crepe de Chine",
            brand: "Silk Heritage Mills",
            cover_image: "https://images.unsplash.com/photo-1601377850244-1246c76fcffb?w=500",
            images: [],
            size: ["114cm width"],
            rental_price_per_day: 1200,
            rating: 5.0,
            rating_count: 14
          }
        }
      ],
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    },
    "dummy-story-4": {
      _id: "dummy-story-4",
      title: "TechTex Innovations: The Future of Activewear Fabrics",
      description: "A showcase of high-performance recycled polyester meshes and stretch scuba knits.",
      cover_image: "https://images.unsplash.com/photo-1563851509675-905cbb66aeb5?w=600",
      lender: {
        _id: "lender-4",
        name: "Meera Nair",
        email: "meera@navyaa.com"
      },
      items: [
        {
          product: {
            _id: "prod-4-1",
            name: "Recycled Polyester Active Mesh",
            brand: "TechTex Innovations",
            cover_image: "https://images.unsplash.com/photo-1563851509675-905cbb66aeb5?w=500",
            images: [],
            size: ["160cm width"],
            rental_price_per_day: 550,
            rating: 4.9,
            rating_count: 22
          }
        }
      ],
      status: "Active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      __v: 0
    }
  } as unknown as Record<string, ApiStoryDetail>;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await storiesApiService.getStoryDetail(params.id, productFilter ? { product: productFilter } : undefined);
        if (!mounted) return;
        if (res.data && res.data.story) {
          setStory(res.data.story);
        } else if (dummyStoryDetails[params.id]) {
          setStory(dummyStoryDetails[params.id]);
        } else {
          setError("Story not found");
        }
      } catch (e) {
        if (!mounted) return;
        if (dummyStoryDetails[params.id]) {
          setStory(dummyStoryDetails[params.id]);
          setError(null);
        } else {
          setError("Failed to load story");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id, productFilter]);

  // Transform story item to ProductCard props
  const transformStoryItemToProductCard = (item: any) => {
    const product = item.product;
    return {
      id: product._id || product.id,
      imageSrc: product.cover_image || (product.images && product.images[0]) || "/assets/product-1.jpg",
      productName: product.name,
      price: `Rs.${item.rentFrom || product.rental_price_per_day || product.rentalPrice || 0}`,
      sizes: Array.isArray(product.size) ? product.size.join(", ") : (product.size || []).join(", "),
      brand: product.brand || "",
      rating: product.rating || 0,
      rating_count: product.rating_count || 0
    };
  };

  if (loading) return <ShimmerRenterStory />;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF6F3]">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Stories", href: "/stories" }, { label: story?.title || "Story Detail" }]} />

      <main className="flex-1 w-full mx-auto px-[20px] lg:px-[40px] py-8 md:py-12 lg:py-16">
        {/* Story Header */}
        <header className="mb-10 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-4xl">
              <h1 className="font-['canela'] font-bold text-[32px] text-[#3D1126] leading-tight mb-4 capitalize">
                {story?.title || ''}{" "}
                Curated by <span className="text-[#3D1126] font-normal">{story?.lender.name}</span>
              </h1>

              {/* {story?.lender?.name && (
                <p className="font-poppins text-lg md:text-xl text-[#6D6D6D] mb-6">
                </p>
              )} */}

              <p className="font-poppins text-sm md:text-base text-[#3D1126] leading-relaxed max-w-2xl">
                {story?.description || ''}
              </p>
            </div>

            {story?.items && (
              <div className="flex items-center gap-2 text-[#647462]">
                <span className="font-poppins font-semibold text-lg">
                  {story.items.filter(i => i.product).length}
                </span>
                <span className="font-poppins text-sm uppercase tracking-wider">Items</span>
              </div>
            )}
          </div>
        </header>

        {/* Products Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {error ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-[#3D1126] font-poppins text-lg">{error}</p>
              </div>
            ) : story && story.items.filter(it => !!it.product).length > 0 ? (
              story.items
                .filter(it => !!it.product)
                .map((item, index) => (
                  <ProductCard
                    key={`${item.product?._id || index}-${index}`}
                    {...transformStoryItemToProductCard(item)}
                  />
                ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm">
                <p className="text-[#3D1126] font-poppins text-lg">No products available in this story.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}