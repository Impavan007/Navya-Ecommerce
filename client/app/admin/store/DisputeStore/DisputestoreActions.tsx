'use client';

import { create } from 'zustand';
import axiosClient from '../../adminApi/axiosClient';
import { API_ENDPOINTS } from '../../adminApi/apiEndpoints';
import { toast } from 'react-hot-toast';
import useDisputeStore from './Disputestore';

interface DecisionState {
  selectedDecision: string;
  refundAmount: string;
  lateFeeAmount: string;
  notes: string;
  isSubmitting: boolean;
  setSelectedDecision: (value: string) => void;
  setRefundAmount: (value: string) => void;
  setLateFeeAmount: (value: string) => void;
  setNotes: (value: string) => void;
  submitDecision: (disputeId: string) => Promise<void>;
}

const useDecisionStore = create<DecisionState>((set, get) => ({
  selectedDecision: '',
  refundAmount: '',
  lateFeeAmount: '',
  notes: '',
  isSubmitting: false,

  setSelectedDecision: (value) => set({ selectedDecision: value }),
  setRefundAmount: (value) => set({ refundAmount: value }),
  setLateFeeAmount: (value) => set({ lateFeeAmount: value }),
  setNotes: (value) => set({ notes: value }),

  submitDecision: async (disputeId: string) => {
    const { selectedDecision, refundAmount, lateFeeAmount, notes } = get();

    if (!selectedDecision) return;

    set({ isSubmitting: true });

    try {
      const deductionAmount =
        selectedDecision === 'PartialDeduction'
          ? refundAmount
          : selectedDecision === 'ApplyLate'
            ? lateFeeAmount
            : '';

      // Construct payload according to API requirements
      const payload = {
        decision: selectedDecision,
        description: notes || '',
        status: 'Resolved',
        ...(deductionAmount !== '' && { deductionAmount }),
        ...(selectedDecision === 'PartialDeduction' && { refundAmount }),
        ...(selectedDecision === 'ApplyLate' && { lateFeeAmount }),
      };
      const response = await axiosClient.post(
        `${API_ENDPOINTS.Support}/${disputeId}/decision`,
        payload, // Send JSON body
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      // Reset state after successful submission
      set({
        selectedDecision: '',
        refundAmount: '',
        lateFeeAmount: '',
        notes: '',
        isSubmitting: false,
      });

      toast.success(response.data?.message || 'Decision submitted successfully');
      useDisputeStore.getState().fetchDisputes(useDisputeStore.getState().lastFetchOptions);
    } catch (error) {
      console.error('Error submitting decision:', error);
      set({ isSubmitting: false });
    }
  },
  // convenience method to quickly resolve a dispute without using decision form/modal
  submitQuickResolve: async (disputeId: string) => {
    set({ isSubmitting: true });
    try {
      const payload = { decision: 'resolve', description: 'Resolved by admin (quick)', status: 'Resolved' };
      await axiosClient.post(`${API_ENDPOINTS.Support}/${disputeId}/decision`, payload, { headers: { 'Content-Type': 'application/json' } });
      set({ isSubmitting: false });
      toast.success('Dispute resolved successfully');
      useDisputeStore.getState().fetchDisputes(useDisputeStore.getState().lastFetchOptions);
    } catch (error) {
      console.error('Error resolving quickly:', error);
      set({ isSubmitting: false });
    }
  }
}));

export default useDecisionStore;
