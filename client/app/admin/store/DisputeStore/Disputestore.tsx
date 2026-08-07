'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import { toast } from 'react-hot-toast';

export interface DisputeUser {
  id: string;
  name: string;
  avatar: string;
  chatId?: string;
}

export interface MappedDispute {
  id: string;
  support_slug_id: string;
  orderId: string;
  borrower: DisputeUser;
  orderNumber: string;
  lender: DisputeUser;
  item: any;
  reason: string;
  status: 'open' | 'under_review' | 'progress' | 'resolved' | 'escalated' | 'rejected' | 'closed';
  dateOpened: string;
  description: string;
  evidence: {
    borrower: Array<{ type: string; url: string; description: string; uploadedAt: string }>;
    lender: Array<{ type: string; url: string; description: string; uploadedAt: string }>;
  };
  orderValue: number;
  depositAmount: number;
  auditTrail: Array<{
    action: string;
    user: string;
    timestamp: string;
    notes: string;
    // optional proof attached to this audit entry (for order timeline events)
    proof?: any;
  }>;
  // Optionally include a proof attached to the audit entry (for order timelines)
  // proof is only set when a corresponding order proof image exists for that timeline event
  // and will be omitted for non-order disputes.
  // Example: { title: 'Status Updated to Shipped', url: 'https://...', uploadedBy: 'Lender', uploadedAt: '...' }

  isOrder?: boolean;
  order_slug_id?: string;
  creator_role?: string;
}

interface DisputeState {
  disputes: MappedDispute[];
  loading: boolean;
  error: string | null;
  lastFetchOptions: any;
  fetchDisputes: (opts?: { isOrder?: boolean; page?: number; limit?: number; status?: string; reason?: string; searched?: string; dateRange?: string }) => Promise<void>;
  resolveDispute: (disputeId: string) => Promise<void>;
  rejectDispute: (disputeId: string, reason?: string) => Promise<void>;
  markUnderReview: (disputeId: string) => Promise<void>;
  fetchDisputeById: (disputeId: string) => Promise<MappedDispute | null>;
  historyMessages: any[];
  isFetchingHistory: boolean;
  fetchOrderChatHistory: (supportId: string) => Promise<void>;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
  statusCounts: {
    all: number;
    Open: number;
    Progress: number;
    Resolved: number;
    Closed: number;
    Rejected: number;
  };
}

