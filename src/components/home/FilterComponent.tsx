import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface FilterComponentProps {
  selectedPeriod: 'week' | 'month' | 'year';
  periodOptions: Array<'week' | 'month' | 'year'>;
  selectedFilter: 'all' | 'income' | 'expense';
  filterOptions: Array<{
    id: 'all' | 'income' | 'expense';
    label: string;
    icon: string;
  }>;
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
  onFilterChange: (filter: 'all' | 'income' | 'expense') => void;
  isDarkMode: boolean;
}

export const FilterComponent: React.FC<FilterComponentProps> = ({
  selectedPeriod,
  periodOptions,
  selectedFilter,
  filterOptions,
  onPeriodChange,
  onFilterChange,
  isDarkMode
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Período
        </Text>
        
        <View style={styles.chipsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.periodScrollContainer}
          >
            {periodOptions.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: selectedPeriod === period 
                      ? (isDarkMode ? '#5142AB' : '#5142AB') 
                      : (isDarkMode ? '#3C3972' : '#F3F4F6')
                  }
                ]}
                onPress={() => onPeriodChange(period)}
              >
                <Text
                  style={[
                    styles.periodChipText,
                    {
                      color: selectedPeriod === period 
                        ? '#FFFFFF'
                        : (isDarkMode ? '#9DADF2' : '#5142AB')
                    }
                  ]}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[
          styles.sectionTitle,
          { color: isDarkMode ? '#FFFFFF' : '#000000' }
        ]}>
          Filtros
        </Text>
        
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filtersScrollContainer}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedFilter === filter.id 
                      ? (isDarkMode ? '#5142AB' : '#5142AB') 
                      : (isDarkMode ? '#3C3972' : '#F3F4F6')
                  }
                ]}
                onPress={() => onFilterChange(filter.id)}
              >
                <Icon
                  name={filter.icon}
                  size={18}
                  color={selectedFilter === filter.id 
                    ? '#FFFFFF'
                    : (isDarkMode ? '#9DADF2' : '#5142AB')
                  }
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: selectedFilter === filter.id 
                        ? '#FFFFFF'
                        : (isDarkMode ? '#9DADF2' : '#5142AB')
                    }
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
  },
  periodScrollContainer: {
    paddingRight: 20,
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filtersScrollContainer: {
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
}); 