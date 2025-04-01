import { Dimensions } from 'react-native';
import type { Transaction, Category } from '../../types/finance';

/**
 * Obtém as dimensões adequadas para o gráfico com base no tamanho da tela e orientação
 */
export const getChartDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  const isSmallDevice = width < 375;
  const isMediumDevice = width >= 375 && width < 768;
  const isLargeDevice = width >= 768;
  
  const maxWidth = Math.min(width, 500); // Limita largura máxima do gráfico
  const chartWidth = maxWidth - getResponsiveSpacing(32);
  const chartHeight = isLandscape 
    ? height * 0.4 
    : isLargeDevice 
      ? 300 
      : isMediumDevice 
        ? 220 
        : 180;
  
  return { chartWidth, chartHeight };
};

/**
 * Obtém dimensão responsiva com base no tamanho da tela
 */
export const getResponsiveDimension = (size: number): number => {
  const { width } = Dimensions.get('window');
  const screenWidth = Math.min(width, 500); // Limita o crescimento em telas muito grandes
  const baseWidth = 375;
  return (screenWidth * size) / baseWidth;
};

/**
 * Obtém espaçamento responsivo com base no tamanho da tela
 */
export const getResponsiveSpacing = (baseSize: number): number => {
  const { width } = Dimensions.get('window');
  const isSmallDevice = width < 375;
  const isLargeDevice = width >= 768;
  
  if (isSmallDevice) return baseSize * 0.8;
  if (isLargeDevice) return baseSize * 1.2;
  return baseSize;
};

/**
 * Gera dados para o gráfico de linha
 */
export const getLineChartData = (transactions: Transaction[]) => {
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const incomeData = [0, 0, 0, 0, 0, 0];
  const expenseData = [0, 0, 0, 0, 0, 0];

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthIndex = date.getMonth();
    if (monthIndex < 6) {
      if (transaction.type === 'income') {
        incomeData[monthIndex] += transaction.amount;
      } else {
        expenseData[monthIndex] += transaction.amount;
      }
    }
  });

  return {
    labels,
    datasets: [
      {
        data: incomeData,
        color: () => '#81C784',
        strokeWidth: 2
      },
      {
        data: expenseData,
        color: () => '#E57373',
        strokeWidth: 2
      }
    ],
  };
};

/**
 * Gera dados para o gráfico de pizza
 */
export const getPieChartData = (
  transactions: Transaction[], 
  categories: Category[], 
  isDarkMode: boolean
) => {
  const categoryTotals = new Map<string, number>();
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const current = categoryTotals.get(transaction.categoryId) || 0;
      categoryTotals.set(transaction.categoryId, current + transaction.amount);
    });

  return Array.from(categoryTotals.entries()).map(([categoryId, total]) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category?.name || 'Outros',
      value: total,
      color: category?.color || '#999999',
      legendFontColor: isDarkMode ? '#E0E0E0' : '#424242',
      legendFontSize: 12
    };
  });
}; 