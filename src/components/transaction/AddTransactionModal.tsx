import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency } from '../../utils/date/FormatUtils';
import type { Category, TransactionType } from '../../types/finance';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  initialTransactionType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  initialTransactionType = 'expense'
}) => {
  const { isDarkMode, theme } = useTheme();
  const { categories, addTransaction } = useFinance();
  
  // Estados para dados da transação
  const [transactionType, setTransactionType] = useState<TransactionType>(initialTransactionType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'monthly' | 'weekly'>('monthly');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Cores de tema específicas para o modal
  const backgroundColor = isDarkMode ? theme.colors.card : theme.colors.background;
  const textColor = theme.colors.text;
  const secondaryTextColor = isDarkMode
    ? theme.colors.textSecondary.dark
    : theme.colors.textSecondary.light;
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  // Filtrar categorias por tipo selecionado
  const filteredCategories = categories.filter(cat => cat.type === transactionType);
  
  // Resetar o estado ao mudar o tipo de transação
  useEffect(() => {
    setSelectedCategory('');
  }, [transactionType]);
  
  // Resetar formulário ao abrir modal
  useEffect(() => {
    if (visible) {
      setTransactionType(initialTransactionType);
      setAmount('');
      setDescription('');
      setSelectedCategory('');
      setIsRecurrent(false);
      setErrorMessage('');
    }
  }, [visible, initialTransactionType]);
  
  // Manipulador de valor
  const handleAmountChange = (text: string) => {
    // Remove qualquer caractere que não seja número ou vírgula
    const cleanedText = text.replace(/[^\d,]/g, '');
    // Garante que só haja uma vírgula
    const parts = cleanedText.split(',');
    if (parts.length > 2) {
      return;
    }
    // Limita as casas decimais a 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    setAmount(cleanedText);
  };
  
  // Criar nova transação
  const handleAddTransaction = async () => {
    // Validações
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0) {
      setErrorMessage('Informe um valor válido');
      return;
    }
    
    if (!description.trim()) {
      setErrorMessage('Informe uma descrição');
      return;
    }
    
    if (!selectedCategory) {
      setErrorMessage('Selecione uma categoria');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
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
        recurrence: isRecurrent
          ? {
              frequency: recurrenceFrequency,
              interval: 1,
            }
          : undefined,
      };
      
      // Adicionar transação
      await addTransaction(transaction);
      
      // Fechar modal após adicionar
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      setErrorMessage('Erro ao adicionar transação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderizar categoria
  const renderCategoryItem = (category: Category) => {
    const isSelected = selectedCategory === category.id;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          {
            backgroundColor: isSelected
              ? `${category.color}33` // Adiciona 20% de opacidade à cor
              : isDarkMode
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.05)',
            borderColor: isSelected ? category.color : borderColor,
          },
        ]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <Icon
          name={category.icon}
          size={20}
          color={isSelected ? category.color : secondaryTextColor}
          style={styles.categoryIcon}
        />
        <Text
          style={[
            styles.categoryName,
            {
              color: isSelected ? category.color : textColor,
              fontWeight: isSelected ? '600' : '400',
            },
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View
            style={[
              styles.modal,
              { backgroundColor },
            ]}
          >
            {/* Cabeçalho do modal */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: textColor }]}>
                {transactionType === 'income' ? 'Nova Receita' : 'Nova Despesa'}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            
            {/* Seletor de tipo de transação */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'expense' && [
                    styles.activeTypeButton,
                    { backgroundColor: '#FFEBEE' }
                  ],
                ]}
                onPress={() => setTransactionType('expense')}
              >
                <Icon
                  name="arrow-down"
                  size={18}
                  color={transactionType === 'expense' ? '#E53935' : secondaryTextColor}
                />
                <Text
                  style={[
                    styles.typeText,
                    { color: transactionType === 'expense' ? '#E53935' : secondaryTextColor },
                  ]}
                >
                  Despesa
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'income' && [
                    styles.activeTypeButton,
                    { backgroundColor: '#E8F5E9' }
                  ],
                ]}
                onPress={() => setTransactionType('income')}
              >
                <Icon
                  name="arrow-up"
                  size={18}
                  color={transactionType === 'income' ? '#43A047' : secondaryTextColor}
                />
                <Text
                  style={[
                    styles.typeText,
                    { color: transactionType === 'income' ? '#43A047' : secondaryTextColor },
                  ]}
                >
                  Receita
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.form}>
              {/* Campo de valor */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Valor</Text>
                <View style={[styles.amountInput, { borderColor }]}>
                  <Text style={[styles.currencySymbol, { color: textColor }]}>R$</Text>
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder="0,00"
                    placeholderTextColor={secondaryTextColor}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              {/* Campo de descrição */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Descrição</Text>
                <TextInput
                  style={[styles.textInput, { borderColor, color: textColor }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descrição da transação"
                  placeholderTextColor={secondaryTextColor}
                />
              </View>
              
              {/* Seleção de categoria */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: textColor }]}>Categoria</Text>
                <View style={styles.categoriesContainer}>
                  {filteredCategories.length > 0 ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.categoriesList}
                    >
                      {filteredCategories.map(renderCategoryItem)}
                    </ScrollView>
                  ) : (
                    <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                      Nenhuma categoria disponível
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Opção de recorrência */}
              <View style={styles.switchContainer}>
                <Text style={[styles.label, { color: textColor }]}>Transação recorrente</Text>
                <Switch
                  value={isRecurrent}
                  onValueChange={setIsRecurrent}
                  trackColor={{
                    false: isDarkMode ? '#555' : '#ccc',
                    true: theme.colors.primary,
                  }}
                  thumbColor={isRecurrent ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
              
              {/* Opções de recorrência */}
              {isRecurrent && (
                <View style={styles.recurrenceOptions}>
                  <TouchableOpacity
                    style={[
                      styles.recurrenceButton,
                      recurrenceFrequency === 'monthly' && [
                        styles.activeRecurrenceButton,
                        { backgroundColor: `${theme.colors.primary}33` },
                      ],
                    ]}
                    onPress={() => setRecurrenceFrequency('monthly')}
                  >
                    <Text
                      style={[
                        styles.recurrenceText,
                        {
                          color: recurrenceFrequency === 'monthly'
                            ? theme.colors.primary
                            : textColor,
                        },
                      ]}
                    >
                      Mensal
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.recurrenceButton,
                      recurrenceFrequency === 'weekly' && [
                        styles.activeRecurrenceButton,
                        { backgroundColor: `${theme.colors.primary}33` },
                      ],
                    ]}
                    onPress={() => setRecurrenceFrequency('weekly')}
                  >
                    <Text
                      style={[
                        styles.recurrenceText,
                        {
                          color: recurrenceFrequency === 'weekly'
                            ? theme.colors.primary
                            : textColor,
                        },
                      ]}
                    >
                      Semanal
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Mensagem de erro */}
              {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}
            </ScrollView>
            
            {/* Botão de adicionar */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddTransaction}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.addButtonText}>Processando...</Text>
              ) : (
                <Text style={styles.addButtonText}>Adicionar</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  activeTypeButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    height: 48,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  recurrenceButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  activeRecurrenceButton: {
    borderColor: 'transparent',
  },
  recurrenceText: {
    fontWeight: '500',
  },
  errorMessage: {
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 