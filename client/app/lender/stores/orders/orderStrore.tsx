import { create } from "zustand";
import axiosClient from "../../LenderAPi/Axiosclient";
import { API_ENDPOINTS } from "../../LenderAPi/LenderAPiendPoints";

export interface ProductItem {
  id: string;
  title: string;
  image: string | null;
  category: string;
  size: string;
}

export interface TimelineItem {
  title: string;
  by: string | null;
  note?: string;
  date: string;
}

export interface Address {
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  id: string;
  createdAt: string;
}

export interface Borrower {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  avatar?: string | null; // Added for compatibility
}

export interface Order {
  id: string;
  items: ProductItem[];
  borrower: Borrower;
  startDate: string;
  endDate: string;
  duration: number;
  rentalPricePerDay: number;
  cleaningFee: number;
  securityDeposit: number;
  subtotal: number;
  rentalFeeTotal: number;
  cleaningFeeTotal: number;
  securityDepositTotal: number;
  platformFee: number;
  chatId: string;
  shippingCharge: number;
  totalPrice: number;
  status: string;
  timeline: TimelineItem[];
  address: Address | null;
  itemCount: number;
  createdAt: string;
  orderNumber: string;
  order_number?: string; // Added for compatibility
  metadata: any;
  extensions?: any[];
  extensionRequests?: any[];
}

