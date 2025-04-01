import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import { getChartDimensions, getLineChartData, getPieChartData } from '../../utils/finance/ChartUtils';
import type { TransactionType } from '../../types/finance';

interface RecentChartsProps {
  dateRange: 'week' | 'month' | 'year';
  chartType?: 'line' | 'pie' | 'both';
  showTitle?: boolean;
}

export const RecentCharts: React.FC<RecentChartsProps> = ({
  dateRange = 'month',
  chartType = 'both',
  showTitle = true,
}) => {
  const { isDarkMode, theme } = useTheme();
  const { transactions, categories } = useFinance();
  
  // Obter dimensões otimizadas para os gráficos
  const chartDimensions = getChartDimensions();
  
  // Dados para gráfico de linha (receitas e despesas ao longo do tempo)
  const lineChartData = getLineChartData(transactions, dateRange, 'all');
  
  // Dados para gráfico de pizza (despesas por categoria)
  const pieChartData = getPieChartData(transactions, categories, 'expense');
  
  // Verificar se há dados suficientes para renderizar os gráficos
  const hasLineData = lineChartData.datasets[0].data.some(value => value > 0);
  const hasPieData = pieChartData.length > 0;
  
  const textSecondaryColor = isDarkMode 
    ? theme.colors.textSecondary.dark 
    : theme.colors.textSecondary.light;
  
  if (!hasLineData && !hasPieData) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? theme.colors.card : '#f8f9fa' }]}>
        <Text style={[styles.noDataText, { color: theme.colors.text }]}>
          Sem dados suficientes para exibir gráficos.
        </Text>
        <Text style={[styles.noDataSubText, { color: textSecondaryColor }]}>
          Adicione mais transações para visualizar insights financeiros.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.colors.card : '#f8f9fa' }]}>
      {showTitle && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Resumo Financeiro
        </Text>
      )}
      
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gráfico de linha para tendências ao longo do tempo */}
        {(chartType === 'line' || chartType === 'both') && hasLineData && (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              {dateRange === 'week' ? 'Esta semana' : 
               dateRange === 'month' ? 'Este mês' : 'Este ano'}
            </Text>
            <LineChart
              data={lineChartData}
              width={chartDimensions.width}
              height={chartDimensions.height}
              chartConfig={{
                ...chartDimensions.chartConfig,
                backgroundColor: isDarkMode ? theme.colors.card : '#ffffff',
                backgroundGradientFrom: isDarkMode ? theme.colors.card : '#ffffff',
                backgroundGradientTo: isDarkMode ? theme.colors.card : '#ffffff',
                color: (opacity = 1) => isDarkMode 
                  ? `rgba(255, 255, 255, ${opacity})` 
                  : `rgba(126, 87, 194, ${opacity})`,
                labelColor: (opacity = 1) => isDarkMode 
                  ? `rgba(255, 255, 255, ${opacity})` 
                  : `rgba(0, 0, 0, ${opacity})`,
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}
        
        {/* Gráfico de pizza para distribuição de despesas por categoria */}
        {(chartType === 'pie' || chartType === 'both') && hasPieData && (
          <View style={[styles.chartContainer, styles.pieChartContainer]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
              Distribuição de Despesas
            </Text>
            <PieChart
              data={pieChartData}
              width={chartDimensions.width}
              height={chartDimensions.height}
              chartConfig={chartDimensions.chartConfig}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  chartContainer: {
    marginBottom: 20,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 20,
  },
  noDataSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
}); 