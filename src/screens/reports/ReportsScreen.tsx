import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';

export const ReportsScreen = () => {
  const { isDarkMode } = useTheme();
  const { width, height } = useWindowDimensions();
  const {
    transactions,
    categories,
    getMonthlyExpenses,
    getMonthlyIncome,
    getSavingsRate,
  } = useFinance();

  // Referências para animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m');
  const [selectedView, setSelectedView] = useState<'overview' | 'categories' | 'trends'>('overview');
  const [reportData, setReportData] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
    categoryTotals: new Map<string, number>(),
    trends: {
      income: [] as number[],
      expenses: [] as number[],
    },
  });

  // Determinar se é um dispositivo pequeno, médio ou grande
  const isSmallDevice = width < 375;
  const isLargeDevice = width >= 768;
  const isLandscape = width > height;

  // Animação quando o componente é montado
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Animação quando o período ou a visualização muda
  useEffect(() => {
    // Resetar a animação
    fadeAnim.setValue(0);
    slideAnim.setValue(-30);
    scaleAnim.setValue(0.95);
    
    // Iniciar a animação
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, [selectedPeriod, selectedView]);

  useEffect(() => {
    loadReportData();
  }, [transactions, selectedPeriod]);

  const getResponsiveDimension = (size: number) => {
    if (isSmallDevice) return size * 0.9;
    if (isLargeDevice) return size * 1.2;
    return size;
  };

  const loadReportData = async () => {
    try {
      // Carregar dados básicos
      const [income, expenses, savingsRate] = await Promise.all([
        getMonthlyIncome(),
        getMonthlyExpenses(),
        getSavingsRate(),
      ]);

      // Calcular totais por categoria
      const categoryTotals = new Map<string, number>();
      const now = new Date();
      const monthsToShow = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
      
      // Criar uma cópia da data atual para não modificar o valor original
      const tempDate = new Date();
      const cutoffDate = new Date(tempDate.setMonth(tempDate.getMonth() - monthsToShow));

      const filteredTransactions = transactions.filter(t => new Date(t.date) >= cutoffDate);
      
      // Preparar dados de tendências com zeros
      const trends = {
        income: Array(monthsToShow).fill(0),
        expenses: Array(monthsToShow).fill(0),
      };

      // Agrupar transações por mês
      const currentMonth = now.getMonth();
      
      filteredTransactions.forEach(transaction => {
        // Calcular totais por categoria
        if (transaction.type === 'expense') {
          const current = categoryTotals.get(transaction.categoryId) || 0;
          categoryTotals.set(transaction.categoryId, current + Number(transaction.amount));
        }

        // Calcular tendências
        const transactionDate = new Date(transaction.date);
        const transactionMonth = transactionDate.getMonth();
        
        // Calcular a diferença de meses corretamente
        let monthDiff = currentMonth - transactionMonth;
        if (monthDiff < 0) monthDiff += 12; // Ajuste para meses do ano anterior
        
        // Verificar se a transação está dentro do período selecionado
        if (monthDiff < monthsToShow) {
          const monthIndex = monthsToShow - 1 - monthDiff;
          
          if (transaction.type === 'income') {
            trends.income[monthIndex] += Number(transaction.amount) || 0;
          } else {
            trends.expenses[monthIndex] += Number(transaction.amount) || 0;
          }
        }
      });

      // Garantir que todos os valores são números válidos
      const safeIncome = Number(income) || 0;
      const safeExpenses = Number(expenses.reduce((total, t) => total + Number(t.amount), 0)) || 0;
      const safeSavingsRate = Number(savingsRate) || 0;

      setReportData({
        monthlyIncome: safeIncome,
        monthlyExpenses: safeExpenses,
        savingsRate: safeSavingsRate,
        categoryTotals,
        trends,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthLabels = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const labels: string[] = [];
    const now = new Date();
    const monthsToShow = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12;
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthIndex = (now.getMonth() - i + 12) % 12;
      labels.push(months[monthIndex]);
    }
    
    return labels;
  };

  const renderOverview = () => {
    // Garantir que os arrays não estão vazios e contêm apenas números válidos
    const safeIncomeData = reportData.trends.income.length > 0 
      ? reportData.trends.income.map(v => Math.round(Number(v) || 0)) 
      : [0];
    const safeExpenseData = reportData.trends.expenses.length > 0 
      ? reportData.trends.expenses.map(v => Math.round(Number(v) || 0)) 
      : [0];

    // Verificar se todos os valores são zeros
    const allZeros = safeIncomeData.every(v => v === 0) && safeExpenseData.every(v => v === 0);
    
    // Se todos são zeros, usar um valor mínimo para mostrar algo no gráfico
    const finalIncomeData = allZeros ? [1] : safeIncomeData;
    const finalExpenseData = allZeros ? [1] : safeExpenseData;

    // Obter labels de meses
    const monthLabels = getMonthLabels();

    // Configuração do gráfico com formatação segura
    const chartConfig = {
      backgroundColor: isDarkMode ? '#1E1E2D' : '#FFFFFF',
      backgroundGradientFrom: isDarkMode ? '#1E1E2D' : '#FFFFFF',
      backgroundGradientTo: isDarkMode ? '#1E1E2D' : '#FFFFFF',
      decimalPlaces: 0,
      color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
      propsForDots: {
        r: 6,
        strokeWidth: 2,
        stroke: isDarkMode ? '#5E35B1' : '#7E57C2'
      },
      // Formatador simples que não causa problemas
      formatYLabel: (value) => Math.round(Number(value) || 0).toString(),
      // Melhorar o estilo das linhas de grade
      propsForBackgroundLines: {
        strokeDasharray: '', // linha sólida em vez de tracejada
        strokeWidth: 1,
        stroke: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      // Estilo do eixo X
      propsForLabels: {
        fontSize: 11,
        fontWeight: '500',
      }
    };

    // Altura responsiva para gráficos
    const chartHeight = isSmallDevice ? 180 : isLargeDevice ? 250 : 220;

    return (
      <Animated.View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
          <Icon name="chart-line" size={20} color={isDarkMode ? '#B39DDB' : '#7E57C2'} /> Visão Geral
        </Text>
        
        <View style={[
          styles.statsGrid, 
          isLargeDevice && styles.statsGridLarge
        ]}>
          <Animated.View 
            style={[
              styles.statCard, 
              isDarkMode && styles.cardDark,
              styles.incomeStatCard
            ]}
          >
            <Text style={[styles.statLabel, isDarkMode && styles.textDark]}>Receita Média</Text>
            <Text style={[styles.statValue, styles.incomeText]}>{formatCurrency(reportData.monthlyIncome)}</Text>
            <Icon name="arrow-up-circle" size={getResponsiveDimension(22)} color="#81C784" style={styles.statIcon} />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.statCard, 
              isDarkMode && styles.cardDark,
              styles.expenseStatCard
            ]}
          >
            <Text style={[styles.statLabel, isDarkMode && styles.textDark]}>Despesa Média</Text>
            <Text style={[styles.statValue, styles.expenseText]}>{formatCurrency(reportData.monthlyExpenses)}</Text>
            <Icon name="arrow-down-circle" size={getResponsiveDimension(22)} color="#E57373" style={styles.statIcon} />
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.statCard, 
              isDarkMode && styles.cardDark
            ]}
          >
            <Text style={[styles.statLabel, isDarkMode && styles.textDark]}>Taxa de Economia</Text>
            <Text style={[styles.statValue, isDarkMode && styles.textDark]}>
              {reportData.savingsRate > 0 ? '+' : ''}{reportData.savingsRate.toFixed(1)}%
            </Text>
            <Icon 
              name={reportData.savingsRate >= 0 ? "piggy-bank" : "piggy-bank-outline"} 
              size={getResponsiveDimension(22)} 
              color={reportData.savingsRate >= 0 ? "#7E57C2" : "#9E9E9E"} 
              style={styles.statIcon} 
            />
          </Animated.View>
        </View>

        <Animated.View style={[styles.chartCard, isDarkMode && styles.cardDark]}>
          <Text style={[styles.chartTitle, isDarkMode && styles.textDark]}>
            Evolução Financeira
          </Text>
          <LineChart
            data={{
              labels: monthLabels,
              datasets: [
                {
                  data: finalIncomeData,
                  color: () => '#81C784',
                  strokeWidth: 3
                },
                {
                  data: finalExpenseData,
                  color: () => '#E57373',
                  strokeWidth: 3
                }
              ],
            }}
            width={width - (isLargeDevice ? 64 : 48)}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            fromZero
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#81C784' }]} />
              <Text style={[styles.legendText, isDarkMode && styles.textDark]}>Receitas</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#E57373' }]} />
              <Text style={[styles.legendText, isDarkMode && styles.textDark]}>Despesas</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    );
  };

  const renderCategories = () => {
    // Garantir que temos dados válidos para o gráfico de pizza
    const processedCategoryData = Array.from(reportData.categoryTotals.entries())
      .map(([categoryId, total]) => {
        const category = categories.find(c => c.id === categoryId);
        // Garantimos que o valor é um número inteiro positivo
        const safeValue = Math.max(0, Math.round(Number(total) || 0));
        return {
          name: category?.name || 'Outros',
          value: safeValue,
          color: category?.color || '#999999',
          legendFontColor: isDarkMode ? '#E0E0E0' : '#424242',
          legendFontSize: 12
        };
      })
      .sort((a, b) => b.value - a.value);

    // Se não temos dados, adicionamos um valor padrão para evitar erros
    const categoryData = processedCategoryData.length > 0 
      ? processedCategoryData 
      : [{ name: 'Sem dados', value: 1, color: '#999999', legendFontColor: '#999999', legendFontSize: 12 }];

    // Altura responsiva para gráficos
    const chartHeight = isSmallDevice ? 180 : isLargeDevice ? 250 : 220;

    return (
      <Animated.View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
          <Icon name="chart-pie" size={20} color={isDarkMode ? '#B39DDB' : '#7E57C2'} /> Análise por Categoria
        </Text>
        
        <Animated.View style={[styles.chartCard, isDarkMode && styles.cardDark]}>
          <PieChart
            data={categoryData}
            width={width - (isLargeDevice ? 64 : 48)}
            height={chartHeight}
            chartConfig={{
              color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
              decimalPlaces: 0
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={false}
          />
        </Animated.View>

        <View style={styles.categoryList}>
          {processedCategoryData.map((item, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.categoryItem, 
                isDarkMode && styles.cardDark,
                { 
                  borderLeftWidth: 4,
                  borderLeftColor: item.color 
                }
              ]}
            >
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                <Text style={[styles.categoryName, isDarkMode && styles.textDark]}>{item.name}</Text>
                {item.value > 0 && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { 
                      width: `${Math.min(100, (item.value / reportData.monthlyExpenses) * 100)}%`,
                      backgroundColor: item.color
                    }]} />
                  </View>
                )}
              </View>
              <View style={styles.categoryValues}>
                <Text style={[styles.categoryValue, isDarkMode && styles.textDark]}>
                  {formatCurrency(item.value)}
                </Text>
                <Text style={[styles.categoryPercentage, {color: item.color}]}>
                  {reportData.monthlyExpenses > 0 
                    ? ((item.value / reportData.monthlyExpenses) * 100).toFixed(1) 
                    : '0.0'}%
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderTrends = () => {
    // Altura responsiva para gráficos
    const chartHeight = isSmallDevice ? 180 : isLargeDevice ? 250 : 220;

    // Garantir que temos dados válidos e não vazios para o gráfico de barras
    const monthLabels = getMonthLabels();
    const trendData: Array<{month: string; income: number; expenses: number; savings: number}> = [];
    
    for (let i = 0; i < monthLabels.length; i++) {
      const income = Math.round(Number(reportData.trends.income[i]) || 0);
      const expenses = Math.round(Number(reportData.trends.expenses[i]) || 0);
      const savings = income - expenses;
      
      trendData.push({
        month: monthLabels[i],
        income,
        expenses,
        savings
      });
    }
    
    // Verificar se todos os valores são zeros para evitar gráficos vazios
    const allZeros = trendData.every(d => d.savings === 0);
    const chartData = allZeros 
      ? [1] // Valor mínimo para mostrar algo no gráfico
      : trendData.map(d => d.savings);

    // Configuração do gráfico com formatação segura
    const chartConfig = {
      backgroundColor: isDarkMode ? '#1E1E2D' : '#FFFFFF',
      backgroundGradientFrom: isDarkMode ? '#1E1E2D' : '#FFFFFF',
      backgroundGradientTo: isDarkMode ? '#1E1E2D' : '#FFFFFF',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(126, 87, 194, ${opacity})`,
      labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
      formatYLabel: (value) => Math.round(Number(value) || 0).toString(),
      // Melhorar o estilo das linhas de grade
      propsForBackgroundLines: {
        strokeDasharray: '', // linha sólida em vez de tracejada
        strokeWidth: 1,
        stroke: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }
    };

    return (
      <Animated.View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
          <Icon name="chart-bar" size={20} color={isDarkMode ? '#B39DDB' : '#7E57C2'} /> Tendências
        </Text>

        <Animated.View style={[styles.chartCard, isDarkMode && styles.cardDark]}>
          <BarChart
            data={{
              labels: monthLabels,
              datasets: [
                {
                  data: chartData
                }
              ]
            }}
            width={width - (isLargeDevice ? 64 : 48)}
            height={chartHeight}
            yAxisLabel=""
            yAxisSuffix=""
            segments={5}
            withInnerLines={false}
            chartConfig={chartConfig}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            fromZero
          />
        </Animated.View>

        <View style={styles.trendsList}>
          {trendData.map((data, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.trendItem, 
                isDarkMode && styles.cardDark,
                data.savings >= 0 ? styles.trendItemPositive : styles.trendItemNegative
              ]}
            >
              <Text style={[styles.trendMonth, isDarkMode && styles.textDark]}>{data.month}</Text>
              <View style={styles.trendValues}>
                <Text style={[styles.trendValue, styles.incomeText]}>
                  +{formatCurrency(data.income)}
                </Text>
                <Text style={[styles.trendValue, styles.expenseText]}>
                  -{formatCurrency(data.expenses)}
                </Text>
                <View style={styles.savingsContainer}>
                  <Icon 
                    name={data.savings >= 0 ? "arrow-up-bold" : "arrow-down-bold"} 
                    size={16} 
                    color={data.savings >= 0 ? "#81C784" : "#E57373"} 
                    style={{marginRight: 4}} 
                  />
                  <Text style={[
                    styles.trendValue, 
                    data.savings >= 0 ? styles.incomeText : styles.expenseText,
                    styles.savingsText
                  ]}>
                    {formatCurrency(Math.abs(data.savings))}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  };

  // Animação ao mudar o período ou visualização
  const animateChange = (newPeriod: '3m' | '6m' | '1y' | null = null, newView: 'overview' | 'categories' | 'trends' | null = null) => {
    // Resetar a animação
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    
    // Iniciar a animação
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start(() => {
      if (newPeriod) setSelectedPeriod(newPeriod);
      if (newView) setSelectedView(newView);
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, isDarkMode && styles.headerDark]}>
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton, 
            selectedPeriod === '3m' && styles.periodButtonActive,
            isDarkMode && styles.periodButtonDark,
            selectedPeriod === '3m' && isDarkMode && styles.periodButtonActiveDark
          ]}
          onPress={() => setSelectedPeriod('3m')}
        >
          <Text 
            style={[
              styles.periodButtonText, 
              selectedPeriod === '3m' && styles.periodButtonTextActive,
              isDarkMode && styles.textDark
            ]}
          >
            3 Meses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton, 
            selectedPeriod === '6m' && styles.periodButtonActive,
            isDarkMode && styles.periodButtonDark,
            selectedPeriod === '6m' && isDarkMode && styles.periodButtonActiveDark
          ]}
          onPress={() => setSelectedPeriod('6m')}
        >
          <Text 
            style={[
              styles.periodButtonText, 
              selectedPeriod === '6m' && styles.periodButtonTextActive,
              isDarkMode && styles.textDark
            ]}
          >
            6 Meses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton, 
            selectedPeriod === '1y' && styles.periodButtonActive,
            isDarkMode && styles.periodButtonDark,
            selectedPeriod === '1y' && isDarkMode && styles.periodButtonActiveDark
          ]}
          onPress={() => setSelectedPeriod('1y')}
        >
          <Text 
            style={[
              styles.periodButtonText, 
              selectedPeriod === '1y' && styles.periodButtonTextActive,
              isDarkMode && styles.textDark
            ]}
          >
            1 Ano
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewSelector}>
        <TouchableOpacity
          style={[
            styles.viewButton, 
            selectedView === 'overview' && styles.viewButtonActive,
            isDarkMode && styles.viewButtonDark,
            selectedView === 'overview' && isDarkMode && styles.viewButtonActiveDark
          ]}
          onPress={() => setSelectedView('overview')}
        >
          <Icon 
            name="chart-line" 
            size={getResponsiveDimension(24)} 
            color={selectedView === 'overview' 
              ? (isDarkMode ? '#FFFFFF' : '#FFFFFF') 
              : (isDarkMode ? '#B39DDB' : '#7E57C2')} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton, 
            selectedView === 'categories' && styles.viewButtonActive,
            isDarkMode && styles.viewButtonDark,
            selectedView === 'categories' && isDarkMode && styles.viewButtonActiveDark
          ]}
          onPress={() => setSelectedView('categories')}
        >
          <Icon 
            name="chart-pie" 
            size={getResponsiveDimension(24)} 
            color={selectedView === 'categories' 
              ? (isDarkMode ? '#FFFFFF' : '#FFFFFF') 
              : (isDarkMode ? '#B39DDB' : '#7E57C2')} 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton, 
            selectedView === 'trends' && styles.viewButtonActive,
            isDarkMode && styles.viewButtonDark,
            selectedView === 'trends' && isDarkMode && styles.viewButtonActiveDark
          ]}
          onPress={() => setSelectedView('trends')}
        >
          <Icon 
            name="chart-bar" 
            size={getResponsiveDimension(24)} 
            color={selectedView === 'trends' 
              ? (isDarkMode ? '#FFFFFF' : '#FFFFFF') 
              : (isDarkMode ? '#B39DDB' : '#7E57C2')} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}

      <Animated.View 
        style={[
          styles.contentAnimated,
          { 
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'categories' && renderCategories()}
        {selectedView === 'trends' && renderTrends()}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  containerDark: {
    backgroundColor: '#13131A',
  },
  contentContainer: {
    flexGrow: 1,
  },
  contentAnimated: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerDark: {
    backgroundColor: '#1E1E2D',
    borderBottomColor: '#2C2C3E',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F4F6FA',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8EAF6',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  periodButtonDark: {
    backgroundColor: '#2C2C3E',
    borderColor: '#3C3C4E',
  },
  periodButtonActive: {
    backgroundColor: '#7E57C2',
    borderColor: '#7E57C2',
  },
  periodButtonActiveDark: {
    backgroundColor: '#5E35B1',
    borderColor: '#5E35B1',
  },
  periodButtonText: {
    color: '#7E57C2',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  viewSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  viewButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F4F6FA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  viewButtonDark: {
    backgroundColor: '#2C2C3E',
  },
  viewButtonActive: {
    backgroundColor: '#7E57C2',
  },
  viewButtonActiveDark: {
    backgroundColor: '#5E35B1',
  },
  textDark: {
    color: '#E0E0E0',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statsGridLarge: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#1E1E2D',
  },
  incomeStatCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#81C784',
  },
  expenseStatCard: {
    borderBottomWidth: 3,
    borderBottomColor: '#E57373',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  statIcon: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    opacity: 0.7,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    color: '#757575',
    fontSize: 13,
  },
  incomeText: {
    color: '#81C784',
    fontWeight: 'bold',
  },
  expenseText: {
    color: '#E57373',
    fontWeight: 'bold',
  },
  categoryList: {
    marginTop: 8,
    gap: 8,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  categoryColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    flex: 1,
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#7E57C2',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7E57C2',
    borderRadius: 2,
  },
  trendsList: {
    marginTop: 8,
    gap: 8,
  },
  trendItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  trendItemPositive: {
    borderLeftWidth: 4,
    borderLeftColor: '#81C784',
  },
  trendItemNegative: {
    borderLeftWidth: 4,
    borderLeftColor: '#E57373',
  },
  trendMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    width: 50,
  },
  trendValues: {
    flex: 1,
    alignItems: 'flex-end',
  },
  trendValue: {
    fontSize: 14,
    marginBottom: 4,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 2,
  },
  savingsText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ReportsScreen; 