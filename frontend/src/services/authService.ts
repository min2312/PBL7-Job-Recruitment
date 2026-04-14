import axios from 'axios';

import { User } from '@/data/mockData';

export type AuthScope = 'user' | 'admin';

type AuthPayloadRecord = Record<string, unknown> & {
  id?: string | number;
  email?: string;
  name?: string;
  fullName?: string;
  role?: string;
  phone?: string;
  companyId?: string | number;
};

type AuthResponseRecord = Record<string, unknown> & {
  user?: unknown;
  DT?: unknown;
  errCode?: number;
  errcode?: number;
  message?: string;
  errMessage?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

const authHttpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const normalizeRole = (role?: string, fallback: User['role'] = 'CANDIDATE'): User['role'] => {
  if (!role) {
    return fallback;
  }

  const normalized = role.toUpperCase();
  if (normalized === 'ADMIN' || normalized === 'EMPLOYER' || normalized === 'CANDIDATE') {
    return normalized;
  }

  return fallback;
};

export const normalizeAuthUser = (payload: unknown): User => {
  const data = (payload ?? {}) as AuthPayloadRecord;

  return {
    id: Number(data.id) || 0,
    email: data.email || '',
    name: data.name || data.fullName || data.email || 'User',
    role: normalizeRole(data.role),
    phone: data.phone,
    companyId: Number(data.companyId) || undefined,
  };
};

const extractAuthPayload = (responseData: AuthResponseRecord | null | undefined): unknown => {
  if (responseData && 'user' in responseData) {
    return responseData.user;
  }

  if (responseData && 'DT' in responseData) {
    return responseData.DT;
  }

  return responseData;
};

const getAccountPath = (scope: AuthScope) => (scope === 'admin' ? '/api/admin/account' : '/api/account');
const getLoginPath = (scope: AuthScope) => (scope === 'admin' ? '/api/admin/login' : '/api/login');
const getRefreshPath = (scope: AuthScope) => (scope === 'admin' ? '/api/admin/refresh-token' : '/api/refresh-token');
const getLogoutPath = (scope: AuthScope) => (scope === 'admin' ? '/api/admin/logout' : '/api/logout');

const isUnauthorized = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 401;

export async function loginWithScope(scope: AuthScope, credentials: { email: string; password: string }) {
  const response = await authHttpClient.post(getLoginPath(scope), credentials);
  const responseData = response.data as AuthResponseRecord;
  const responseCode = responseData.errCode ?? responseData.errcode ?? 0;
  if (responseCode !== 0) {
    const error = new Error(responseData.message || responseData.errMessage || 'Đăng nhập thất bại') as Error & {
      response?: typeof response;
    };
    error.response = response;
    throw error;
  }

  return normalizeAuthUser(extractAuthPayload(responseData));
}

export async function refreshSession(scope: AuthScope) {
  try {
    await authHttpClient.post(getRefreshPath(scope));
    return true;
  } catch (error) {
    return false;
  }
}

const fetchAccountWithRefresh = async (scope: AuthScope) => {
  try {
    const response = await authHttpClient.get(getAccountPath(scope));
    return normalizeAuthUser(extractAuthPayload(response.data));
  } catch (error) {
    if (isUnauthorized(error)) {
      const cookiesAccessed = document.cookie;
      console.log('Attempting token refresh due to unauthorized error. Cookies:', cookiesAccessed);  
      const refreshed = await refreshSession(scope);
      if (refreshed) {
        try {
          const retryResponse = await authHttpClient.get(getAccountPath(scope));
          return normalizeAuthUser(extractAuthPayload(retryResponse.data));
        } catch (retryError) {
          return null;
        }
      }
    }

    return null;
  }
};

export async function getCurrentSession() {
  const userSession = await fetchAccountWithRefresh('user');
  if (userSession) {
    return userSession;
  }

  const adminSession = await fetchAccountWithRefresh('admin');
  if (adminSession) {
    return adminSession;
  }

  return null;
}

export async function logoutSession(scope: AuthScope | 'all' = 'all') {
  const scopes: AuthScope[] = scope === 'all' ? ['user', 'admin'] : [scope];
  await Promise.allSettled(scopes.map((item) => authHttpClient.post(getLogoutPath(item))));
}

export { authHttpClient };