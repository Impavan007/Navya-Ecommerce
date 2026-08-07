import { create } from "zustand";
import axiosClient from "../../LenderAPi/Axiosclient";
import { API_ENDPOINTS } from "../../LenderAPi/LenderAPiendPoints";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  status: string;
  note?: string;
  tracking_number?: string;
  tracking_link?: string;
  shipping_provider?: string;
}

interface OrderActionState {
  loading: boolean;
  error: string | null;
  success: boolean;
  orders: Record<string, Order>; // store orders by id
  updateOrderStatus: (
    orderId: string,
    status: string,
    note?: string,
    productIds?: string[],
    proof?: File[]
  ) => Promise<void>;
  setOrders: (orders: Order[]) => void;
}

export const useOrderActionStore = create<OrderActionState>((set, get) => ({
  loading: false,
  error: null,
  success: false,
  orders: {},

  setOrders: (orders) => {
    const formatted = orders.reduce((acc, order) => {
      acc[order._id] = order;
      return acc;
    }, {} as Record<string, Order>);
    set({ orders: formatted });
  },

  updateOrderStatus: async (orderId, status, note = "hello", productIds?: string[], proof?: File[]) => {
    try {
      set({ loading: true, error: null, success: false });

      // ✅ Map readable status labels
      const statusMapping: Record<string, string> = {
        active: "Active",
        returned: "Returned",
        completed: "Completed",
        cancelled: "Cancelled",
        shipped: "Shipped",
        accepted: "Accepted",
        pending: "Requested",
        upcoming: "Upcoming",
        orderplaced: "Order Placed",
      };

      const formattedStatus =
        statusMapping[status.toLowerCase()] ||
        status.charAt(0).toUpperCase() + status.slice(1);

      let body: any = { status: formattedStatus };

      // 🟢 If order is "Shipped", extract tracking data from note
      if (formattedStatus === "Shipped" && note) {
        const trackingData: any = {};

        const numberMatch = note.match(/Tracking Number:\s*([^,]+)/i);
        const linkMatch = note.match(/Tracking Link:\s*([^,]+)/i);
        const providerMatch = note.match(/Shipping Provider:\s*(.+)/i);

        if (numberMatch) trackingData.tracking_number = numberMatch[1].trim();
        if (linkMatch) trackingData.tracking_link = linkMatch[1].trim();
        if (providerMatch)
          trackingData.shipping_provider = providerMatch[1].trim();

        body = { ...body, ...trackingData };
      } else {
        body.note = note;
      }

      // include product ids when provided (send all products for the order action)
      if (productIds && Array.isArray(productIds) && productIds.length) {
        body.productIds = productIds;
      }

      // If proof files are provided, use FormData and send multipart/form-data
      let response;
      if (proof && Array.isArray(proof) && proof.length) {
        const formData = new FormData();
        // append all keys from body
        Object.keys(body).forEach((key) => {
          const val = (body as any)[key];
          if (val !== undefined && val !== null) {
            // For arrays/objects, stringify
            if (typeof val === 'object') {
              formData.append(key, JSON.stringify(val));
            } else {
              formData.append(key, String(val));
            }
          }
        });

        // append productIds as JSON if provided
        if (productIds && productIds.length) {
          formData.append('productIds', JSON.stringify(productIds));
        }

        // append proof files
        proof.forEach((file) => {
          formData.append('proof', file as Blob);
        });
        response = await axiosClient.post(
          `${API_ENDPOINTS.Order}/${orderId}/status`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        response = await axiosClient.post(
          `${API_ENDPOINTS.Order}/${orderId}/status`,
          body
        );
      }
      // 🟢 Update local store immediately
      const currentOrders = get().orders;
      const updatedOrder = {
        ...currentOrders[orderId],
        ...body,
      };

      if (response.data?.message) {
        toast.success(response.data.message);
      }

      set({
        loading: false,
        success: true,
        orders: { ...currentOrders, [orderId]: updatedOrder },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage) {
        toast.error(errorMessage);
      }
      set({
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  },
}));
