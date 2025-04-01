import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextStyle,
  RefreshControl,
  Alert,
  ColorValue,
  ScrollView,
  Modal,
  TextInput,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../styles/theme';
import { Transaction } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/date/FormatUtils';

export const TransactionsScreen: React.FC = () => {
  const { isDarkMode, theme } = useTheme();
  const { transactions, categories, deleteTransaction, getTransactions } = useFinance();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>([]);

  // Referências para animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const listFadeAnim = useRef(new Animated.Value(0)).current;
  
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
      Animated.timing(listFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Animar quando os filtros mudam
  useEffect(() => {
    // Reset da animação da lista
    listFadeAnim.setValue(0);
    
    // Animar novamente
    Animated.timing(listFadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [selectedFilter, selectedMonth, selectedYear]);

  // Carregar transações
  useEffect(() => {
    loadTransactions();
  }, []);
  
  // Atualizar exibição quando as transações mudarem
  useEffect(() => {
    setDisplayTransactions(transactions);
    setLoading(false);
  }, [transactions]);
  
  // Carregar transações da API/contexto
  const loadTransactions = async () => {
    try {
      setLoading(true);
      await getTransactions();
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Atualizar dados
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Aqui você pode recarregar os dados se necessário
    setRefreshing(false);
  };

  const confirmDelete = (transaction: any) => {
    setTransactionToDelete(transaction);
    setShowConfirmDelete(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete.id);
      setShowConfirmDelete(false);
      setTransactionToDelete(null);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta transação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a transação');
            }
          },
        },
      ]
    );
  };

  const getTransactionColor = (type: 'income' | 'expense'): ColorValue => {
    return type === 'income' ? theme.colors.success : theme.colors.error;
  };

  const getTransactionsByFilter = () => {
    const monthStart = new Date(selectedYear, selectedMonth, 1);
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const isInSelectedMonth = 
        transactionDate >= monthStart && 
        transactionDate <= monthEnd;
      
      return isInSelectedMonth && 
        (selectedFilter === 'all' || transaction.type === selectedFilter);
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isExpense = item.type === 'expense';
    const textColor = isExpense ? '#E53935' : '#43A047';
    const iconName = isExpense ? 'arrow-down' : 'arrow-up';
    
    return (
      <TouchableOpacity 
        style={[
          styles.transactionItem, 
          { backgroundColor: isDarkMode ? theme.colors.card : '#FFFFFF' }
        ]}
        onPress={() => {/* Abrir detalhes da transação */}}
      >
        <View style={styles.transactionIcon}>
          <View style={[styles.iconBackground, { backgroundColor: `${textColor}20` }]}>
            <Icon name={iconName} size={20} color={textColor} />
          </View>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDesc, { color: theme.colors.text }]}>
            {item.description}
          </Text>
          <Text style={[styles.transactionDate, { color: isDarkMode ? '#A0A0A0' : '#757575' }]}>
            {formatDate(item.date, 'short')}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, { color: textColor }]}>
            {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
          </Text>
          {item.isRecurrent && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>Recorrente</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredTransactions = getTransactionsByFilter();
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const balance = totalIncome - totalExpense;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.background : '#F8F9FA',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    title: {
      ...theme.typography.h1,
      color: isDarkMode ? theme.colors.text : '#212121',
    } as TextStyle,
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    filterText: {
      marginLeft: 6,
      fontSize: 14,
      fontWeight: '500',
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom: 8,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    transactionIcon: {
      marginRight: 12,
    },
    iconBackground: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    transactionInfo: {
      flex: 1,
    },
    transactionDesc: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
    },
    transactionDate: {
      fontSize: 13,
    },
    transactionAmount: {
      alignItems: 'flex-end',
    },
    amountText: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    tagContainer: {
      backgroundColor: '#E0E0E0',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    tagText: {
      fontSize: 10,
      color: '#757575',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyStateText: {
      ...theme.typography.body,
      color: isDarkMode ? '#A0A0A0' : '#757575',
      textAlign: 'center',
    } as TextStyle,
    // Adicionando estilos para o modal de confirmação
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmModal: {
      width: '85%',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 24,
      elevation: 5,
    },
    confirmModalDark: {
      backgroundColor: '#1E1E2D',
    },
    confirmTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#424242',
      marginBottom: 16,
    },
    confirmMessage: {
      fontSize: 16,
      color: '#757575',
      marginBottom: 24,
    },
    confirmButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    confirmButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginLeft: 12,
    },
    cancelButton: {
      backgroundColor: '#E0E0E0',
    },
    deleteConfirmButton: {
      backgroundColor: '#D32F2F',
    },
    cancelButtonText: {
      color: '#424242',
      fontWeight: '500',
    },
    deleteConfirmText: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    textDark: {
      color: '#E0E0E0',
    },
    textLightDark: {
      color: '#9E9E9E',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transações</Text>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            { backgroundColor: isDarkMode ? theme.colors.card : '#FFFFFF' }
          ]}
        >
          <Icon name="filter-variant" size={20} color={theme.colors.primary} />
          <Text style={[styles.filterText, { color: theme.colors.primary }]}>
            Filtrar
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhuma transação encontrada.{'\n'}
                Adicione uma nova transação na tela inicial.
              </Text>
            </View>
          )}
        />
      )}
      
      {showConfirmDelete && (
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, isDarkMode && styles.confirmModalDark]}>
            <Text style={[styles.confirmTitle, isDarkMode && styles.textDark]}>Excluir Transação</Text>
            <Text style={[styles.confirmMessage, isDarkMode && styles.textLightDark]}>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowConfirmDelete(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.deleteConfirmText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}; 