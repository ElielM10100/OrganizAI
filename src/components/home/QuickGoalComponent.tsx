import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ProgressBarAndroid,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  dueDate: string;
  icon: string;
  color: string;
}

interface QuickGoalComponentProps {
  goals: Goal[];
  onGoalPress: (goal: Goal) => void;
  onAddGoalPress: () => void;
  isDarkMode: boolean;
}

export const QuickGoalComponent: React.FC<QuickGoalComponentProps> = ({
  goals,
  onGoalPress,
  onAddGoalPress,
  isDarkMode
}) => {
  // Formatar o valor como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular a porcentagem de progresso
  const calculateProgress = (current: number, target: number) => {
    return Math.min(current / target, 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[
          styles.sectionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Metas
        </Text>
        <TouchableOpacity onPress={onAddGoalPress}>
          <Icon 
            name="plus" 
            size={20} 
            color={isDarkMode ? '#9DADF2' : '#5142AB'} 
          />
        </TouchableOpacity>
      </View>

      {goals.length > 0 ? (
        <View>
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  { backgroundColor: isDarkMode ? '#2D2A55' : '#FFFFFF' }
                ]}
                onPress={() => onGoalPress(goal)}
              >
                <View style={styles.goalHeader}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: goal.color }
                  ]}>
                    <Icon name={goal.icon} size={15} color="#FFFFFF" />
                  </View>
                  
                  <View style={styles.goalInfo}>
                    <Text style={[
                      styles.goalTitle,
                      { color: isDarkMode ? '#FFFFFF' : '#000000' }
                    ]}>
                      {goal.title}
                    </Text>
                    <Text style={[
                      styles.goalDateText,
                      { color: isDarkMode ? '#9DADF2' : '#71727A' }
                    ]}>
                      Vencimento: {goal.dueDate}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    {Platform.OS === 'android' ? (
                      <ProgressBarAndroid
                        styleAttr="Horizontal"
                        indeterminate={false}
                        progress={progress}
                        color={goal.color}
                        style={styles.androidProgressBar}
                      />
                    ) : (
                      <View style={styles.iosProgressBarContainer}>
                        <View 
                          style={[
                            styles.iosProgressBar, 
                            { 
                              width: `${progress * 100}%`,
                              backgroundColor: goal.color 
                            }
                          ]} 
                        />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.amountsContainer}>
                    <Text style={[
                      styles.currentAmount,
                      { color: isDarkMode ? '#FFFFFF' : '#000000' }
                    ]}>
                      {formatCurrency(goal.currentAmount)}
                    </Text>
                    <Text style={[
                      styles.targetAmount,
                      { color: isDarkMode ? '#9DADF2' : '#71727A' }
                    ]}>
                      {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={[
          styles.emptyContainer,
          { backgroundColor: isDarkMode ? '#2D2A55' : '#FFFFFF' }
        ]}>
          <Text style={[
            styles.emptyText,
            { color: isDarkMode ? '#9DADF2' : '#71727A' }
          ]}>
            Você ainda não tem metas. Clique no "+" para adicionar uma nova meta.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
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
  goalCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  goalDateText: {
    fontSize: 11,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 12,
    marginBottom: 5,
  },
  androidProgressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  iosProgressBarContainer: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  iosProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  amountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  targetAmount: {
    fontSize: 12,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
}); 