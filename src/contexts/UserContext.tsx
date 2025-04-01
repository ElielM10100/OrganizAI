import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserContextData } from '../types/user';

// Valor inicial do contexto
const initialUserContext: UserContextData = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasOnboarded: false,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateProfile: async () => {},
  updateSettings: async () => {},
  updatePreferences: async () => {},
  completeOnboarding: async () => {}
};

// Criando o contexto
const UserContext = createContext<UserContextData>(initialUserContext);

// Hook personalizado para usar o contexto
export const useUser = () => useContext(UserContext);

// Provedor do contexto
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // Carregar dados do usuário ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('@FinanceApp:user');
        if (userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          setHasOnboarded(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulando uma resposta de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usuário mockado para demonstração
      const mockUser: User = {
        id: '1',
        name: 'Usuário Teste',
        email: email,
        avatarUrl: 'https://ui-avatars.com/api/?name=Usuario+Teste&background=random',
        createdAt: new Date().toISOString(),
        settings: {
          theme: 'system',
          language: 'pt-BR',
          currency: 'BRL',
          notifications: true
        },
        preferences: {
          defaultView: 'monthly',
          showBalances: true,
          defaultCategory: 'outros'
        }
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setHasOnboarded(true);
      await AsyncStorage.setItem('@FinanceApp:user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('@FinanceApp:user');
      setUser(null);
      setIsAuthenticated(false);
      setHasOnboarded(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro
  const register = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      // Simulando uma resposta de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      setHasOnboarded(true);
      await AsyncStorage.setItem('@FinanceApp:user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar perfil
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      setHasOnboarded(true);
      await AsyncStorage.setItem('@FinanceApp:user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Atualizar configurações
  const updateSettings = async (settings: User['settings']) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, settings };
      setUser(updatedUser);
      setHasOnboarded(true);
      await AsyncStorage.setItem('@FinanceApp:user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  };

  // Atualizar preferências
  const updatePreferences = async (preferences: User['preferences']) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, preferences };
      setUser(updatedUser);
      setHasOnboarded(true);
      await AsyncStorage.setItem('@FinanceApp:user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      throw error;
    }
  };

  // Função para marcar o onboarding como concluído
  const completeOnboarding = async () => {
    try {
      // Implementação real: salvar no armazenamento local ou API
      setHasOnboarded(true);
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      hasOnboarded,
      login,
      logout,
      register,
      updateProfile,
      updateSettings,
      updatePreferences,
      completeOnboarding
    }}>
      {children}
    </UserContext.Provider>
  );
}; 