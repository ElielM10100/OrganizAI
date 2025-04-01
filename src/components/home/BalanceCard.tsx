import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface BalanceCardProps {
  balance: number;
  monthlyStats: {
    income: number;
    expenses: number;
    savingsRate: number;
  };
  isDarkMode: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  monthlyStats, 
  isDarkMode 
}) => {
  // Formatar o valor como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Obter mês e ano atual formatado
  const getCurrentMonthYearDisplay = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <View style={[
      styles.balanceCard, 
      isDarkMode && styles.balanceCardDark,
    ]}>
      <View style={styles.headerContainer}>
        <Text style={[
          styles.balanceLabel, 
          { color: isDarkMode ? '#9DADF2' : '#5142AB' }
        ]}>
          Saldo Total
        </Text>
        <View style={[
          styles.dateContainer,
          { backgroundColor: isDarkMode ? 'rgba(41, 37, 88, 0.5)' : 'rgba(81, 66, 171, 0.08)' }
        ]}>
          <Icon name="calendar" size={10} color={isDarkMode ? '#9DADF2' : '#5142AB'} />
          <Text style={{ 
            color: isDarkMode ? '#9DADF2' : '#5142AB',
            marginLeft: 3,
            fontSize: 10,
            fontWeight: '500'
          }}>
            {getCurrentMonthYearDisplay()}
          </Text>
        </View>
      </View>

      <View>
        <Text style={[
          styles.balanceValue, 
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          {formatCurrency(balance)}
        </Text>
        
        <View style={[
          styles.statsContainer,
          { backgroundColor: isDarkMode ? 'rgba(31, 31, 70, 0.3)' : '#F6F8FF' }
        ]}>
          <View style={styles.statItem}>
            <View style={[styles.indicator, { backgroundColor: '#4CAF50' }]} />
            <Text style={[
              styles.statValue,
              { color: isDarkMode ? '#E0E0E0' : '#464A54' }
            ]}>
              R$ {monthlyStats.income.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.indicator, { backgroundColor: '#F44336' }]} />
            <Text style={[
              styles.statValue,
              { color: isDarkMode ? '#E0E0E0' : '#464A54' }
            ]}>
              R$ {monthlyStats.expenses.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 20,
    padding: 14,
    marginTop: -18,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  balanceCardDark: {
    backgroundColor: '#25234d',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateContainer: {
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 6,
    paddingHorizontal: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    flex: 1,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
  },
  statValue: {
    fontSize: 10,
    fontWeight: '500',
  },
}); 