interface LenderOrderStore {
  orders: Order[];
  selectedOrder: Order | null;
  isFetchingOrder: boolean;
  pagination?: any;
  selectedItemIds: string[];
  loading: boolean;
  fetchOrderById: (id: string) => Promise<void>;
  clearSelectedOrder: () => void;
  acceptExtension: (params: { orderId: string; payload: any }) => Promise<any>;
  rejectExtension: (params: { orderId: string; payload: any }) => Promise<any>;
  statusSummary: any;
  fetchOrders: (filters?: {
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<void>;
  toggleItemSelection: (id: string) => void;
  clearSelections: () => void;
}

export const useLenderOrderStore = create<LenderOrderStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  isFetchingOrder: false,
  selectedItemIds: [],
  loading: true,
  statusSummary: {},


  fetchOrders: async (filters = {}) => {
    try {
      set({ loading: true });

      // Convert filters object into query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const res = await axiosClient.get(`${API_ENDPOINTS.Order}?${queryParams.toString()}`);
      const orders = res.data?.data?.orders || [];
      const pagination = res.data?.data?.pagination || {};
      const statusSummary = res.data?.data?.statusSummary || {};

      const mapped: Order[] = orders.map((o: any) => {
        const products = o.productDetails || []; // Updated from products to productDetails
        const parsedAddress = o.address ? JSON.parse(o.address) : null;

        // Map all products to items array
        const items: ProductItem[] = products.map((p: any) => ({
          id: p?._id || p?.product,
          title: p?.name,
          image: p?.cover_image || null,
          category: typeof p?.category === 'object' ? p?.category?.name : p?.category,
          size: p?.size,
        }));

        return {
          id: o._id,
          items: items,
          borrower: {
            id: o.renterDetails?._id,
            name: o.renterDetails?.name,
            email: o.renterDetails?.email,
            phone: o.renterDetails?.phone || null,
            profileImage: o.renterDetails?.profile_image || null,
            avatar: o.renterDetails?.profile_image || null, // Compatibility
          },
          startDate: o.rentalStartDate || "",
          endDate: o.rentalEndDate || "",
          duration: o.duration || 0,
          rentalPricePerDay: o.rental_price_per_day || 0,
          cleaningFee: o.cleaning_fee || 0,
          securityDeposit: o.security_deposit || 0,
          subtotal: 0, // Not explicitly in provided list data
          rentalFeeTotal: o.rental_fee_total,
          cleaningFeeTotal: o.cleaning_fee_total,
          securityDepositTotal: o.security_deposit_total,
          platformFee: o.platform_fee,
          shippingCharge: o.shipping_charge,
          totalPrice: o.total_price,
          status: o.status?.toLowerCase() || "unknown",
          timeline: o.timeline || [],
          createdAt: o.created_at || o.timeline?.[0]?.date || "",
          orderNumber: o.order_slug_id,

          address: parsedAddress
            ? {
              label: parsedAddress.label,
              line1: `${parsedAddress.street_name || ''} ${parsedAddress.house_number || ''}`.trim(),
              line2: parsedAddress.house_number_suffix || '',
              city: parsedAddress.city,
              state: '',
              postalCode: parsedAddress.postal_code,
              country: parsedAddress.country,
              isPrimary: parsedAddress.is_primary,
              id: parsedAddress._id,
              createdAt: parsedAddress.created_at,
            }
            : null,
          itemCount: o.itemCount || items.length,
        };
      });

      set({ orders: mapped, loading: false, pagination: pagination, statusSummary: statusSummary });
    } catch (err) {
      console.error("Error fetching orders", err);
      set({ loading: false });
    }
  },

  // Fetch a single order by id and map it to the same Order shape
  fetchOrderById: async (id: string) => {
    try {
      set({ isFetchingOrder: true });
      const res = await axiosClient.get(`${API_ENDPOINTS.Order}/${id}`);
      const payload = res?.data ?? res;
      const o = payload?.data ?? payload ?? null;
      if (!o) {
        set({ selectedOrder: null, isFetchingOrder: false });
        return;
      }

      const products = o.products || [];
      const parsedAddress = o?.deliveryDetails?.address;

      const items: ProductItem[] = products.map((p: any) => ({
        id: p?.product,
        title: p?.product_name,
        image: p?.cover_image || null,
        category: p?.category_name,
        size: p?.size,
      }));

      const firstProduct = products[0] || {};

      const mappedOrder: Order = {
        id: o._id,
        items: [
          {
            id: o.product?._id,
            title: o.product?.name,
            image: o.product?.cover_image || null,
            category: typeof o.product?.category === 'object' ? o.product?.category?.name : o.product?.category,
            size: o.size,
          }
        ],
        borrower: {
          id: o.renter?._id,
          name: o.renter?.name,
          email: o.renter?.email,
          phone: o.renter?.phone || null,
          profileImage: o.renter?.profile_image || null,
          avatar: o.renter?.profile_image || null, // Compatibility
        },
        startDate: o.start_date || "",
        endDate: o.end_date || "",
        duration: o.duration || 0,
        rentalPricePerDay: o.rental_price_per_day || 0,
        cleaningFee: o.cleaning_fee || 0,
        securityDeposit: o.security_deposit || 0,
        subtotal: o.rental_fee_total,
        rentalFeeTotal: o.rental_fee_total,
        cleaningFeeTotal: o.cleaning_fee_total,
        securityDepositTotal: o.security_deposit_total,
        platformFee: o.platform_fee,
        shippingCharge: o.shipping_charge,
        totalPrice: o.total_price,
        status: o.status?.toLowerCase() || "unknown",
        timeline: o.timeline || [],
        createdAt: o.created_at || o.timeline?.[0]?.date || "",
        orderNumber: o.order_slug_id,
        address: parsedAddress
          ? {
            label: '',
            line1: parsedAddress.street || '',
            line2: '',
            city: parsedAddress.city || '',
            state: parsedAddress.state || '',
            postalCode: parsedAddress.postal_code || '',
            country: parsedAddress.country || '',
            isPrimary: false,
            id: '',
            createdAt: '',
          }
          : null,
        itemCount: o.quantity || 1,
        metadata: o.metadata,
        chatId: o.chat_id,
      };

      set({ selectedOrder: mappedOrder, isFetchingOrder: false });
    } catch (err) {
      console.error('Error fetching order by id', err);
      set({ selectedOrder: null, isFetchingOrder: false });
    }
  },
  clearSelectedOrder: () => set({ selectedOrder: null }),

  // Accept an extension request and refresh selected order
  // Accept an extension request and refresh selected order
  acceptExtension: async (params: { orderId: string; payload: any }) => {
    try {
      const res = await axiosClient.post(`/lender/orders/${params.orderId}/extension/respond`, params.payload);
      const sel = get().selectedOrder;
      if (sel?.id) await get().fetchOrderById(sel.id);
      return res?.data ?? res;
    } catch (err) {
      console.error('Error accepting extension', err);
      throw err;
    }
  },

  // Reject an extension request and refresh selected order
  rejectExtension: async (params: { orderId: string; payload: any }) => {
    try {
      const res = await axiosClient.post(`/lender/orders/${params.orderId}/extension/respond`, params.payload);
      const sel = get().selectedOrder;
      if (sel?.id) await get().fetchOrderById(sel.id);
      return res?.data ?? res;
    } catch (err) {
      console.error('Error rejecting extension', err);
      throw err;
    }
  },

  toggleItemSelection: (id) => {
    const { selectedItemIds } = get();
    if (selectedItemIds.includes(id)) {
      set({ selectedItemIds: selectedItemIds.filter((i) => i !== id) });
    } else {
      set({ selectedItemIds: [...selectedItemIds, id] });
    }
  },

  clearSelections: () => set({ selectedItemIds: [] }),
}));