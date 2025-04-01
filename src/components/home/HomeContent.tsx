import React from 'react';
import { 
  View, 
  FlatList, 
  RefreshControl,
  StyleSheet, 
  Text
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User } from '../../types/user';
import type { Transaction, Category } from '../../types/finance';

// Componentes internos
import { BalanceCard } from './BalanceCard';
import { ActionButtons } from './ActionButtons';
import { FilterComponent } from './FilterComponent';
import { RecentCharts } from '../charts/RecentCharts';
import { HeaderComponent } from './HeaderComponent';
import { TransactionsList } from './TransactionsList';

// Importando função para formatar data atual
import { getCurrentDateFormatted } from '../../utils/date/formatters';

interface HomeContentProps {
  user: User | null;
  balance: number;
  monthlyStats: {
    income: number;
    expenses: number;
    savingsRate: number;
  };
  transactions: Transaction[];
  categories: Category[];
  filterType: 'all' | 'income' | 'expense';
  setFilterType: (filter: 'all' | 'income' | 'expense') => void;
  dateRange: 'week' | 'month' | 'year';
  setDateRange: (range: 'week' | 'month' | 'year') => void;
  showCharts: boolean;
  refreshing: boolean;
  handleRefresh: () => void;
  isDarkMode: boolean;
  fadeAnim: any;
  slideAnim: any;
  scaleAnim: any;
  setTransactionType: (type: 'income' | 'expense') => void;
  setShowAddModal: (show: boolean) => void;
  getCategoryDistribution: () => any[];
}

export const HomeContent: React.FC<HomeContentProps> = ({
  user,
  balance,
  monthlyStats,
  transactions,
  categories,
  filterType,
  setFilterType,
  dateRange,
  setDateRange,
  showCharts,
  refreshing,
  handleRefresh,
  isDarkMode,
  fadeAnim,
  slideAnim,
  scaleAnim,
  setTransactionType,
  setShowAddModal,
  getCategoryDistribution
}) => {
  const navigation = useNavigation();

  // Definição das seções de conteúdo
  const sections = [
    { key: 'header', data: [{}] },
    { key: 'balanceCards', data: [{}] },
    { key: 'actions', data: [{}] },
    { key: 'filters', data: [{}] },
    { key: 'charts', data: showCharts ? [{}] : [] },
    { key: 'transactions', data: [{}] },
  ];

  const handleNavigate = (screen: string) => {
    navigation.navigate(screen as never);
  };

  return (
    <FlatList 
      data={sections}
      keyExtractor={(item) => item.key}
      style={[
        styles.container, 
        isDarkMode && styles.containerDark
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#6B4EFF']}
          tintColor={isDarkMode ? '#6B4EFF' : '#6B4EFF'}
          progressBackgroundColor={isDarkMode ? '#1E1E2D' : '#FFFFFF'}
        />
      }
      renderItem={({ item }) => {
        switch (item.key) {
          case 'header':
            return (
              <HeaderComponent 
                userName={user?.name || "Usuário"}
                userAvatar={user?.avatarUrl}
                onAvatarPress={() => handleNavigate('Profile')}
                onNotificationsPress={() => console.log('Notificações')}
                isDarkMode={isDarkMode}
                currentDate={getCurrentDateFormatted()}
                fadeAnim={fadeAnim}
                slideAnim={slideAnim}
              />
            );
          case 'balanceCards':
            return (
              <BalanceCard 
                balance={balance}
                monthlyStats={monthlyStats}
                isDarkMode={isDarkMode}
              />
            );
          case 'actions':
            return (
              <ActionButtons 
                onPressAddIncome={() => {
                  setTransactionType('income');
                  setShowAddModal(true);
                }}
                onPressAddExpense={() => {
                  setTransactionType('expense');
                  setShowAddModal(true);
                }}
                onPressTransfer={() => {
                  // Ação para transferência
                }}
                isDarkMode={isDarkMode}
              />
            );
          case 'filters':
            return (
              <FilterComponent 
                selectedPeriod={dateRange}
                periodOptions={['week', 'month', 'year']}
                selectedFilter={filterType}
                filterOptions={[
                  { id: 'all', label: 'Todas', icon: 'currency-usd' },
                  { id: 'income', label: 'Receitas', icon: 'arrow-down' },
                  { id: 'expense', label: 'Despesas', icon: 'arrow-up' }
                ]}
                onPeriodChange={(period) => setDateRange(period)}
                onFilterChange={(filter) => setFilterType(filter)}
                isDarkMode={isDarkMode}
              />
            );
          case 'charts':
            return (
              <RecentCharts 
                dateRange={dateRange}
                chartType="both"
                showTitle={true}
              />
            );
          case 'transactions':
            return (
              <TransactionsList 
                transactions={transactions.slice(0, 5).map(t => ({
                  id: t.id,
                  title: t.description,
                  amount: t.amount,
                  date: t.date,
                  category: categories.find(c => c.id === t.categoryId)?.name || 'Outros',
                  type: t.type,
                  icon: categories.find(c => c.id === t.categoryId)?.icon || 'help-circle',
                  iconBgColor: t.type === 'income' ? '#E6F7EC' : '#FDEEEB'
                }))}
                onTransactionPress={(id) => console.log(`Transação ${id} pressionada`)}
                onViewAllPress={() => handleNavigate('Transactions')}
                isDarkMode={isDarkMode}
                filterType={filterType}
              />
            );
          default:
            return null;
        }
      }}
      ListFooterComponent={<View style={{ height: 100 }} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1E1E2D',
  }
}); 