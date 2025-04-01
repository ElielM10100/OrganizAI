import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  showIcon?: boolean;
}

export const NotificationComponent: React.FC<NotificationProps> = ({
  message,
  type,
  visible,
  onDismiss,
  duration = 3000,
  showIcon = true,
}) => {
  const { isDarkMode, theme } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isHidden, setIsHidden] = useState(!visible);
  
  // Determinar cores, ícones com base no tipo
  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9',
          borderColor: '#4CAF50',
          textColor: isDarkMode ? '#FFFFFF' : '#1B5E20',
          icon: 'check-circle',
        };
      case 'error':
        return {
          backgroundColor: isDarkMode ? '#B71C1C' : '#FFEBEE',
          borderColor: '#F44336',
          textColor: isDarkMode ? '#FFFFFF' : '#B71C1C',
          icon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: isDarkMode ? '#F57F17' : '#FFF8E1',
          borderColor: '#FFC107',
          textColor: isDarkMode ? '#FFFFFF' : '#F57F17',
          icon: 'alert',
        };
      case 'info':
      default:
        return {
          backgroundColor: isDarkMode ? '#0D47A1' : '#E3F2FD',
          borderColor: '#2196F3',
          textColor: isDarkMode ? '#FFFFFF' : '#0D47A1',
          icon: 'information',
        };
    }
  };
  
  const typeStyle = getTypeStyle();
  
  // Animações para entrada e saída
  useEffect(() => {
    if (visible) {
      setIsHidden(false);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto-dismiss após a duração especificada
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      handleDismiss();
    }
  }, [visible]);
  
  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsHidden(true);
      onDismiss();
    });
  };
  
  if (isHidden) {
    return null;
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: typeStyle.backgroundColor,
          borderColor: typeStyle.borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        {showIcon && (
          <Icon
            name={typeStyle.icon}
            size={24}
            color={typeStyle.textColor}
            style={styles.icon}
          />
        )}
        <Text style={[styles.message, { color: typeStyle.textColor }]}>
          {message}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={handleDismiss}
        style={styles.closeButton}
      >
        <Icon
          name="close"
          size={18}
          color={typeStyle.textColor}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    margin: 10,
    marginTop: 40, // Ajuste para a barra de status
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: width - 20,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
}); 