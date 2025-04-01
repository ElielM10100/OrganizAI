import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useFinance } from '../../contexts/FinanceContext';
import { FontAwesome5 } from '@expo/vector-icons';
import type { Goal, GoalType } from '../../types/finance';

const GOAL_TYPES: { type: GoalType; label: string; icon: string }[] = [
  { type: 'savings', label: 'Economia', icon: 'piggy-bank' },
  { type: 'debt', label: 'Dívida', icon: 'credit-card' },
  { type: 'investment', label: 'Investimento', icon: 'chart-line' },
  { type: 'purchase', label: 'Compra', icon: 'shopping-cart' },
];

const GOAL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B786F', '#A8E6CF',
];

export const GoalsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    type: 'savings' as GoalType,
    targetAmount: '',
    startDate: '',
    targetDate: '',
    description: '',
    categoryId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    color: GOAL_COLORS[0],
    icon: GOAL_TYPES[0].icon,
    currentAmount: 0,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Atualizar dados aqui se necessário
    setRefreshing(false);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateProgress = (goal: Goal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const handleAddGoal = async () => {
    try {
      if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos');
        return;
      }

      await addGoal({
        targetAmount: parseFloat(newGoal.targetAmount.replace(',', '.')),
        startDate: new Date(newGoal.startDate).toISOString(),
        targetDate: new Date(newGoal.targetDate).toISOString(),
        name: newGoal.name,
        type: newGoal.type,
        color: newGoal.color,
        icon: newGoal.icon,
        priority: newGoal.priority,
        description: newGoal.description,
        categoryId: newGoal.categoryId
      });

      setModalVisible(false);
      setNewGoal({
        name: '',
        type: 'savings',
        targetAmount: '',
        startDate: '',
        targetDate: '',
        description: '',
        categoryId: '',
        priority: 'medium',
        color: GOAL_COLORS[0],
        icon: GOAL_TYPES[0].icon,
        currentAmount: 0,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a meta');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir a meta');
    }
  };

  const renderGoalCard = (goal: Goal) => {
    const progress = calculateProgress(goal);
    const goalType = GOAL_TYPES.find(t => t.type === goal.type);

    return (
      <View
        key={goal.id}
        style={[
          styles.goalCard,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalIcon}>
            <FontAwesome5
              name={goal.icon}
              size={24}
              color={goal.color}
            />
          </View>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalName, { color: theme.colors.text }]}>
              {goal.name}
            </Text>
            <Text style={[styles.goalType, { color: theme.colors.text }]}>
              {goalType?.label}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteGoal(goal.id)}
            style={styles.deleteButton}
          >
            <FontAwesome5 name="trash" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.goalProgress}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: goal.color,
                  width: `${Math.min(progress, 100)}%`,
                },
              ]}
            />
          </View>
          <View style={styles.goalAmounts}>
            <Text style={[styles.currentAmount, { color: theme.colors.text }]}>
              {formatCurrency(goal.currentAmount)}
            </Text>
            <Text style={[styles.targetAmount, { color: theme.colors.text }]}>
              {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
        </View>

        <Text style={[styles.deadline, { color: theme.colors.text }]}>
          Prazo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        {goals.map(renderGoalCard)}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name="plus" size={24} color={theme.colors.background} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Nova Meta
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Nome da meta"
              placeholderTextColor={theme.colors.text}
              value={newGoal.name}
              onChangeText={text => setNewGoal({ ...newGoal, name: text })}
            />

            <View style={styles.typeSelector}>
              {GOAL_TYPES.map(type => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        newGoal.type === type.type
                          ? theme.colors.primary
                          : theme.colors.background,
                    },
                  ]}
                  onPress={() =>
                    setNewGoal({ ...newGoal, type: type.type, icon: type.icon })
                  }
                >
                  <FontAwesome5
                    name={type.icon}
                    size={20}
                    color={
                      newGoal.type === type.type
                        ? theme.colors.background
                        : theme.colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      {
                        color:
                          newGoal.type === type.type
                            ? theme.colors.background
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Valor alvo"
              placeholderTextColor={theme.colors.text}
              keyboardType="numeric"
              value={newGoal.targetAmount}
              onChangeText={text =>
                setNewGoal({ ...newGoal, targetAmount: text })
              }
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                },
              ]}
              placeholder="Data limite (YYYY-MM-DD)"
              placeholderTextColor={theme.colors.text}
              value={newGoal.targetDate}
              onChangeText={text => setNewGoal({ ...newGoal, targetDate: text })}
            />

            <View style={styles.colorSelector}>
              {GOAL_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    {
                      backgroundColor: color,
                      borderWidth: newGoal.color === color ? 3 : 0,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setNewGoal({ ...newGoal, color })}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.error },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleAddGoal}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  goalCard: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 10,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalType: {
    fontSize: 14,
    opacity: 0.8,
  },
  deleteButton: {
    padding: 5,
  },
  goalProgress: {
    marginVertical: 10,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  currentAmount: {
    fontSize: 16,
  },
  targetAmount: {
    fontSize: 16,
  },
  deadline: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    width: '48%',
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  typeLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 