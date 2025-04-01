import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextStyle,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ColorValue,
  Dimensions,
  useWindowDimensions,
  Platform,
  StatusBar,
  Animated,
  Easing,
  useColorScheme,
  FlatList,
  SectionList,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import type { Category, Transaction } from '../../types/finance';
import { useUser } from '../../contexts/UserContext';

// Importando componentes do diretório home
import {
  BalanceCard,
  ActionButtons,
  TransactionsList,
  FilterComponent,
  QuickGoalComponent,
  HeaderComponent,
  HomeContent
} from '../../components/home';

// Importando componentes de outros diretórios
import { RecentCharts } from '../../components/charts/RecentCharts';
import { AddTransactionModal } from '../../components/transaction/AddTransactionModal';
import { NotificationComponent } from '../../components/ui/NotificationComponent';

// Importando utilitários
import {
  formatCurrency,
  formatDate,
  formatMonthYear
} from '../../utils/date/FormatUtils';

import {
  getChartDimensions,
  getLineChartData,
  getPieChartData
} from '../../utils/finance/ChartUtils';

export const HomeScreen = () => {
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const {
    balance,
    transactions,
    categories,
    addTransaction,
    getMonthlyExpenses,
    getMonthlyIncome,
    getSavingsRate,
    getCategoryInsights,
  } = useFinance();
  const { user } = useUser();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expenses: 0,
    savingsRate: 0,
  });
  const [insights, setInsights] = useState<{
    categoryId: string;
    trend: 'up' | 'down' | 'stable';
    suggestions: string[];
  }[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [showCharts, setShowCharts] = useState(true);
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'monthly' | 'weekly'>('monthly');

  // Referências para animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const notificationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMonthlyStats();
    loadInsights();
    
    // Iniciar animações principais
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

  useEffect(() => {
    loadMonthlyStats();
  }, [transactions]);

  const loadMonthlyStats = async () => {
    try {
      const [income, expenses, savingsRate] = await Promise.all([
        getMonthlyIncome(),
        getMonthlyExpenses(),
        getSavingsRate(),
      ]);

      setMonthlyStats({
        income,
        expenses: expenses.reduce((total, t) => total + t.amount, 0),
        savingsRate,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const categoryInsights = await Promise.all(
        categories
          .filter(c => c.type === 'expense')
          .map(async category => {
            const insight = await getCategoryInsights(category.id);
            return {
              categoryId: category.id,
              ...insight,
            };
          })
      );

      setInsights(categoryInsights);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadMonthlyStats(),
        loadInsights(),
      ]);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAmountChange = (text: string) => {
    setAmount(formatCurrencyInput(text));
  };

  const showTemporaryNotification = (type: 'success' | 'error', message: string) => {
    setNotificationType(type);
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Animação de entrada
    Animated.timing(notificationAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Esconder depois de 3 segundos
    setTimeout(() => {
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowNotification(false);
      });
    }, 3000);
  };

  const formatCurrencyInput = (text: string) => {
    // Remove qualquer caractere que não seja número ou vírgula
    const cleanedText = text.replace(/[^\d,]/g, '');
    // Garante que só haja uma vírgula
    const parts = cleanedText.split(',');
    if (parts.length > 2) {
      return amount;
    }
    // Limita as casas decimais a 2
    if (parts[1] && parts[1].length > 2) {
      return amount;
    }
    return cleanedText;
  };

  const handleAddTransaction = async () => {
    if (!amount || !description || !selectedCategory) {
      setNotificationType('error');
      setNotificationMessage('Preencha todos os campos');
      setShowNotification(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Converter valor para número
      const amountValue = parseFloat(amount.replace(',', '.'));
      
      // Criar objeto de transação
      const transaction = {
        amount: amountValue,
        description,
        categoryId: selectedCategory,
        type: transactionType,
        date: new Date().toISOString(),
        status: 'completed' as const,
        isRecurrent,
      };
      
      // Adicionar transação
      await addTransaction(transaction);
      
      // Mostrar notificação de sucesso
      setNotificationType('success');
      setNotificationMessage('Transação adicionada com sucesso');
      setShowNotification(true);
      
      // Resetar formulário e fechar modal
      setAmount('');
      setDescription('');
      setSelectedCategory('');
      setIsLoading(false);
      setShowAddModal(false);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      setNotificationType('error');
      setNotificationMessage('Erro ao adicionar transação');
      setShowNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryDistribution = () => {
    return getPieChartData(transactions, categories, 'expense');
  };

  return (
    <View style={styles.container}>
      <HomeContent 
        user={user}
        balance={balance}
        monthlyStats={monthlyStats}
        transactions={transactions}
        categories={categories}
        filterType={filterType}
        setFilterType={setFilterType}
        dateRange={dateRange}
        setDateRange={setDateRange}
        showCharts={showCharts}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
        isDarkMode={isDarkMode}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
        scaleAnim={scaleAnim}
        setTransactionType={setTransactionType}
        setShowAddModal={setShowAddModal}
        getCategoryDistribution={getCategoryDistribution}
      />
      
      {showAddModal && (
        <AddTransactionModal 
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          initialTransactionType={transactionType}
        />
      )}
      
      <NotificationComponent 
        message={notificationMessage}
        type={notificationType}
        visible={showNotification}
        onDismiss={() => setShowNotification(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 