import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Cores principais
    primary: '#6B4EFF', // Roxo mais vibrante e moderno
    primaryLight: '#8E76FF',
    primaryDark: '#5740CC',
    
    // Cores secundárias
    secondary: '#94A3B8', // Cinza elegante
    secondaryLight: '#CBD5E1',
    secondaryDark: '#64748B',
    
    // Cores de sucesso/erro/alerta
    success: '#10B981', // Verde para valores positivos
    error: '#EF4444',   // Vermelho para valores negativos
    warning: '#F59E0B', // Laranja para alertas
    info: '#3B82F6',    // Azul para informações
    
    // Cores de fundo
    background: {
      light: '#FFFFFF',
      dark: '#0F172A', // Azul escuro mais sofisticado
    },
    
    // Cores para cards
    card: {
      light: '#F8FAFC',
      dark: '#1E293B',
    },
    
    // Cores para texto
    text: {
      light: '#1E293B',
      dark: '#F8FAFC',
    },
    textSecondary: {
      light: '#64748B',
      dark: '#94A3B8',
    },
    
    // Cores para gradientes
    gradient: {
      primary: ['#6B4EFF', '#9333EA'],
      success: ['#10B981', '#059669'],
      error: ['#EF4444', '#DC2626'],
    },
  },
  
  // Tipografia
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      textTransform: 'uppercase' as const,
    },
  },
  
  // Espaçamento
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Bordas
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Sombras
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  
  // Animações
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Layout
  layout: {
    containerPadding: 16,
    maxWidth: 428, // Largura máxima para conteúdo
    bottomNavHeight: 65,
  },

  // Z-index
  zIndex: {
    modal: 1000,
    overlay: 900,
    dropdown: 800,
    header: 700,
    bottomNav: 600,
  },
}; 