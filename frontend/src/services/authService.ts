import axios from 'axios';

import { Company, User } from '@/data/mockData';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export type AuthScope = 'user' | 'admin';

type AuthPayloadRecord = Record<string, unknown> & {
  id?: string | number;
  email?: string;
  name?: string;
  fullName?: string;
  role?: string;
  phone?: string;
  profilePicture?: string;
  companyId?: string | number;
  description?: string;
  cv_file?: string;
  company?:Company
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
    profilePicture: data.profilePicture,
    companyId: Number(data.companyId) || undefined,
    description: data.description || '',
    cv_file: data.cv_file || '',  
    company: data.company
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

export async function loginWithFirebase() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  
  const response = await authHttpClient.post('/api/firebase-login', { idToken });
  const responseData = response.data as AuthResponseRecord;
  const responseCode = responseData.errCode ?? responseData.errcode ?? 0;
  
  if (responseCode !== 0) {
    const error = new Error(responseData.message || responseData.errMessage || 'Đăng nhập Google thất bại') as Error & {
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

export async function updateProfile(data: FormData) {
  const response = await authHttpClient.put('/api/update-profile', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const responseData = response.data as AuthResponseRecord;
  if (responseData.errCode !== 0) {
    throw new Error(responseData.message || responseData.errMessage || 'Cập nhật thất bại');
  }
  return normalizeAuthUser(extractAuthPayload(responseData));
}

export async function changePassword(passwords: { current: string; newPass: string }) {
  // Check if backend has this endpoint. If not, I will suggest creating it.
  const response = await authHttpClient.post('/api/change-password', passwords);
  const responseData = response.data as AuthResponseRecord;
  if (responseData.errCode !== 0) {
    throw new Error(responseData.message || responseData.errMessage || 'Đổi mật khẩu thất bại');
  }
  return responseData;
}

export async function removeFile(type: 'avatar' | 'cv') {
  const response = await authHttpClient.delete('/api/remove-file', {
    data: { type }
  });
  const responseData = response.data as AuthResponseRecord;
  if (responseData.errCode !== 0) {
    throw new Error(responseData.message || responseData.errMessage || 'Xóa thất bại');
  }
  return responseData;
}

export async function updateEmployerLogo(data: FormData) {
  const response = await authHttpClient.post('/api/employer/update-logo', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const responseData = response.data as AuthResponseRecord;
  if (responseData.errCode !== 0) {
    throw new Error(responseData.message || responseData.errMessage || 'Cập nhật logo thất bại');
  }
  return normalizeAuthUser(extractAuthPayload(responseData));
}

export async function deleteEmployerLogo() {
  const response = await authHttpClient.delete('/api/employer/delete-logo');
  const responseData = response.data as AuthResponseRecord;
  if (responseData.errCode !== 0) {
    throw new Error(responseData.message || responseData.errMessage || 'Xóa logo thất bại');
  }
  return normalizeAuthUser(extractAuthPayload(responseData));
}

export async function logoutSession(scope: AuthScope | 'all' = 'all') {
  const scopes: AuthScope[] = scope === 'all' ? ['user', 'admin'] : [scope];
  await Promise.allSettled(scopes.map((item) => authHttpClient.post(getLogoutPath(item))));
}

export { authHttpClient };