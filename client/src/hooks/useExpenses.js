import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export const useMyExpenses = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', filters.page);
  if (filters.limit) params.set('limit', filters.limit);

  return useQuery({
    queryKey: ['myExpenses', filters],
    queryFn: () => api.get(`/expenses?${params.toString()}`).then((r) => r.data),
    staleTime: 30 * 1000,
  });
};

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => api.get('/expenses/pending').then((r) => r.data),
    refetchInterval: 60 * 1000,
  });
};

export const useAllExpenses = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  return useQuery({
    queryKey: ['allExpenses', filters],
    queryFn: () => api.get(`/expenses?${params.toString()}`).then((r) => r.data),
    staleTime: 30 * 1000,
  });
};

export const useExpenseById = (id) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: () => api.get(`/expenses/${id}`).then((r) => r.data),
    enabled: !!id,
  });
};

export const useSubmitExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) =>
      api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myExpenses'] });
      qc.invalidateQueries({ queryKey: ['allExpenses'] });
      toast.success('Expense submitted successfully!');
    },
  });
};

export const useApproveExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }) => api.post(`/approvals/${id}/approve`, { comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pendingApprovals'] });
      qc.invalidateQueries({ queryKey: ['allExpenses'] });
      qc.invalidateQueries({ queryKey: ['myExpenses'] });
      toast.success('Expense approved!');
    },
  });
};

export const useRejectExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }) => api.post(`/approvals/${id}/reject`, { comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pendingApprovals'] });
      qc.invalidateQueries({ queryKey: ['allExpenses'] });
      qc.invalidateQueries({ queryKey: ['myExpenses'] });
      toast.success('Expense rejected');
    },
  });
};

export const useCancelExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/expenses/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myExpenses'] });
      toast.success('Expense cancelled');
    },
  });
};

export const useOverrideExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, comment }) =>
      api.patch(`/expenses/${id}/override`, { action, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['allExpenses'] });
      toast.success('Expense overridden');
    },
  });
};

export const useUploadOCR = () => {
  return useMutation({
    mutationFn: ({ id, formData }) =>
      api.post(`/expenses/${id}/ocr`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  });
};

export const useExchangeRate = (from, to) => {
  return useQuery({
    queryKey: ['exchangeRate', from, to],
    queryFn: () => api.get(`/expenses/rate?from=${from}&to=${to}`).then((r) => r.data),
    enabled: !!from && !!to && from !== to,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeamExpenses = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  return useQuery({
    queryKey: ['teamExpenses', filters],
    queryFn: () => api.get(`/users/team-expenses?${params.toString()}`).then((r) => r.data),
    staleTime: 30 * 1000,
  });
};
