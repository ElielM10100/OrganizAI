import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
  Share,
  Platform,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { theme as appTheme } from '../../styles/theme';
import { useFinance } from '../../contexts/FinanceContext';
import { ExportFormat, DateRange } from '../../types/finance';

export const ProfileScreen = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const { exportData } = useFinance();
  
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const theme = isDarkMode ? {
    colors: {
      background: appTheme.colors.background.dark,
      card: appTheme.colors.card.dark,
      text: appTheme.colors.text.dark,
      textSecondary: appTheme.colors.textSecondary.dark,
      primary: appTheme.colors.primary,
    }
  } : {
    colors: {
      background: appTheme.colors.background.light,
      card: appTheme.colors.card.light,
      text: appTheme.colors.text.light,
      textSecondary: appTheme.colors.textSecondary.light,
      primary: appTheme.colors.primary,
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      
      // Definir período - últimos 6 meses
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      const dateRange: DateRange = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      
      await exportData(format, dateRange);
      
      setShowExportModal(false);
      
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      Alert.alert(
        'Erro na exportação',
        `Não foi possível exportar seus dados. Erro: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Formatar a data em formato legível
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
      marginTop: 20,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: appTheme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    email: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 15,
    },
    createdAt: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      ...appTheme.shadows.small,
    },
    menuText: {
      marginLeft: 15,
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      ...appTheme.shadows.small,
    },
    themeText: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoutButton: {
      backgroundColor: '#F44336',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    logoutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 15,
      marginTop: 20,
    },
    // Estilos para o modal de exportação
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: theme.colors.background,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      ...appTheme.shadows.large,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      width: '100%',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      ...appTheme.shadows.small,
    },
    optionIcon: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      marginRight: 15,
    },
    csvIcon: {
      backgroundColor: '#43A047',
    },
    pdfIcon: {
      backgroundColor: '#E53935',
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    optionDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    cancelButton: {
      padding: 10,
      marginTop: 10,
    },
    cancelText: {
      fontSize: 16,
      color: appTheme.colors.primary,
      fontWeight: '500',
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.text,
      marginTop: 10,
    },
  });

  const renderExportModal = () => {
    return (
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {isExporting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={appTheme.colors.primary} />
                <Text style={styles.loadingText}>Exportando seus dados...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>Exportar Dados</Text>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => handleExport('csv')}
                >
                  <View style={[styles.optionIcon, styles.csvIcon]}>
                    <FontAwesome5 name="file-csv" size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.optionText}>Exportar como CSV</Text>
                    <Text style={styles.optionDescription}>
                      Ideal para importar em Excel ou outras planilhas
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => handleExport('pdf')}
                >
                  <View style={[styles.optionIcon, styles.pdfIcon]}>
                    <FontAwesome5 name="file-pdf" size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.optionText}>Exportar como PDF</Text>
                    <Text style={styles.optionDescription}>
                      Relatório completo formatado e pronto para imprimir
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowExportModal(false)}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <FontAwesome5
            name="user"
            size={40}
            color="#FFFFFF"
          />
        </View>
        <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}
        {user?.createdAt && (
          <Text style={styles.createdAt}>
            Conta criada em {formatDate(user.createdAt)}
          </Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Configurações</Text>

      <TouchableOpacity style={styles.themeToggle}>
        <View style={styles.themeText}>
          <FontAwesome5
            name={isDarkMode ? 'moon' : 'sun'}
            size={20}
            color={appTheme.colors.primary}
          />
          <Text style={styles.menuText}>
            {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{
            false: '#D1D5DB',
            true: `${appTheme.colors.primary}80`
          }}
          thumbColor={isDarkMode ? appTheme.colors.primary : '#F9FAFB'}
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => setShowExportModal(true)}
      >
        <FontAwesome5
          name="file-export"
          size={20}
          color={appTheme.colors.primary}
        />
        <Text style={styles.menuText}>Exportar Dados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <FontAwesome5
          name="bell"
          size={20}
          color={appTheme.colors.primary}
        />
        <Text style={styles.menuText}>Notificações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <FontAwesome5
          name="shield-alt"
          size={20}
          color={appTheme.colors.primary}
        />
        <Text style={styles.menuText}>Privacidade e Segurança</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <FontAwesome5
          name="question-circle"
          size={20}
          color={appTheme.colors.primary}
        />
        <Text style={styles.menuText}>Ajuda e Suporte</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <FontAwesome5
          name="info-circle"
          size={20}
          color={appTheme.colors.primary}
        />
        <Text style={styles.menuText}>Sobre o Aplicativo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome5
          name="sign-out-alt"
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      {renderExportModal()}
    </ScrollView>
  );
}; 