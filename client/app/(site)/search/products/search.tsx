"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import ProductCard from "../../components/ProductCard";
import { productsApiService } from "../../services/api/products";
import { ShimmerProductItem } from "../../components/Shimmer";

interface SearchProduct {
  id: string;
  name: string;
  brand: string;
  rentalPrice: number;
  size: string[];
  cover_image: string;
  rating: number;
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function SearchProductsPage() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const fabric = (searchParams.get("fabric") || "").trim();
  const pageParam = Number(searchParams.get("page"));

  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1);
  const activeSearchTerm = searchTerm || query || fabric;

  useEffect(() => {
    const nextPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    setCurrentPage(nextPage);
  }, [pageParam]);

  // Reset to first page when search term (q or fabric) changes
  useEffect(() => {
    setCurrentPage(1);
  }, [fabric, query]);

  const fetchSearchResults = useCallback(async () => {
    const searchValue = fabric || query;

    if (!searchValue) {
      setLoading(false);
      setError("Please enter a search query");
      setPagination(null);
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await productsApiService.searchProducts(
        fabric ? undefined : query,
        { page: currentPage, fabric: fabric || undefined }
      );

      if (response.success && response.data) {
        const data = response.data as any;
        const productsList = data.products || [];
        setProducts(productsList);
        setPagination(data.pagination || null);
        setSearchTerm(data.searchTerm || searchValue);
      } else {
        setError(response.message || "Failed to fetch search results");
        setProducts([]);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      setError(error?.message || "Failed to fetch search results");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [fabric, query, currentPage]);

  // Fetch search results when params or page change
  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const goToPage = (page: number) => {
    if (!pagination) return;
    if (page < 1 || page > pagination.totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Transform API product to ProductCard props
  const transformProduct = (product: SearchProduct) => ({
    id: product.id,
    imageSrc: product.cover_image || "/assets/product-1.jpg",
    productName: product.name,
    price: `Rs.${product.rentalPrice || 0}`,
    sizes: Array.isArray(product.size) ? product.size.join(", ") : product.size || "",
    brand: product.brand,
    rating: product.rating || 0,
    rating_count: (product as any).rating_count || 0,
  });

  return (
    <ProtectedRoute
      fallback={
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Sign in to view search results
          </h2>
          <p className="text-white/80">
            Please sign in to explore search results.
          </p>
        </div>
      }
    >
      <div className="flex flex-col w-full">

        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-16 py-6 lg:py-10 max-w-[1440px] mx-auto w-full">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-[48px] font-normal text-black">
              Search Results
            </h1>
            {activeSearchTerm && (
              <p className="font-poppins text-sm sm:text-base lg:text-[16px] text-black/90">
                Showing results for: <span className="font-semibold">"{activeSearchTerm}"</span>
              </p>
            )}
            <p className="font-poppins text-sm sm:text-base lg:text-[16px] text-black/90">
              Discover premium textiles and fabrics at Navyaa! Source from a global network of suppliers, mills, and sustainable manufacturers.
            </p>
          </div>

          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full mt-6">
            <p className="capitalize font-poppins font-medium leading-[24px] not-italic relative shrink-0 text-[#647462] text-[16px] m-0">
              {loading ? "Loading..." : pagination ? `${pagination.totalItems}+ Results` : `${products.length}+ Results`}
            </p>
          </div>
        </div>

        {/* Main Content: Products */}
        <div className="px-4 sm:px-6 lg:px-16 max-w-[1440px] mx-auto w-full">
          {/* Products Grid */}
          <section className="flex flex-col gap-6">
            <div className="w-full">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ShimmerProductItem key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <h3 className="text-lg font-semibold mb-2">Error Loading Products</h3>
                  <p>{error}</p>
                  <button
                    onClick={fetchSearchResults}
                    className="mt-4 px-4 py-2 bg-[#1A1A1A] text-white rounded hover:bg-[#1a1a1a] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-800">
                  <p className="text-lg font-semibold mb-2">No products found</p>
                  <p className="text-gray-600">
                    {activeSearchTerm
                      ? `No results found for "${activeSearchTerm}". Try a different search term.`
                      : "Please enter a search query to find products."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} {...transformProduct(product)} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-8">
                <button
                  onClick={() => goToPage((pagination?.currentPage || 1) - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="p-2 border rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src="/assets/arrow-right.svg"
                    alt="Previous"
                    width={24}
                    height={24}
                    className="rotate-180"
                  />
                </button>
                <p className="text-sm sm:text-base text-gray-800">
                  {pagination.currentPage}/{pagination.totalPages}
                </p>
                <button
                  onClick={() => goToPage((pagination?.currentPage || 1) + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2 border rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Image
                    src="/assets/arrow-right.svg"
                    alt="Next"
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            )}
          </section>
        </div>

      </div>
    </ProtectedRoute>
  );
}
