import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import { Transaction, Category, RecurrenceType } from '../../types/finance';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TransactionFormProps {
  isVisible: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
  transactionType?: 'income' | 'expense';
}

const TransactionForm = ({ 
  isVisible, 
  onClose, 
  initialTransaction = null,
  transactionType = 'expense'
}: TransactionFormProps) => {
  const { isDarkMode } = useTheme();
  const { addTransaction, updateTransaction, categories } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>(transactionType as 'income' | 'expense');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const [showRecurrenceEndDatePicker, setShowRecurrenceEndDatePicker] = useState(false);
  
  useEffect(() => {
    if (initialTransaction) {
      setAmount(initialTransaction.amount.toString());
      setDescription(initialTransaction.description);
      setDate(new Date(initialTransaction.date));
      const category = categories.find(c => c.id === initialTransaction.categoryId);
      setSelectedCategory(category || null);
      setType(initialTransaction.type);
      setTags(initialTransaction.tags || []);
      setIsRecurrent(initialTransaction.isRecurrent || false);
      setRecurrenceType(initialTransaction.recurrenceType || 'none');
      if (initialTransaction.recurrenceEndDate) {
        setRecurrenceEndDate(new Date(initialTransaction.recurrenceEndDate));
      }
    } else {
      resetForm();
    }
  }, [initialTransaction, categories]);
  
  const resetForm = () => {
    setAmount('');
    setDescription('');
    setDate(new Date());
    setSelectedCategory(null);
    setType(transactionType as 'income' | 'expense');
    setTags([]);
    setCurrentTag('');
    setIsRecurrent(false);
    setRecurrenceType('none');
    setRecurrenceEndDate(null);
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSave = () => {
    if (!amount || !description || !selectedCategory) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      const parsedAmount = parseFloat(amount.replace(',', '.'));
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Erro', 'Por favor, insira um valor válido.');
        return;
      }
      
      const transactionData: Omit<Transaction, 'id'> = {
        type,
        amount: parsedAmount,
        description,
        date: date.toISOString(),
        categoryId: selectedCategory.id,
        tags,
        isRecurrent,
        recurrenceType: isRecurrent ? recurrenceType : 'none',
        recurrenceEndDate: isRecurrent && recurrenceEndDate ? recurrenceEndDate.toISOString() : undefined,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (initialTransaction) {
        updateTransaction(initialTransaction.id, {
          ...transactionData,
          id: initialTransaction.id,
          parentTransactionId: initialTransaction.parentTransactionId,
        });
      } else {
        addTransaction(transactionData);
      }
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Erro', 'Falha ao salvar a transação');
    }
  };
  
  const renderRecurrenceOptions = () => {
    return (
      <View style={styles.recurrenceContainer}>
        <View style={styles.switchRow}>
          <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Transação Recorrente</Text>
          <Switch
            value={isRecurrent}
            onValueChange={setIsRecurrent}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isRecurrent ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        
        {isRecurrent && (
          <>
            <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Frequência</Text>
            <View style={styles.recurrenceOptions}>
              {['daily', 'weekly', 'monthly', 'yearly'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.recurrenceOption,
                    recurrenceType === option && styles.selectedRecurrenceOption,
                    isDarkMode && styles.darkRecurrenceOption,
                    recurrenceType === option && isDarkMode && styles.darkSelectedRecurrenceOption
                  ]}
                  onPress={() => setRecurrenceType(option as RecurrenceType)}
                >
                  <Text
                    style={[
                      styles.recurrenceText,
                      recurrenceType === option && styles.selectedRecurrenceText,
                      isDarkMode && styles.darkRecurrenceText,
                      recurrenceType === option && isDarkMode && styles.darkSelectedRecurrenceText
                    ]}
                  >
                    {option === 'daily' && 'Diária'}
                    {option === 'weekly' && 'Semanal'}
                    {option === 'monthly' && 'Mensal'}
                    {option === 'yearly' && 'Anual'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.endDateRow}>
              <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Data final (opcional)</Text>
              <TouchableOpacity
                style={[styles.dateButton, isDarkMode && styles.darkDateButton]}
                onPress={() => setShowRecurrenceEndDatePicker(true)}
              >
                <Text style={[styles.dateButtonText, isDarkMode && styles.darkDateButtonText]}>
                  {recurrenceEndDate ? recurrenceEndDate.toLocaleDateString() : 'Selecionar'}
                </Text>
                <Icon name="calendar" size={16} color={isDarkMode ? '#e0e0e0' : '#333333'} />
              </TouchableOpacity>
            </View>
            
            {showRecurrenceEndDatePicker && (
              <DateTimePicker
                value={recurrenceEndDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowRecurrenceEndDatePicker(false);
                  if (selectedDate) {
                    setRecurrenceEndDate(selectedDate);
                  }
                }}
              />
            )}
          </>
        )}
      </View>
    );
  };
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.centeredView, isDarkMode && styles.darkCenteredView]}>
        <View style={[styles.modalView, isDarkMode && styles.darkModalView]}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <Text style={[styles.title, isDarkMode && styles.darkTitle]}>
                {initialTransaction ? 'Editar Transação' : 'Nova Transação'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="times" size={24} color={isDarkMode ? '#e0e0e0' : '#333333'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && styles.activeTypeButton,
                  isDarkMode && styles.darkTypeButton,
                  type === 'income' && isDarkMode && styles.darkActiveTypeButton
                ]}
                onPress={() => setType('income')}
              >
                <Icon name="plus" size={16} color={type === 'income' ? '#fff' : isDarkMode ? '#e0e0e0' : '#333'} />
                <Text
                  style={[
                    styles.typeText,
                    type === 'income' && styles.activeTypeText,
                    isDarkMode && styles.darkTypeText,
                    type === 'income' && isDarkMode && styles.darkActiveTypeText
                  ]}
                >
                  Receita
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && styles.activeTypeButton,
                  isDarkMode && styles.darkTypeButton,
                  type === 'expense' && isDarkMode && styles.darkActiveExpenseButton
                ]}
                onPress={() => setType('expense')}
              >
                <Icon name="minus" size={16} color={type === 'expense' ? '#fff' : isDarkMode ? '#e0e0e0' : '#333'} />
                <Text
                  style={[
                    styles.typeText,
                    type === 'expense' && styles.activeTypeText,
                    isDarkMode && styles.darkTypeText,
                    type === 'expense' && isDarkMode && styles.darkActiveTypeText
                  ]}
                >
                  Despesa
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Valor*</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Descrição*</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.darkInput]}
                placeholder="Ex: Almoço, Salário..."
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={description}
                onChangeText={setDescription}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Categoria*</Text>
              <TouchableOpacity
                style={[styles.categoryButton, isDarkMode && styles.darkCategoryButton]}
                onPress={() => setShowCategoryPicker(true)}
              >
                {selectedCategory ? (
                  <View style={styles.selectedCategoryContainer}>
                    <Icon name={selectedCategory.icon} size={16} color={selectedCategory.color} />
                    <Text style={[styles.selectedCategoryText, isDarkMode && styles.darkSelectedCategoryText]}>
                      {selectedCategory.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.categoryButtonText, isDarkMode && styles.darkCategoryButtonText]}>
                    Selecionar Categoria
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Data*</Text>
              <TouchableOpacity
                style={[styles.dateButton, isDarkMode && styles.darkDateButton]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateButtonText, isDarkMode && styles.darkDateButtonText]}>
                  {date.toLocaleDateString()}
                </Text>
                <Icon name="calendar" size={16} color={isDarkMode ? '#e0e0e0' : '#333333'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Tags (opcional)</Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, isDarkMode && styles.darkTag]}>
                    <Text style={[styles.tagText, isDarkMode && styles.darkTagText]}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Icon name="times" size={14} color={isDarkMode ? '#ddd' : '#666'} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[styles.tagInput, isDarkMode && styles.darkTagInput]}
                  placeholder="Adicionar tag"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  value={currentTag}
                  onChangeText={setCurrentTag}
                />
                <TouchableOpacity
                  style={[styles.addTagButton, isDarkMode && styles.darkAddTagButton]}
                  onPress={addTag}
                  disabled={!currentTag.trim()}
                >
                  <Icon name="plus" size={16} color={currentTag.trim() ? (isDarkMode ? '#fff' : '#333') : (isDarkMode ? '#888' : '#ccc')} />
                </TouchableOpacity>
              </View>
            </View>
            
            {renderRecurrenceOptions()}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isDarkMode ? styles.darkSaveButton : null,
                  type === 'income' ? styles.incomeSaveButton : styles.expenseSaveButton
                ]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={[styles.centeredView, isDarkMode && styles.darkCenteredView]}>
          <View style={[styles.modalView, isDarkMode && styles.darkModalView]}>
            <View style={styles.header}>
              <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Selecionar Categoria</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)} style={styles.closeButton}>
                <Icon name="times" size={24} color={isDarkMode ? '#e0e0e0' : '#333333'} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories.filter(category => category.type === type)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryItem, isDarkMode && styles.darkCategoryItem]}
                  onPress={() => {
                    setSelectedCategory(item);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Icon name={item.icon} size={24} color={item.color} />
                  <Text style={[styles.categoryItemText, isDarkMode && styles.darkCategoryItemText]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  darkCenteredView: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  darkModalView: {
    backgroundColor: '#222',
  },
  scrollView: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  darkTitle: {
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    width: '48%',
  },
  darkTypeButton: {
    backgroundColor: '#444',
  },
  activeTypeButton: {
    backgroundColor: '#4caf50',
  },
  darkActiveTypeButton: {
    backgroundColor: '#2e7d32',
  },
  darkActiveExpenseButton: {
    backgroundColor: '#c62828',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  darkTypeText: {
    color: '#e0e0e0',
  },
  activeTypeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  darkActiveTypeText: {
    color: '#fff',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  darkLabel: {
    color: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  darkInput: {
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#e0e0e0',
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkCategoryButton: {
    borderColor: '#555',
    backgroundColor: '#333',
  },
  selectedCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  darkSelectedCategoryText: {
    color: '#e0e0e0',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#999',
  },
  darkCategoryButtonText: {
    color: '#888',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkDateButton: {
    borderColor: '#555',
    backgroundColor: '#333',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  darkDateButtonText: {
    color: '#e0e0e0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  darkTag: {
    backgroundColor: '#444',
  },
  tagText: {
    marginRight: 5,
    color: '#333',
  },
  darkTagText: {
    color: '#e0e0e0',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  darkTagInput: {
    borderColor: '#555',
    backgroundColor: '#333',
    color: '#e0e0e0',
  },
  addTagButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
  darkAddTagButton: {
    backgroundColor: '#444',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  darkSaveButton: {
    backgroundColor: '#388E3C',
  },
  incomeSaveButton: {
    backgroundColor: '#4CAF50',
  },
  expenseSaveButton: {
    backgroundColor: '#F44336',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkCategoryItem: {
    borderBottomColor: '#444',
  },
  categoryItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  darkCategoryItemText: {
    color: '#e0e0e0',
  },
  recurrenceContainer: {
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  recurrenceOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  darkRecurrenceOption: {
    backgroundColor: '#444',
  },
  selectedRecurrenceOption: {
    backgroundColor: '#4a90e2',
  },
  darkSelectedRecurrenceOption: {
    backgroundColor: '#2a6bbd',
  },
  recurrenceText: {
    color: '#333',
    fontSize: 14,
  },
  darkRecurrenceText: {
    color: '#e0e0e0',
  },
  selectedRecurrenceText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  darkSelectedRecurrenceText: {
    color: '#fff',
  },
  endDateRow: {
    marginTop: 5,
  },
});

export default TransactionForm; 