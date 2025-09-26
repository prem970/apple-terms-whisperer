import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleTheme: () => void;
}

// Mock users for demo
const mockUsers: Record<string, User & { password: string }> = {
  'admin': {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'distributor_head',
    name: 'John Anderson',
    email: 'john@iphone-distributor.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  'store': {
    id: '2',
    username: 'store',
    password: 'store123',
    role: 'store_incharge',
    name: 'Sarah Chen',
    email: 'sarah@store.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  'sales': {
    id: '3',
    username: 'sales',
    password: 'sales123',
    role: 'salesperson',
    name: 'Mike Wilson',
    email: 'mike@sales.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isDarkMode: false,
      
      login: async (username: string, password: string) => {
        const user = mockUsers[username];
        if (user && user.password === password) {
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      toggleTheme: () => {
        set((state) => {
          const newTheme = !state.isDarkMode;
          if (newTheme) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { isDarkMode: newTheme };
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        isDarkMode: state.isDarkMode 
      }),
    }
  )
);