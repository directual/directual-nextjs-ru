// Базовые типы данных для проекта nextjs-directual-template

// ============================================================================
// API
// ============================================================================

export interface PageInfo {
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  sessionExpired?: boolean;
  pageInfo?: PageInfo | null;
  status?: string | null;
}

// ============================================================================
// Пользователь
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
  avatar?: string | null;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  userpic: string;
  email?: string;
  username?: string;
  balance?: number;
}

export interface AuthContextValue {
  user: User | null;
  sessionID: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResponse<User>>;
  register: (email: string, password: string, username: string) => Promise<ApiResponse<User>>;
  loginWithSession: (user: User) => void;
  logout: () => Promise<void>;
  isAuthorized: () => boolean;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// Данные (DataProvider)
// ============================================================================

export interface DataContextValue {
  userProfile: UserProfile | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshProfile: (silent?: boolean) => Promise<void>;
  refreshAll: (silent?: boolean) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<ApiResponse<void>>;
}

// ============================================================================
// Тема
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

// ============================================================================
// Socket
// ============================================================================

export type SocketEventCallback = (...args: unknown[]) => void;

export interface UseSocketResult {
  connected: boolean;
  error: string | null;
  emit: (event: string, data?: unknown) => void;
}

// ============================================================================
// Файлы (upload)
// ============================================================================

export interface FileData {
  urlLink: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface UploadedFile {
  file: File;
  urlLink: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

// ============================================================================
// Global Window
// ============================================================================

declare global {
  interface Window {
    __showGlobalAlert?: (data: unknown) => void;
    __refreshData?: (payload: unknown) => void;
  }
}
