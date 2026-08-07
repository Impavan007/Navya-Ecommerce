'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Slider } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";
import { productsApiService } from "../services/api/products";
import { categoriesApiService } from "../services/api/categories";
import type { ApiProduct, Category } from "../types/api";
import { ShimmerProductGrid, ShimmerProductItem } from "../components/Shimmer";
import Breadcrumb from "../components/Breadcrumb";

/* ================= PAGE ================= */

export default function ProductsPageFile() {
    const searchParams = useSearchParams();
    const urlQuery = searchParams.get('q') || "";

    const [isSortOpen, setIsSortOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState(true);
    const [openOccasion, setOpenOccasion] = useState(true);
    const [selectedRange, setSelectedRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const mobileSortRef = useRef<HTMLDivElement>(null);

    // API Data States
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<any>(null);

    const urlCategory = searchParams.get('category') || "";
    const urlOccasion = searchParams.get('occasion') || "";

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
    const [selectedOccasion, setSelectedOccasion] = useState<string>(urlOccasion);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 1, max: 2300 }); // Default matching user request limit or reasonable range
    const [rentalDays, setRentalDays] = useState(4);
    const [availableNow, setAvailableNow] = useState(false);
    const [topLenders, setTopLenders] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    const hasAnyFilter = useMemo(() => {
        return (
            selectedCategory !== "" ||
            selectedOccasion !== "" ||
            selectedSizes.length > 0 ||
            priceRange.min > 1 ||
            priceRange.max < 2300 ||
            availableNow ||
            topLenders
        );
    }, [selectedCategory, selectedOccasion, selectedSizes, priceRange, availableNow, topLenders]);

    // Sync filters with URL parameters
    useEffect(() => {
        setSelectedCategory(urlCategory);
        setSelectedOccasion(urlOccasion);
        setCurrentPage(1);
    }, [urlCategory, urlOccasion, urlQuery]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesApiService.getAllCategories();
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {
                page: currentPage,
                limit: 12,
                sort: sortBy,
            };

            if (selectedCategory) params.category = selectedCategory;
            if (selectedOccasion) params.occasion = selectedOccasion;
            if (selectedSizes.length > 0) params.sizes = selectedSizes.join(",");
            if (priceRange.min > 1) params.min_price = priceRange.min;
            if (priceRange.max < 2300) params.max_price = priceRange.max;
            if (availableNow) params.available = true;
            if (topLenders) params.top_lenders = true;
            if (urlQuery) params.q = urlQuery;

            const response = await productsApiService.getAllProducts(params);

            if (response.success && response.data) {
                setProducts(response.data.products);
                setPagination(response.data.pagination);
            } else {
                setError(response.message || "Failed to fetch products");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong while fetching products");
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy, selectedCategory, selectedOccasion, selectedSizes, priceRange, availableNow, topLenders, urlQuery]);

    // Simple debounce implementation
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Refs to track previous filter values for debouncing logic
    const prevPriceRange = useRef(priceRange);
    const prevRentalDays = useRef(rentalDays);
    const isFirstRender = useRef(true);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isOutsideDesktop = sortRef.current && !sortRef.current.contains(target);
            const isOutsideMobile = mobileSortRef.current && !mobileSortRef.current.contains(target);

            if (isOutsideDesktop && isOutsideMobile) {
                setIsSortOpen(false);
            }
        };

        if (isSortOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSortOpen]);

    useEffect(() => {
        if (isFirstRender.current) {
            fetchProducts();
            isFirstRender.current = false;
            return;
        }

        // Determine if we should debounce (for sliders) or fetch immediately
        const priceChanged = prevPriceRange.current.min !== priceRange.min || prevPriceRange.current.max !== priceRange.max;

        // Update refs
        prevPriceRange.current = priceRange;

        if (priceChanged) {
            // Debounced fetch for sliders
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                fetchProducts();
            }, 500);
        } else {
            // Immediate fetch for other filters
            if (debounceRef.current) clearTimeout(debounceRef.current);
            fetchProducts();
        }

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [sortBy, selectedCategory, selectedOccasion, selectedSizes, availableNow, topLenders, currentPage, priceRange, urlQuery, fetchProducts]);

    const toggleSize = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
        setCurrentPage(1);
    };

    const handleSortChange = (option: string) => {
        const sortMap: Record<string, string> = {
            "Price: Low to High": "priceLowToHigh",
            "Price: High to Low": "priceHighToLow",
            "New Arrivals": "newest",
            "Best Selling": "mostRented",
            "Top Rated": "rating"
        };
        setSortBy(sortMap[option] || "newest");
        setIsSortOpen(false);
        setCurrentPage(1);
    };

    const sortOptions = [
        "Price: Low to High",
        "Price: High to Low",
        "New Arrivals",
        "Best Selling",
        "Top Rated"
    ];

    const transformProduct = (product: ApiProduct) => ({
        id: product.id,
        imageSrc: product.cover_image || product.images?.[0] || "/assets/girl.jpg",
        productName: product.name,
        price: `Rs.${product.rentalPrice}`,
        sizes: product.size.join(", "),
        brand: product.brand,
        rating: product.rating,
        rating_count: product.rating_count,
    });

    return (
        <div className="w-full">
            {/* <ExploreByCategory /> */}
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />

            <div className="w-full px-4 md:px-10 lg:px-12 pt-6 pb-24 flex flex-col md:flex-row md:items-start gap-8 bg-[#FFFCF8] min-h-screen">

                {/* ================= MOBILE CONTROLS ================= */}
                <div className="md:hidden flex justify-between items-center mb-4 border-b border-[#E8E3DD] pb-4 sticky top-[72px] bg-[#FFFCF8]/90 backdrop-blur-md z-30 py-3">
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="flex items-center gap-2 font-sans font-semibold text-xs uppercase tracking-wider text-[#18181B] bg-white border border-[#E8E3DD] px-4 py-2 rounded-full shadow-xs"
                    >
                        <SlidersHorizontal size={14} /> Filters
                    </button>

                    <div className="relative" ref={mobileSortRef}>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-[#18181B] bg-white border border-[#E8E3DD] px-4 py-2 rounded-full shadow-xs"
                        >
                            Sort <ArrowUpDown size={12} strokeWidth={1.5} />
                        </button>
                        {isSortOpen && (
                            <div className="absolute z-50 right-0 mt-2 bg-white shadow-xl border border-[#E8E3DD] w-[200px] p-3 space-y-2 rounded-2xl">
                                {sortOptions.map(option => (
                                    <label key={option} className="flex items-center gap-3 text-xs font-sans cursor-pointer hover:bg-[#F8F4EF] p-2 rounded-xl transition-colors">
                                        <input
                                            type="radio"
                                            name="sort_mobile"
                                            checked={sortBy === (option === "Price: Low to High" ? "priceLowToHigh" : option === "Price: High to Low" ? "priceHighToLow" : option === "New Arrivals" ? "newest" : option === "Best Selling" ? "mostRented" : "rating")}
                                            onChange={() => handleSortChange(option)}
                                            className="appearance-none w-4 h-4 border border-[#18181B] rounded-full bg-transparent checked:bg-[#C8A96A] checked:border-[#C8A96A]"
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= SIDEBAR BACKDROP ================= */}
                {isMobileFilterOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 md:hidden"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                )}

                <aside className={`
          fixed top-0 left-0 bottom-0  w-[75%] max-w-[400px] bg-white transition-transform duration-300 md:translate-x-0 md:sticky md:top-[110px] md:self-start md:w-[260px] xl:w-[350px] md:shrink-0 md:max-h-[calc(100vh-130px)] md:bg-transparent md:block md:border-r-2 md:border-r-[#E3E3E3] md:pr-6 overflow-y-auto custom-scrollbar
          ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>

                    {/* Mobile Header for Sidebar - Fixed & Full Width */}
                    <div className="flex justify-between items-center mb-6 md:hidden sticky top-0 bg-white px-6 py-4 border-b">
                        <h2 className="text-lg font-bold font-poppins">Filters</h2>
                        <button onClick={() => setIsMobileFilterOpen(false)} className="p-2">
                            <ChevronLeft className="rotate-180" size={24} />
                        </button>
                    </div>

                    <div className="px-6 md:px-0">
                        {/* FILTER + SORT (Desktop Only Header) */}
                        <div className="hidden md:flex justify-between items-center border-b border-[#eee] pb-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 cursor-pointer">
                                    <SlidersHorizontal size={18} strokeWidth={1.5} />
                                    <span className="text-[14px] font-medium text-gray-800">Filters</span>
                                </div>
                                {hasAnyFilter && (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory("");
                                            setSelectedOccasion("");
                                            setSelectedSizes([]);
                                            setPriceRange({ min: 1, max: 2300 });
                                            setRentalDays(4);
                                            setAvailableNow(false);
                                            setTopLenders(false);
                                            setSortBy("newest");
                                            setSelectedRange({ start: null, end: null });
                                            setCurrentPage(1);
                                        }}
                                        className="text-[12px] text-gray-400 hover:text-black transition-colors underline font-poppins"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="relative" ref={sortRef}>
                                <button
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="flex items-center gap-2 text-[14px] font-medium text-gray-800"
                                >
                                    <ArrowUpDown size={14} strokeWidth={1.5} />
                                    Sort
                                </button>

                                <div className={`absolute z-50 right-0 mt-3 bg-[#F3D6DC] shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-[#F3D6DC] w-[200px] p-4 space-y-3  rounded-md transition-all duration-300 transform origin-top-right ${isSortOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    <div className="flex items-center gap-2 pb-2 ">
                                        <ArrowUpDown size={14} strokeWidth={1.5} />
                                        <h4 className="font-[poppins] font-medium text-[14px] text-[#3D1126]">
                                            Sort
                                        </h4>
                                    </div>
                                    {sortOptions.map(option => (
                                        <label key={option} className="flex items-center gap-3 text-[13px] cursor-pointer hover:bg-[#F3D6DC] p-2 rounded transition-colors border-b border-[#F3D6DC] last:border-0">
                                            <input
                                                type="radio"
                                                name="sort"
                                                checked={sortBy === (option === "Price: Low to High" ? "priceLowToHigh" : option === "Price: High to Low" ? "priceHighToLow" : option === "New Arrivals" ? "newest" : option === "Best Selling" ? "mostRented" : "rating")}
                                                onChange={() => handleSortChange(option)}
                                                className="appearance-none w-4 h-4 border border-[#3D1126] rounded-full bg-transparent checked:bg-[#1A1A1A] checked:border-[#1A1A1A] relative "
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Accordion
                            title="Category"
                            open={openCategory}
                            toggle={() => setOpenCategory(!openCategory)}
                        >
                            {/* <div
                                className={`border-b border-[#E3E3E3] py-[8px] text-[13px] font-poppins cursor-pointer transition-colors pl-1 ${!selectedCategory ? 'text-black font-bold' : 'text-[#555] hover:text-black'}`}
                                onClick={() => { setSelectedCategory(""); setCurrentPage(1); }}
                            >
                                All Categories
                            </div> */}
                            {categories.map(cat => (
                                <div
                                    key={cat._id}
                                    className={`border-b border-[#E3E3E3] py-[8px] text-[13px] font-poppins cursor-pointer transition-colors pl-1 ${selectedCategory === cat._id ? 'text-black font-bold' : 'text-[#3D1126] hover:text-black'}`}
                                    onClick={() => { setSelectedCategory(cat._id); setCurrentPage(1); }}
                                >
                                    {cat.name}
                                </div>
                            ))}
                        </Accordion>

                        <Accordion
                            title="Occasion"
                            open={openOccasion}
                            toggle={() => setOpenOccasion(!openOccasion)}
                        >
                            {/* <div
                                className={`border-b border-[#E3E3E3] py-[8px] text-[13px] font-poppins cursor-pointer transition-colors pl-1 ${!selectedOccasion ? 'text-black font-bold' : 'text-[#555] hover:text-black'}`}
                                onClick={() => { setSelectedOccasion(""); setCurrentPage(1); }}
                            >
                                All Occasions
                            </div> */}
                            {[
                                "Everyday", "Work / Office", "Party / Night out",
                                "Wedding guest", "Formal event",
                                "Holiday / vacation", "Special occasion"
                            ].map(item => (
                                <div
                                    key={item}
                                    className={`border-b border-[#E3E3E3] py-[8px] text-[13px] font-poppins cursor-pointer transition-colors pl-1 ${selectedOccasion === item ? 'text-black font-bold' : 'text-[#3D1126] hover:text-black'}`}
                                    onClick={() => { setSelectedOccasion(item); setCurrentPage(1); }}
                                >
                                    {item}
                                </div>
                            ))}
                        </Accordion>

                        {/* PRICE RANGE */}
                        <Section title="Price Range">
                            <div className="px-2 mb-6 mt-4">
                                <Slider
                                    value={[
                                        priceRange.min !== null ? priceRange.min : 1,
                                        priceRange.max !== null ? priceRange.max : 2300
                                    ]}
                                    onChange={(e, newValue) => {
                                        const [min, max] = newValue as number[];
                                        setPriceRange({ min, max });
                                    }}
                                    onChangeCommitted={() => setCurrentPage(1)}
                                    valueLabelDisplay="auto"
                                    min={1}
                                    max={2300}
                                    sx={{
                                        color: '#3D1126',
                                        '& .MuiSlider-thumb': {
                                            backgroundColor: '#3D1126',
                                        },
                                        '& .MuiSlider-track': {
                                            backgroundColor: '#3D1126',
                                        },
                                        '& .MuiSlider-rail': {
                                            backgroundColor: '#E5E7EB',
                                        },
                                        '& .MuiSlider-valueLabel': {
                                            zIndex: 100,
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1 flex items-center">
                                    <span className="text-gray-900 text-[13px] mr-2">Min</span>
                                    <div className="flex items-center border border-gray-300 px-2 py-1.5 rounded-[4px]">
                                        <span className="text-gray-900 text-[13px]">Rs.</span>
                                        <input
                                            type="number"
                                            value={priceRange.min === null ? '' : priceRange.min}
                                            onChange={(e) => {
                                                setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }));
                                                setCurrentPage(1);
                                            }}
                                            className="w-full bg-transparent outline-none text-gray-900 ml-1 font-poppins text-[13px]"
                                            placeholder="15"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 flex items-center">
                                    <span className="text-gray-900 text-[13px] mr-2">Max</span>
                                    <div className="flex items-center border border-gray-300 px-2 py-1.5 rounded-[4px]">
                                        <span className="text-gray-900 text-[13px]">Rs.</span>
                                        <input
                                            type="number"
                                            value={priceRange.max === null ? '' : priceRange.max}
                                            onChange={(e) => {
                                                setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }));
                                                setCurrentPage(1);
                                            }}
                                            className="w-full bg-transparent outline-none text-gray-900 ml-1 font-poppins text-[13px]"
                                            placeholder="2300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* SIZE GRID */}
                        <Section title="Size">
                            <div className="flex flex-wrap gap-2 mt-5">
                                {[
                                    "XS (UK/IN 6)", "S (UK/IN 8)", "M (UK/IN 10)", "L (UK/IN 12)", "XL (UK/IN 14)", "XXL (UK/IN 16)", "3XL (UK/IN 18)",
                                    "4XL (UK/IN 20)", "5XL (UK/IN 22)"
                                ].map(size => (
                                    <button key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`font-medium border py-[9px] px-2 text-[16px] font-poppins rounded-[2px] transition-all bg-transparent whitespace-nowrap ${selectedSizes.includes(size) ? 'border-black text-black bg-black/5' : 'border-gray-200 text-[#3D1126] hover:border-black hover:text-black'
                                            }`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </Section>

                        <div className="mt-6 mb-10 pt-4 border-t border-[#eee] space-y-6">
                            {[
                                { label: "Available Now", state: availableNow, setter: setAvailableNow },
                                { label: "Top Sellers", state: topLenders, setter: setTopLenders }
                            ].map(item => (
                                <div
                                    key={item.label}
                                    className="flex justify-between items-center cursor-pointer group"
                                    onClick={() => {
                                        item.setter(!item.state);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <span className="text-[14px] font-poppins font-medium text-[#000000]">
                                        {item.label}
                                    </span>

                                    {/* Toggle Background */}
                                    <div
                                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${item.state ? "bg-black" : "bg-gray-200 group-hover:bg-gray-300"
                                            }`}
                                    >
                                        {/* Toggle Knob */}
                                        <div
                                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white  shadow-sm transition-transform duration-300 ${item.state ? "translate-x-5" : "translate-x-0"
                                                }`} style={{ borderRadius: "50%" }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </aside>

                {/* ================= PRODUCTS ================= */}
                <main className="flex-1">

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-[30px] gap-y-[50px]">
                        {loading ? (
                            Array.from({ length: 12 }).map((_, i) => (
                                <ShimmerProductItem key={i} />
                            ))
                        ) : error ? (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-red-500 font-poppins">{error}</p>
                                <button
                                    onClick={() => fetchProducts()}
                                    className="mt-4 px-6 py-2 bg-black text-white rounded-md font-poppins"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center min-h-[400px] text-center">
                                <p className="text-gray-500 font-poppins text-lg">No products found matching your criteria.</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory("");
                                        setSelectedOccasion("");
                                        setSelectedSizes([]);
                                        setPriceRange({ min: 1, max: 2300 });
                                        setRentalDays(4);
                                        setAvailableNow(false);
                                        setTopLenders(false);
                                        setSortBy("newest");
                                        setSelectedRange({ start: null, end: null });
                                        setCurrentPage(1);
                                    }}
                                    className="mt-4 text-black underline font-poppins"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            products.map(product => (
                                <div key={product.id} className="min-h-[400px]">
                                    <ProductCard {...transformProduct(product)} />
                                </div>
                            ))
                        )}
                    </div>

                    {/* PAGINATION */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-end mt-[80px] gap-2 font-poppins text-[13px]">
                            <button
                                disabled={!pagination.hasPrevPage}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className={`px-4 py-2 border transition-colors ${!pagination.hasPrevPage ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
                            >
                                &lt; Back
                            </button>
                            {Array.from({ length: pagination.totalPages }).map((_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-[36px] h-[38px] flex items-center justify-center border transition-colors ${p === currentPage ? "bg-black text-white border-black" : "border-[#eee] bg-[#F3D6DC] text-[#1D2625] hover:border-[#ccc] hover:text-black"}`}>
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                disabled={!pagination.hasNextPage}
                                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                className={`px-4 py-2 border transition-colors ${!pagination.hasNextPage ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-[#F3D6DC] text-[#1D2625] border-[#eee] hover:border-[#ccc] hover:text-black'}`}
                            >
                                Next &gt;
                            </button>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}

/* ================= ACCORDION & HELPERS ================= */

function Accordion({ title, children, open, toggle }: any) {
    return (
        <div className="border-b border-[#eee]">
            <button onClick={toggle}
                className="w-full flex justify-between items-center py-4 font-poppins font-medium text-[15px] text-[#333] hover:text-black transition-colors">
                {title}
                <span className={`transition-transform duration-300 text-gray-500 ${open ? "rotate-180" : ""}`}>
                    <ChevronDown size={18} strokeWidth={1.5} />
                </span>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}>
                <div className="overflow-hidden">
                    <div className="space-y-1">{children}</div>
                </div>
            </div>
        </div>
    );
}

export function Section({ title, children, className }: any) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={`border-b border-[#eee] ${className || ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-5 group"
            >
                <p className="font-poppins font-medium text-[15px] text-[#333] group-hover:text-black transition-colors">{title}</p>
                <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 pb-8" : "grid-rows-[0fr] opacity-0"}`}>
                <div className={`${!isOpen ? "overflow-hidden" : ""}`}>
                    <div className="px-2 text-left">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ================= RANGE CALENDAR (Design Match) ================= */

function RangeCalendar({ selectedRange, setSelectedRange }: any) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentYear = currentDate.getFullYear();
    const currentMonthIdx = currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    const startDay = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0(Sun) to 6(Sat)
    // Adjust for Mon start if design requires, but design shows Mon-Sun grid
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

    const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonthIdx - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonthIdx + 1, 1));

    const handleClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonthIdx, day);

        if (!selectedRange.start || selectedRange.end) {
            setSelectedRange({ start: clickedDate, end: null });
        } else {
            if (clickedDate >= selectedRange.start) {
                setSelectedRange({ start: selectedRange.start, end: clickedDate });
            } else {
                setSelectedRange({ start: clickedDate, end: selectedRange.start });
            }
        }
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-6 px-4">
                <ChevronLeft
                    size={16}
                    className="text-gray-400 cursor-pointer hover:text-black transition-colors"
                    onClick={handlePrevMonth}
                />
                <div className="text-center font-poppins font-semibold text-[13px] text-[#333]">
                    {monthNames[currentMonthIdx]} {currentYear}
                </div>
                <ChevronRight
                    size={16}
                    className="text-gray-400 cursor-pointer hover:text-black transition-colors"
                    onClick={handleNextMonth}
                />
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 text-[10px] text-gray-400 text-center mb-3 font-poppins uppercase tracking-wider font-medium">
                <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>

            <div className="grid grid-cols-7 gap-y-3 gap-x-0 text-[12px] text-center font-poppins">
                {Array.from({ length: adjustedStartDay }).map((_, i) => <div key={`empty-${i}`}></div>)}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const date = new Date(currentYear, currentMonthIdx, dayNum);

                    let isSelectedStart = false;
                    let isSelectedEnd = false;
                    let isInRange = false;

                    // Checking real state
                    if (selectedRange.start) isSelectedStart = date.getTime() === selectedRange.start.getTime();
                    if (selectedRange.end) isSelectedEnd = date.getTime() === selectedRange.end.getTime();
                    if (selectedRange.start && selectedRange.end) isInRange = date > selectedRange.start && date < selectedRange.end;

                    // Dynamic Classes
                    let containerClass = "w-8 h-8 flex items-center justify-center mx-auto transition-all relative ";
                    let textClass = "text-gray-600 font-medium";

                    // Range Background logic (Connectors)
                    // We need a pseudo-element or container for the range strip background
                    // Simplest way is conditional bg on the button wrapper itself, but dealing with rounded ends is tricky.
                    // Let's use standard background classes.

                    if (isInRange) {
                        containerClass = "w-full h-8 flex items-center justify-center bg-[#FFE4E8] rounded-none";
                        textClass = "text-black";
                    }

                    // If start or end, we need the pink strip behind it depending on direction, AND the black circle on top.
                    // This matches the design where the circle sits ON the strip.

                    let wrapperClass = "flex justify-center flex-1 relative";
                    if (selectedRange.start && selectedRange.end) {
                        if (isInRange) wrapperClass += " bg-[#F3D6DC]";
                        if (isSelectedStart) wrapperClass += " bg-gradient-to-r from-transparent from-50% to-[#F3D6DC] to-50%"; // Half pink on right
                        if (isSelectedEnd) wrapperClass += " bg-gradient-to-l from-transparent from-50% to-[#F3D6DC] to-50%";   // Half pink on left
                    }

                    if (isSelectedStart || isSelectedEnd) {
                        containerClass = "w-8 h-8 flex items-center justify-center bg-[#1a1a1a] text-white shadow-lg ";
                        textClass = "text-white font-medium";
                    } else if (!isInRange) {
                        containerClass += " hover:bg-gray-100";
                    }

                    return (
                        <div key={i} className={wrapperClass}>
                            <button
                                onClick={() => handleClick(dayNum)}
                                className={`${containerClass} ${textClass}`}>
                                {dayNum}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
