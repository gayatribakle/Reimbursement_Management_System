import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export const useRules = () => {
  return useQuery({
    queryKey: ['rules'],
    queryFn: () => api.get('/rules').then((r) => r.data),
  });
};

export const useCreateRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/rules', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Approval rule created');
    },
  });
};

export const useUpdateRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/rules/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Approval rule updated');
    },
  });
};

export const useDeleteRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/rules/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Approval rule deleted');
    },
  });
};

export const useSetDefaultRule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.patch(`/rules/${id}/default`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rules'] });
      toast.success('Default rule updated');
    },
  });
};
