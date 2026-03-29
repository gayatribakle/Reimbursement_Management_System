import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { connectSocket, disconnectSocket } from '../lib/socket';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials) => api.post('/auth/login', credentials),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken, user.company || { id: user.companyId });
      connectSocket();
      toast.success('Welcome back!');
      const routes = {
        ADMIN: '/admin/dashboard',
        FINANCE: '/admin/dashboard',
        DIRECTOR: '/admin/dashboard',
        MANAGER: '/manager/pending',
        EMPLOYEE: '/employee/dashboard',
      };
      navigate(routes[user.role] || '/');
    },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data) => api.post('/auth/signup', data),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken, user.company || { id: user.companyId });
      connectSocket();
      toast.success('Account created successfully!');
      navigate('/admin/dashboard');
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      clearAuth();
      disconnectSocket();
      queryClient.clear();
      toast.success('Logged out');
      navigate('/login');
    },
    onError: () => {
      clearAuth();
      disconnectSocket();
      navigate('/login');
    },
  });
};

export const useMe = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.user),
    enabled: isAuthenticated,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
  });
};
