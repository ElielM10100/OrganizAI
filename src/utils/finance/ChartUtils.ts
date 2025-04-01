import { Dimensions } from 'react-native';
import { Transaction, Category } from '../../types/finance';

/**
 * Retorna as dimensões para renderizar charts com base no tamanho da tela
 */
export const getChartDimensions = () => {
  const { width } = Dimensions.get('window');
  const screenWidth = width - 40; // margem de 20px de cada lado
  return {
    width: screenWidth,
    height: Math.min(220, screenWidth * 0.6),
    radius: Math.min(screenWidth / 2, 120),
    chartConfig: {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(126, 87, 194, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: '#7E57C2'
      }
    }
  };
};

/**
 * Prepara dados para gráficos de linha
 */
export const getLineChartData = (
  transactions: Transaction[], 
  period: 'week' | 'month' | 'year' = 'month',
  type: 'income' | 'expense' | 'all' = 'all'
) => {
  const now = new Date();
  let labels: string[] = [];
  let data: number[] = [];
  
  if (period === 'week') {
    // Dias da semana
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    labels = Array(7).fill(0).map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - date.getDay() + i);
      return days[date.getDay()];
    });
    
    // Agregar dados por dia da semana
    const dailyData = Array(7).fill(0);
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dayOfWeek = date.getDay();
      
      // Filtra por tipo se necessário
      if (type === 'all' || transaction.type === type) {
        const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
        dailyData[dayOfWeek] += amount;
      }
    });
    
    data = dailyData;
  } else if (period === 'month') {
    // Dias do mês atual
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    labels = Array(daysInMonth).fill(0).map((_, i) => (i + 1).toString());
    
    // Agregar dados por dia do mês
    const dailyData = Array(daysInMonth).fill(0);
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      // Verifica se é do mês atual
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        const dayOfMonth = date.getDate() - 1;
        
        // Filtra por tipo se necessário
        if (type === 'all' || transaction.type === type) {
          const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
          dailyData[dayOfMonth] += amount;
        }
      }
    });
    
    data = dailyData;
  } else if (period === 'year') {
    // Meses do ano
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    labels = months;
    
    // Agregar dados por mês
    const monthlyData = Array(12).fill(0);
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      // Verifica se é do ano atual
      if (date.getFullYear() === now.getFullYear()) {
        const month = date.getMonth();
        
        // Filtra por tipo se necessário
        if (type === 'all' || transaction.type === type) {
          const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
          monthlyData[month] += amount;
        }
      }
    });
    
    data = monthlyData;
  }
  
  return {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => `rgba(126, 87, 194, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: [type === 'all' ? 'Movimentações' : type === 'income' ? 'Receitas' : 'Despesas']
  };
};

/**
 * Prepara dados para gráficos de pizza
 */
export const getPieChartData = (
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense' = 'expense'
) => {
  // Filtra transações do tipo especificado
  const filteredTransactions = transactions.filter(t => t.type === type);
  
  // Agrupa por categoria
  const categorySums: Record<string, number> = {};
  
  filteredTransactions.forEach(transaction => {
    if (!categorySums[transaction.categoryId]) {
      categorySums[transaction.categoryId] = 0;
    }
    categorySums[transaction.categoryId] += transaction.amount;
  });
  
  // Cor padrão para categoria não encontrada
  const defaultColor = '#CCCCCC';
  const COLORS = [
    '#7E57C2', '#5C6BC0', '#42A5F5', '#26C6DA', '#26A69A', 
    '#66BB6A', '#9CCC65', '#D4E157', '#FFEE58', '#FFCA28', 
    '#FFA726', '#FF7043', '#EC407A', '#AB47BC', '#5C6BC0'
  ];
  
  // Transforma para o formato do gráfico
  const data = Object.entries(categorySums).map(([categoryId, value], index) => {
    const category = categories.find(c => c.id === categoryId);
    return {
      name: category?.name || 'Sem categoria',
      value,
      color: category?.color || COLORS[index % COLORS.length] || defaultColor,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    };
  });
  
  // Ordena por valor (do maior para o menor)
  data.sort((a, b) => b.value - a.value);
  
  return data;
}; 