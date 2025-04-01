import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../styles/theme';

export const BudgetScreen = () => {
  const { isDarkMode } = useTheme();
  const { budgets, addBudget, updateBudget, deleteBudget, categories } = useFinance();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Aqui você pode recarregar os dados se necessário
    setRefreshing(false);
  }, []);

  const handleAddBudget = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
      return;
    }

    if (!category) {
      Alert.alert('Erro', 'Por favor, selecione uma categoria');
      return;
    }

    try {
      if (selectedBudget) {
        await updateBudget(selectedBudget.id, {
          ...selectedBudget,
          amount: Number(amount),
          categoryId: category,
        });
      } else {
        await addBudget({
          categoryId: category,
          amount: parseFloat(amount.replace(',', '.')),
          period: 'monthly',
          name: categories.find(c => c.id === category)?.name || 'Novo Orçamento',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          rollover: false
        });
      }

      setShowAddModal(false);
      setAmount('');
      setCategory('');
      setSelectedBudget(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o orçamento');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este orçamento?',
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
              await deleteBudget(id);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o orçamento');
            }
          },
        },
      ]
    );
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudget(budget);
    setAmount(budget.amount.toString());
    setCategory(budget.categoryId);
    setShowAddModal(true);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const calculateProgress = (budget: any) => {
    return (budget.spent / budget.amount) * 100;
  };

  const getProgressColor = (progress: number): ColorValue => {
    if (progress >= 100) return theme.colors.error;
    if (progress >= 80) return theme.colors.warning;
    return theme.colors.success;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.colors.background.dark : theme.colors.background.light,
    },
    header: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...theme.typography.h1,
      color: isDarkMode ? theme.colors.text.dark : theme.colors.text.light,
    } as TextStyle,
    addButton: {
      backgroundColor: theme.colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      padding: theme.spacing.md,
    },
    budgetItem: {
      backgroundColor: isDarkMode ? theme.colors.card.dark : theme.colors.card.light,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.small,
    },
    budgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    budgetCategory: {
      ...theme.typography.bodyBold,
      color: isDarkMode ? theme.colors.text.dark : theme.colors.text.light,
    } as TextStyle,
    budgetActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      padding: theme.spacing.xs,
    },
    progressContainer: {
      height: 4,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderRadius: 2,
      marginVertical: theme.spacing.sm,
    },
    progressBar: {
      height: '100%',
      borderRadius: 2,
    },
    budgetValues: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    budgetText: {
      ...theme.typography.caption,
      color: isDarkMode ? theme.colors.textSecondary.dark : theme.colors.textSecondary.light,
    } as TextStyle,
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: theme.spacing.md,
    },
    modalContent: {
      backgroundColor: isDarkMode ? theme.colors.card.dark : theme.colors.card.light,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
    },
    modalTitle: {
      ...theme.typography.h2,
      color: isDarkMode ? theme.colors.text.dark : theme.colors.text.light,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    } as TextStyle,
    input: {
      backgroundColor: isDarkMode ? theme.colors.background.dark : theme.colors.background.light,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      color: isDarkMode ? theme.colors.text.dark : theme.colors.text.light,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
    },
    saveButtonText: {
      ...theme.typography.button,
      color: theme.colors.background.light,
    } as TextStyle,
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyStateText: {
      ...theme.typography.body,
      color: isDarkMode ? theme.colors.textSecondary.dark : theme.colors.textSecondary.light,
      textAlign: 'center',
    } as TextStyle,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orçamentos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <FontAwesome5 
            name="plus" 
            size={20} 
            color={theme.colors.background.light}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhum orçamento definido.{'\n'}
              Adicione um novo orçamento para começar a controlar seus gastos.
            </Text>
          </View>
        ) : (
          budgets.map((budget) => (
            <View key={budget.id} style={styles.budgetItem}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetCategory}>{categories.find(c => c.id === budget.categoryId)?.name}</Text>
                <View style={styles.budgetActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditBudget(budget)}
                  >
                    <FontAwesome5 
                      name="edit" 
                      size={16} 
                      color={isDarkMode ? theme.colors.textSecondary.dark : theme.colors.textSecondary.light}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteBudget(budget.id)}
                  >
                    <FontAwesome5 
                      name="trash" 
                      size={16} 
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(calculateProgress(budget), 100)}%`,
                      backgroundColor: getProgressColor(calculateProgress(budget)),
                    },
                  ]} 
                />
              </View>

              <View style={styles.budgetValues}>
                <Text style={styles.budgetText}>
                  Gasto: {formatCurrency(budget.spent)}
                </Text>
                <Text style={styles.budgetText}>
                  Meta: {formatCurrency(budget.amount)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAddModal(false);
          setSelectedBudget(null);
          setAmount('');
          setCategory('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Valor"
              placeholderTextColor={isDarkMode ? theme.colors.textSecondary.dark : theme.colors.textSecondary.light}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={styles.input}
              placeholder="Categoria"
              placeholderTextColor={isDarkMode ? theme.colors.textSecondary.dark : theme.colors.textSecondary.light}
              value={category}
              onChangeText={setCategory}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddBudget}
            >
              <Text style={styles.saveButtonText}>SALVAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}; 