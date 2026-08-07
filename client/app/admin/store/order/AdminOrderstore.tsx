'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';

// -------------------------------
// 📘 Interfaces (Type Definitions)
// -------------------------------
interface UserInfo {
  id: string;
  name: string;
  avatar: string | null;
}

interface ItemInfo {
  name: string;
  image: string | null;
}

interface RentalPeriod {
  start: string;
  end: string;
  buffer: number;
}

export interface OrderTableItem {
  id: string;
  orderNumber?: string;
  borrower: UserInfo;
  lender: UserInfo;
  items: ItemInfo[];
  rentalPeriod: RentalPeriod;
  totalAmount: number;
  depositHeld: number;
  status: string;
  created: string;
  timeline?: any[];
  shippedDate?: string;
  shippingProvider?: string;
  trackingNumber?: string;
  trackingLink?: string;
  proofs?: any[];
  transaction?: any;
  platformFee?: number;
}


interface LenderOrderTableStore {
  orders: OrderTableItem[];
  selectedOrder: OrderTableItem | null;
  loading: boolean;
  pagination: any;
  fetchOrders: (params?: { activeTab?: string; searchQuery?: string; filters?: any }) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<OrderTableItem | null>;
  updateOrderStatus: (orderId: string, status: string, note?: string) => Promise<void>;
}

// -------------------------------
// 🧠 Zustand Store Implementation
// -------------------------------
export const useLenderOrderTableStore = create<LenderOrderTableStore>((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: true,
  pagination: null,

  fetchOrders: async (params?: { activeTab?: string; searchQuery?: string; filters?: any }) => {
    try {
      set({ loading: true });

      // Build query params for the API
      const queryParams: any = {};

      if (params?.activeTab && params.activeTab !== 'all') {
        queryParams.status = params.activeTab;
      }

      if (params?.searchQuery) queryParams.search = params.searchQuery;
      if (params?.filters) Object.assign(queryParams, params.filters);

      const res = await axiosClient.get(API_ENDPOINTS.Orders, { params: queryParams });
      const orders = res.data?.data?.orders || [];
      const pagination = res.data?.data?.pagination;

      const mappedOrders: OrderTableItem[] = orders.map((o: any) => {
        const product = o.products?.[0];
        const productDetails = o.productDetails?.[0];

        return {
          id: o._id,
          orderNumber: o.order_slug_id || 'N/A',
          borrower: {
            id: o.renterDetails?._id || '',
            name: o.renterDetails?.name || 'Unknown Renter',
            avatar: o.renterDetails?.profile_image || null,
          },
          lender: {
            id: o.lenderDetails?._id || '',
            name: o.lenderDetails?.name || 'Unknown Lender',
            avatar: o.lenderDetails?.profile_image || null,
          },
          items: [
            {
              name: productDetails?.name || product?.product_name || 'Unknown Item',
              image: productDetails?.cover_image || product?.cover_image || null,
            },
          ],
          rentalPeriod: {
            start: o.rentalStartDate || product?.start_date,
            end: o.rentalEndDate || product?.end_date,
            buffer: 2,
          },
          totalAmount: o.total_price || 0,
          depositHeld: o.security_deposit_total || 0,
          status: (o.status || 'unknown').toLowerCase(),
          created: o.created_at || '',
          timeline: o.timeline || [],

        };
      });

      set({ orders: mappedOrders, loading: false, pagination });
    } catch (err) {
      console.error('Error fetching orders:', err);
      set({ loading: false });
    }
  },

  fetchOrderById: async (orderId: string) => {
    try {
      set({ loading: true });

      const res = await axiosClient.get(`${API_ENDPOINTS.Orders}/${orderId}`);
      const orderData = res.data?.data;

      if (!orderData) {
        throw new Error('Order not found');
      }

      const product = orderData.products?.[0];
      const mappedOrder: OrderTableItem = {
        id: orderData._id,
        orderNumber: orderData.order_number || orderData.order_slug_id || 'N/A',
        borrower: {
          id: orderData.renter?._id || orderData.renter || '',
          name: orderData.renter?.name || orderData.renterDetails?.name || 'Unknown Renter',
          avatar: orderData.renter?.profile_image || orderData.renterDetails?.profile_image || null,
        },
        lender: {
          id: orderData.lender?._id || orderData.lender || '',
          name: orderData.lender?.name || orderData.lenderDetails?.name || 'Lender',
          avatar: orderData.lender?.profile_image || orderData.lenderDetails?.profile_image || null,
        },
        items: (orderData.products || []).map((p: any) => ({
          name: p.product?.name || p.product_name || (orderData.productDetails?.[0]?.name) || 'Unknown Item',
          image: p.product?.cover_image || p.cover_image || (orderData.productDetails?.[0]?.cover_image) || null,
        })),
        rentalPeriod: {
          start: product?.start_date || orderData.rentalStartDate,
          end: product?.end_date || orderData.rentalEndDate,
          buffer: 2,
        },
        totalAmount: Number(orderData.total_price) || 0,
        depositHeld: Number(orderData.security_deposit_total) || 0,
        status: (orderData.status || 'unknown').toLowerCase(),
        created: orderData.created_at || '',
        timeline: orderData.timeline || [],
        shippedDate: orderData.shipped_date,
        shippingProvider: orderData.shipping_provider,
        trackingNumber: orderData.tracking_number,
        trackingLink: orderData.tracking_link,
        proofs: orderData.proofs || [],
        transaction: orderData.transaction ? {
          ...orderData.transaction,

        } : null,
        platformFee: orderData.platform_fee_total || 0,
      };

      set({ selectedOrder: mappedOrder, loading: false });
      return mappedOrder;
    } catch (err) {
      console.error('Error fetching order by ID:', err);
      set({ loading: false, selectedOrder: null });
      return null;
    }
  },

  updateOrderStatus: async (orderId: string, status: string, note?: string) => {
    try {
      const payload: any = { status };
      if (note) {
        payload.note = note;
      }

      const response = await axiosClient.post(
        `${API_ENDPOINTS.Orders}/${orderId}/status`,
        payload
      );

      if (response.data.success) {
        const { orders, selectedOrder } = get();
        const updatedOrders = orders.map(order =>
          order.id === orderId
            ? { ...order, status: status.toLowerCase() }
            : order
        );

        let updatedSelectedOrder = selectedOrder;
        if (selectedOrder?.id === orderId) {
          updatedSelectedOrder = { ...selectedOrder, status: status.toLowerCase() };
        }

        set({ orders: updatedOrders, selectedOrder: updatedSelectedOrder });
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  },
}));