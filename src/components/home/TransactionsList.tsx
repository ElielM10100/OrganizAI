import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Define o tipo de transação
interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  icon?: string;
  iconBgColor?: string;
}

interface TransactionsListProps {
  transactions: Array<{
    id: string;
    title: string;
    amount: number;
    date: string;
    category: string;
    type: 'income' | 'expense';
    icon: string;
    iconBgColor: string;
  }>;
  onViewAllPress: () => void;
  onTransactionPress: (id: string) => void;
  isDarkMode: boolean;
  filterType: 'all' | 'income' | 'expense';
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onViewAllPress,
  onTransactionPress,
  isDarkMode,
  filterType
}) => {
  // Formatar o valor como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para renderizar cada item da lista
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[
        styles.transactionItem,
        { backgroundColor: isDarkMode ? '#2D2A55' : '#FFFFFF' }
      ]}
      onPress={() => onTransactionPress(item.id)}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: item.iconBgColor || (isDarkMode ? '#3C3972' : '#F0F0F5') }
      ]}>
        <Icon 
          name={item.icon || (item.type === 'income' ? 'arrow-down' : 'arrow-up')} 
          size={16}
          color={item.type === 'income' ? '#4CAF50' : '#F44336'}
        />
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={[
          styles.transactionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          {item.title}
        </Text>
        <Text style={[
          styles.transactionCategory,
          { color: isDarkMode ? '#9DADF2' : '#71727A' }
        ]}>
          {item.category}
        </Text>
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: item.type === 'income' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
        <Text style={[
          styles.dateText,
          { color: isDarkMode ? '#9DADF2' : '#71727A' }
        ]}>
          {item.date}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[
          styles.sectionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Transações Recentes
        </Text>
        <TouchableOpacity>
          <Text style={[
            styles.seeAllText,
            { color: isDarkMode ? '#9DADF2' : '#5142AB' }
          ]}>
            Ver todas
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
  },
}); 