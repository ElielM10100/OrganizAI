// Interface para representar um usuário no aplicativo
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    notifications: boolean;
  };
  preferences: {
    defaultView: 'daily' | 'weekly' | 'monthly' | 'yearly';
    showBalances: boolean;
    defaultCategory: string;
  };
}

// Interface para o contexto de usuário
export interface UserContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasOnboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateSettings: (settings: User['settings']) => Promise<void>;
  updatePreferences: (preferences: User['preferences']) => Promise<void>;
  completeOnboarding: () => Promise<void>;
} 