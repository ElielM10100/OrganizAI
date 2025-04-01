import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ActionButtonsProps {
  onPressAddIncome: () => void;
  onPressAddExpense: () => void;
  onPressTransfer: () => void;
  isDarkMode: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onPressAddIncome,
  onPressAddExpense,
  onPressTransfer,
  isDarkMode
}) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity 
        style={[
          styles.actionButton, 
          { backgroundColor: isDarkMode ? '#3C3972' : '#F3F4F6' }
        ]} 
        onPress={onPressAddIncome}
      >
        <View style={[styles.iconWrapper, { backgroundColor: '#E6F7EC' }]}>
          <Icon name="arrow-down" size={18} color="#4CAF50" />
        </View>
        <Text style={[
          styles.actionLabel,
          { color: isDarkMode ? '#E0E0E0' : '#464A54' }
        ]}>
          Receita
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.actionButton, 
          { backgroundColor: isDarkMode ? '#3C3972' : '#F3F4F6' }
        ]} 
        onPress={onPressAddExpense}
      >
        <View style={[styles.iconWrapper, { backgroundColor: '#FDEEEB' }]}>
          <Icon name="arrow-up" size={18} color="#F44336" />
        </View>
        <Text style={[
          styles.actionLabel,
          { color: isDarkMode ? '#E0E0E0' : '#464A54' }
        ]}>
          Despesa
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.actionButton, 
          { backgroundColor: isDarkMode ? '#3C3972' : '#F3F4F6' }
        ]} 
        onPress={onPressTransfer}
      >
        <View style={[styles.iconWrapper, { backgroundColor: '#EEF1FC' }]}>
          <Icon name="bank-transfer" size={18} color="#5142AB" />
        </View>
        <Text style={[
          styles.actionLabel,
          { color: isDarkMode ? '#E0E0E0' : '#464A54' }
        ]}>
          Transferir
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  actionButton: {
    padding: 12,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 