const useDisputeStore = create<DisputeState>((set, get) => ({
  disputes: [],
  loading: false,
  error: null,
  lastFetchOptions: {},
  historyMessages: [],
  isFetchingHistory: false,
  pagination: { page: 1, totalPages: 1, totalItems: 0, limit: 10 },
  statusCounts: { all: 0, Open: 0, Progress: 0, Resolved: 0, Closed: 0, Rejected: 0 },

  fetchDisputes: async (opts?: { isOrder?: boolean; page?: number; limit?: number; status?: string; reason?: string; searched?: string; dateRange?: string }) => {
    set({ loading: true, error: null, lastFetchOptions: opts || {} });
    try {
      const params: any = {};
      if (typeof opts?.isOrder === 'boolean') params.isOrder = opts?.isOrder;
      if (typeof opts?.page === 'number') params.page = opts.page;
      if (typeof opts?.limit === 'number') params.limit = opts.limit;
      if (opts?.status) params.status = opts.status;
      if (opts?.reason) params.category = opts.reason;
      if (opts?.searched) params.searched = opts.searched;
      if (opts?.dateRange) params.period = opts.dateRange;

      const res = await axiosClient.get(API_ENDPOINTS.Support, { params });

      // Support many shapes: { data: { supports: [...], pagination: {...} } } or { supports: [...], pagination: {...} }
      const apiDisputes = res.data.data?.supports || res.data.supports || res.data.data || res.data || [];
      const apiPagination = res.data.data?.pagination || res.data.pagination || (res.data.data?.totalPages ? res.data.data : null);

      const mapped = apiDisputes.map((d: any): MappedDispute => {
        // Safely extract order information
        const orderData = d.order || {};
        const hasOrder = Boolean(d.order_id || d.order || d.product);

        // Safely extract product information
        const productData = d.product || {};

        // Safely extract user information
        const userData = d.user || {};

        // Safely extract lender information
        const lenderData = d.lender || {};

        return {
          support_slug_id: d.support_slug_id,
          id: d.id,
          orderNumber: orderData.order_slug_id || '',
          orderId: orderData.id || d.order_id || '',
          borrower: {
            id: userData.id || 'unknown',
            name: userData.name || 'N/A',
            avatar: userData.avatar || 'https://via.placeholder.com/40',
            chatId: userData.chatId
          },
          lender: lenderData.id
            ? {
              id: lenderData.id,
              name: lenderData.name || 'N/A',
              avatar: lenderData.avatar || 'https://via.placeholder.com/40',
              chatId: lenderData.chatId
            }
            : { id: 'unknown', name: 'N/A', avatar: 'https://via.placeholder.com/40' },
          item: productData.id
            ? {
              name: productData.name || 'N/A',
              brand: productData.brand || 'N/A',
              image: productData.image || 'https://via.placeholder.com/80'
            }
            : { name: 'N/A', brand: 'N/A', image: 'https://via.placeholder.com/80' },
          reason: (d.category || 'other').toLowerCase(),
          status: (d.status || 'open').toLowerCase().replace(/\s/g, '_') as 'open' | 'under_review' | 'resolved' | 'escalated' | 'rejected',
          dateOpened: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: d.description || '',
          evidence: {
            borrower: (d.support_images || []).map((img: any) => ({
              type: 'photo',
              url: img.url || '',
              description: img.description || '',
              uploadedAt: new Date(img.uploaded_at || d.created_at || new Date()).toISOString()
            })),
            lender: []
          },
          orderValue: orderData.total_price || 0,
          depositAmount: orderData.security_deposit_total || 0,
          auditTrail: [
            {
              action: 'Dispute created',
              user: userData.name || 'System',
              timestamp: new Date(d.created_at || new Date()).toISOString(),
              notes: d.description || 'Dispute created'
            }
          ],
          isOrder: hasOrder
        };
      });

      // set pagination from response when available
      const pagination = apiPagination
        ? {
          page: apiPagination.page || apiPagination.current_page || 1,
          totalPages: apiPagination.total_pages || apiPagination.last_page || Math.ceil((apiPagination.total || 0) / (apiPagination.limit || apiPagination.per_page || 20)),
          totalItems: apiPagination.total || apiPagination.total_items || 0,
          limit: apiPagination.limit || apiPagination.per_page || opts?.limit || 20
        }
        : { page: opts?.page || 1, totalPages: 1, totalItems: mapped.length, limit: opts?.limit || 20 };

      const statusCounts = res.data.data?.statusCounts || { all: mapped.length, Open: 0, Progress: 0, Resolved: 0, Closed: 0, Rejected: 0 };
      set({ disputes: mapped, loading: false, pagination, statusCounts });
    } catch (err: any) {
      console.error('Error fetching disputes:', err);
      set({ error: err.message || 'Failed to fetch disputes', loading: false });
    }
  },

  // Resolve a dispute quickly (used for non-order disputes where admin wants to resolve without opening decision modal)
  resolveDispute: async (disputeId: string) => {
    // optimistic update
    set((state) => ({
      disputes: state.disputes.map((d) => (d.id === disputeId ? { ...d, status: 'resolved' } : d))
    }));

    try {
      const payload = { decision: '', description: 'Resolved by admin', status: 'Resolved' };
      const response = await axiosClient.post(`${API_ENDPOINTS.Support}/${disputeId}/decision`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Reload page on success (201 or any success status)
      if (response.status === 201 || (response.status >= 200 && response.status < 300)) {
        toast.success(response.data?.message || 'Dispute resolved successfully');
        get().fetchDisputes(get().lastFetchOptions);
      }
    } catch (err) {
      // revert optimistic update on error
      console.error('Failed to resolve dispute:', err);
      // refetch to restore canonical state
      set({ loading: true });
      try {
        const res = await axiosClient.get(API_ENDPOINTS.Support);
        const apiDisputes = res.data.data.supports || res.data.supports || res.data || [];
        const mapped = apiDisputes.map((d: any): MappedDispute => ({
          support_slug_id: d.support_slug_id || '',
          id: d.id,
          orderNumber: d.order?.order_number || '',
          orderId: d.order_id || d.orderId || d.id || '',
          borrower: {
            id: d.user.id,
            name: d.user.name,
            avatar: d.user.avatar || 'https://via.placeholder.com/40'
          },
          lender: d.lender
            ? { id: d.lender.id, name: d.lender.name, avatar: d.lender.avatar || 'https://via.placeholder.com/40' }
            : { id: 'unknown', name: 'N/A', avatar: 'https://via.placeholder.com/40' },
          item: d.product || { name: 'N/A', brand: 'N/A', image: 'https://via.placeholder.com/80' },
          reason: d.category.toLowerCase().replace(/\s/g, '_'),
          status: d.status.toLowerCase().replace(/\s/g, '_') as 'open' | 'under_review' | 'resolved' | 'escalated',
          dateOpened: new Date(d.created_at).toISOString().split('T')[0],
          description: d.description,
          evidence: { borrower: (d.support_images || []).map((img: any) => ({ type: 'photo', url: img.url, description: img.description || '', uploadedAt: new Date(d.created_at).toISOString() })), lender: [] },
          orderValue: 0,
          depositAmount: 0,
          auditTrail: [{ action: 'Dispute created', user: d.user.name, timestamp: new Date(d.created_at).toISOString(), notes: d.description || 'Dispute created' }],
          isOrder: Boolean(d.order_id || d.order || d.product)
        }));
        set({ disputes: mapped, loading: false });
      } catch (e) {
        set({ loading: false });
      }
    }
  },

  // Reject a dispute (non-order scenario)
  rejectDispute: async (disputeId: string, reason?: string) => {
    // optimistic update to rejected
    set((state) => ({
      disputes: state.disputes.map((d) => (d.id === disputeId ? { ...d, status: 'rejected' } : d))
    }));

    try {
      const payload = { decision: '', description: reason || 'Rejected by admin', status: 'Rejected' };
      const response = await axiosClient.post(`${API_ENDPOINTS.Support}/${disputeId}/decision`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Reload page on success (201 or any success status)
      if (response.status === 201 || response.status >= 200 && response.status < 300) {
        toast.success(response.data?.message || 'Update Successful'); get().fetchDisputes(get().lastFetchOptions);
      }
    } catch (err) {
      console.error('Failed to reject dispute:', err);
      // revert by refetching
      set({ loading: true });
      try {
        const res = await axiosClient.get(API_ENDPOINTS.Support);
        const apiDisputes = res.data.data?.supports || res.data.supports || res.data || [];
        const mapped = apiDisputes.map((d: any): MappedDispute => ({
          support_slug_id: d.support_slug_id || '',
          id: d.id,
          orderNumber: d.order ? d.order.order_number : '',
          orderId: d.order ? d.order?.id : '',
          borrower: { id: d.user.id, name: d.user.name, avatar: d.user.avatar || 'https://via.placeholder.com/40' },
          lender: d.lender ? { id: d.lender.id, name: d.lender.name, avatar: d.lender.avatar || 'https://via.placeholder.com/40' } : { id: 'unknown', name: 'N/A', avatar: 'https://via.placeholder.com/40' },
          item: d.product || { name: 'N/A', brand: 'N/A', image: 'https://via.placeholder.com/80' },
          reason: d.category.toLowerCase().replace(/\s/g, '_'),
          status: d.status.toLowerCase().replace(/\s/g, '_') as any,
          dateOpened: new Date(d.created_at).toISOString().split('T')[0],
          description: d.description,
          evidence: { borrower: (d.support_images || []).map((img: any) => ({ type: 'photo', url: img.url, description: img.description || '', uploadedAt: new Date(d.created_at).toISOString() })), lender: [] },
          orderValue: 0,
          depositAmount: 0,
          auditTrail: [{ action: 'Dispute created', user: d.user.name, timestamp: new Date(d.created_at).toISOString(), notes: d.description || 'Dispute created' }],
          isOrder: Boolean(d.order_id || d.order || d.product)
        }));
        set({ disputes: mapped, loading: false });
      } catch (e) {
        set({ loading: false });
      }
    }
  },

  // Mark a dispute as under review (in-progress)
  markUnderReview: async (disputeId: string) => {
    // optimistic update to under_review
    set((state) => ({
      disputes: state.disputes.map((d) => (d.id === disputeId ? { ...d, status: 'under_review' } : d))
    }));

    try {
      const payload = { decision: '', description: 'Marked under review by admin', status: 'Progress' };
      const response = await axiosClient.post(`${API_ENDPOINTS.Support}/${disputeId}/decision`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Reload page on success (201 or any success status)
      if (response.status === 201 || response.status >= 200 && response.status < 300) {
        toast.success(response.data?.message || 'Update Successful'); get().fetchDisputes(get().lastFetchOptions);
      }
    } catch (err) {
      console.error('Failed to mark dispute under review:', err);
      // refetch to restore canonical state
      set({ loading: true });
      try {
        const res = await axiosClient.get(API_ENDPOINTS.Support);
        const apiDisputes = res.data.data?.supports || res.data.supports || res.data || [];
        const mapped = apiDisputes.map((d: any): MappedDispute => ({
          support_slug_id: d.support_slug_id || '',
          id: d.id,
          orderNumber: d.order ? d.order.order_number : '',
          orderId: d.order ? d.order?.id : '',
          borrower: { id: d.user.id, name: d.user.name, avatar: d.user.avatar || 'https://via.placeholder.com/40' },
          lender: d.lender ? { id: d.lender.id, name: d.lender.name, avatar: d.lender.avatar || 'https://via.placeholder.com/40' } : { id: 'unknown', name: 'N/A', avatar: 'https://via.placeholder.com/40' },
          item: d.product || { name: 'N/A', brand: 'N/A', image: 'https://via.placeholder.com/80' },
          reason: d.category.toLowerCase().replace(/\s/g, '_'),
          status: d.status.toLowerCase().replace(/\s/g, '_') as any,
          dateOpened: new Date(d.created_at).toISOString().split('T')[0],
          description: d.description,
          evidence: { borrower: (d.support_images || []).map((img: any) => ({ type: 'photo', url: img.url, description: img.description || '', uploadedAt: new Date(d.created_at).toISOString() })), lender: [] },
          orderValue: 0,
          depositAmount: 0,
          auditTrail: [{ action: 'Dispute created', user: d.user.name, timestamp: new Date(d.created_at).toISOString(), notes: d.description || 'Dispute created' }],
          isOrder: Boolean(d.order_id || d.order || d.product)
        }));
        set({ disputes: mapped, loading: false });
      } catch (e) {
        set({ loading: false });
      }
    }
  },

  fetchDisputeById: async (disputeId: string): Promise<MappedDispute | null> => {
    try {
      const res = await axiosClient.get(`${API_ENDPOINTS.Support}/${disputeId}`);
      const apiData = res.data.data?.support || res.data.support;
      const orderData = res.data.data?.order;
      const productData = res.data.data?.order?.product;




      if (!apiData) return null;


      // Create audit trail
      let auditTrail = [];

      // Always add dispute creation as first entry
      auditTrail.push({
        action: 'Dispute Created',
        user: apiData.creator_role === 'Lender' ? apiData.lender?.name : apiData.user?.name,
        timestamp: new Date(apiData.created_at).toISOString(),
        notes: `Dispute raised: ${apiData.subject || apiData.description || 'No description'}`
      });

      // For order disputes, add order timeline events
      if (orderData && orderData.timeline) {
        orderData.timeline.forEach((event: any) => {
          let proofUrl = null;

          // Try to find matching proof - improved matching logic
          if (orderData.proofs && Array.isArray(orderData.proofs)) {
            const matchingProof = orderData.proofs.find((p: any) => {
              if (!p || !p.title || !event.title) return false;

              const proofTitle = String(p.title).trim().toLowerCase();
              const eventTitle = String(event.title).trim().toLowerCase();

              // More flexible matching
              return proofTitle === eventTitle ||
                proofTitle.includes(eventTitle) ||
                eventTitle.includes(proofTitle) ||
                proofTitle.includes('shipped') && eventTitle.includes('shipped') ||
                proofTitle.includes('delivery') && eventTitle.includes('delivery') ||
                proofTitle.includes('return') && eventTitle.includes('return');
            });

            if (matchingProof && matchingProof.url) {
              proofUrl = matchingProof.url;
            }
          }

          const auditEntry: any = {
            action: event.title || 'Status Updated',
            user: event.by === apiData.user?.id ? apiData.user?.name :
              event.by === apiData.lender?.id ? apiData.lender?.name :
                'System',
            timestamp: new Date(event.date || apiData.created_at).toISOString(),
            notes: event.note || event.title || 'Status updated'
          };

          // Add proof if available
          if (proofUrl) {
            auditEntry.proof = proofUrl;
          }

          auditTrail.push(auditEntry);
        });
      }

      // Add status-specific entries for non-order disputes or additional status updates
      const status = apiData.status.toLowerCase().replace(/\s/g, '_');

      if (status === 'progress' || status === 'under_review') {
        auditTrail.push({
          action: 'Dispute In Progress',
          user: 'admin',
          timestamp: new Date(apiData.updated_at).toISOString(),
          notes: 'Dispute is under review by support team'
        });

      } else if (status === 'resolved') {
        auditTrail.push({
          action: 'Dispute Resolved',
          user: 'admin',
          timestamp: new Date(apiData.updated_at).toISOString(),
          notes: 'Dispute has been resolved'
        });
      } else if (status === 'rejected') {
        auditTrail.push({
          action: 'Dispute Rejected',
          user: 'admin',
          timestamp: new Date(apiData.updated_at).toISOString(),
          notes: 'Dispute has been rejected'
        });
      }

      // Sort audit trail by timestamp
      auditTrail = auditTrail.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());


      const mappedDispute: MappedDispute = {
        id: apiData.id,
        support_slug_id: apiData.support_slug_id || '',
        orderNumber: apiData.order?.order_number || '',
        orderId: orderData?.id || '',
        borrower: apiData.user ? {
          id: apiData.user.id,
          name: apiData.user.name,
          avatar: apiData.user.avatar || 'https://via.placeholder.com/40',
          chatId: apiData.user.chatId
        } : { id: 'unknown', name: 'N/A', avatar: 'https://via.placeholder.com/40' },
        lender: apiData.lender
          ? {
            id: apiData.lender.id,
            name: apiData.lender.name,
            avatar: apiData.lender.avatar || 'https://via.placeholder.com/40',
            chatId: apiData.lender.chatId
          }
          : { id: 'unknown', name: 'N/A', avatar: 'https://via.placeholder.com/40' },
        item: productData ? {
          name: productData.product_name || productData.name || 'N/A',
          brand: productData.brand || 'N/A',
          image: productData.cover_image || productData.image || 'https://via.placeholder.com/80',
          size: productData.size || 'N/A',
          quantity: productData.quantity || 1,
          rentalPrice: productData.rental_price_per_day || 0,
          duration: productData.duration || 0,
          subtotal: productData.subtotal || 0
        } : {
          name: 'N/A',
          brand: 'N/A',
          image: 'https://via.placeholder.com/80',
          size: 'N/A',
          quantity: 1,
          rentalPrice: 0,
          duration: 0,
          subtotal: 0
        },
        reason: (apiData.category || 'other').toLowerCase().replace(/\s/g, '_'),
        status: (apiData.status || 'open').toLowerCase().replace(/\s/g, '_') as 'open' | 'under_review' | 'resolved' | 'escalated' | 'rejected',
        dateOpened: new Date(apiData.created_at).toISOString().split('T')[0],
        description: apiData.description || '',
        evidence: {
          borrower: (apiData.support_images || []).map((img: any) => ({
            type: 'photo',
            url: img.url,
            description: img.description || '',
            uploadedAt: new Date(img.uploaded_at || apiData.created_at).toISOString()
          })),
          lender: []
        },
        orderValue: orderData?.total_price || 0,
        depositAmount: orderData?.security_deposit_total || 0,
        auditTrail: auditTrail,
        isOrder: Boolean(orderData),
        creator_role: apiData.creator_role || 'Renter'
      };
      return mappedDispute;
    } catch (err: any) {
      console.error('Failed to fetch dispute details:', err);
      set({ error: err.message || 'Failed to fetch dispute details' });
      return null;
    }
  },
  fetchOrderChatHistory: async (supportId: string) => {
    set({ isFetchingHistory: true });
    try {
      const res = await axiosClient.get(`${API_ENDPOINTS.ORDER_CHAT}/${supportId}/order-chat`);
      if (res.data?.success) {
        set({ historyMessages: res.data.data.messages || [] });
      }
    } catch (err) {
      console.error('Failed to fetch order chat history:', err);
      set({ historyMessages: [] });
    } finally {
      set({ isFetchingHistory: false });
    }
  },
}));

export default useDisputeStore;
