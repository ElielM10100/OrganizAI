import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
  TextInputProps
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useFinance } from '../../contexts/FinanceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CATEGORY_ICONS } from '../../constants/categories';
import type { Category } from '../../types/finance';

export const CategoryManagementScreen: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useFinance();
  const { isDarkMode, theme } = useTheme();
  
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<string>(CATEGORY_ICONS[0]);
  const [categoryColor, setCategoryColor] = useState('#3498db');
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  
  // Ref para a animação
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Cores disponíveis
  const colors = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', 
    '#3498db', '#9b59b6', '#8e44ad', '#34495e', '#95a5a6',
    '#d35400', '#c0392b', '#16a085', '#27ae60', '#2980b9', 
    '#8e44ad', '#2c3e50', '#f39c12', '#7f8c8d', '#e84393'
  ];
  
  useEffect(() => {
    // Animação ao montar o componente
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const resetForm = () => {
    setCategoryName('');
    setCategoryIcon(CATEGORY_ICONS[0]);
    setCategoryColor('#3498db');
    setEditingCategory(null);
  };
  
  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };
  
  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon);
    setCategoryColor(category.color);
    setModalVisible(true);
  };
  
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a categoria');
      return;
    }
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryName,
          icon: categoryIcon,
          color: categoryColor,
        });
        Alert.alert('Sucesso', 'Categoria atualizada com sucesso!');
      } else {
        await addCategory({
          name: categoryName,
          type: selectedType,
          icon: categoryIcon,
          color: categoryColor,
        });
        Alert.alert('Sucesso', 'Categoria adicionada com sucesso!');
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert('Erro', `Falha ao ${editingCategory ? 'atualizar' : 'adicionar'} categoria`);
    }
  };
  
  const handleDeleteCategory = async (category: Category) => {
    if (category.isDefault) {
      Alert.alert('Operação não permitida', 'Categorias padrão não podem ser excluídas');
      return;
    }
    
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir a categoria "${category.name}"?`,
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
              await deleteCategory(category.id);
              Alert.alert('Sucesso', 'Categoria excluída com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir categoria:', error);
              Alert.alert('Erro', 'Falha ao excluir categoria');
            }
          },
        },
      ]
    );
  };
  
  const filteredCategories = categories.filter(category => category.type === selectedType);
  
  const renderCategoryItem = ({ item }: { item: Category }) => {
    return (
      <Animated.View 
        style={[
          styles.categoryItem, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.categoryItemContent}>
          <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
            <Icon name={item.icon} size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.categoryName, isDarkMode && styles.textLight]}>
            {item.name}
          </Text>
        </View>
        
        <View style={styles.categoryActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => openEditModal(item)}
            disabled={item.isDefault}
          >
            <FontAwesome5 
              name="edit" 
              size={18} 
              color={item.isDefault ? (isDarkMode ? '#555' : '#ccc') : (isDarkMode ? '#FFFFFF' : '#3498db')} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(item)}
            disabled={item.isDefault}
          >
            <FontAwesome5 
              name="trash" 
              size={18} 
              color={item.isDefault ? (isDarkMode ? '#555' : '#ccc') : '#e74c3c'} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  const renderColorPicker = () => (
    <Modal
      visible={colorPickerVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setColorPickerVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setColorPickerVisible(false)}
      >
        <View 
          style={[
            styles.colorPickerContainer,
            isDarkMode && styles.darkModeBackground
          ]}
        >
          <Text style={[styles.modalTitle, isDarkMode && styles.textLight]}>
            Escolha uma cor
          </Text>
          
          <FlatList
            data={colors}
            numColumns={5}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.colorOption,
                  { backgroundColor: item },
                  categoryColor === item && styles.selectedColorOption,
                ]}
                onPress={() => {
                  setCategoryColor(item);
                  setColorPickerVisible(false);
                }}
              />
            )}
            contentContainerStyle={styles.colorPickerGrid}
          />
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setColorPickerVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  
  const renderIconPicker = () => (
    <Modal
      visible={iconPickerVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIconPickerVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[
            styles.iconPickerContainer,
            isDarkMode && styles.darkModeBackground
          ]}
        >
          <Text style={[styles.modalTitle, isDarkMode && styles.textLight]}>
            Escolha um ícone
          </Text>
          
          <FlatList
            data={CATEGORY_ICONS}
            numColumns={5}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.iconOption,
                  categoryIcon === item && [styles.selectedIconOption, { borderColor: categoryColor }],
                ]}
                onPress={() => {
                  setCategoryIcon(item);
                  setIconPickerVisible(false);
                }}
              >
                <Icon name={item} size={24} color={isDarkMode ? "#FFFFFF" : "#333333"} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.iconPickerGrid}
          />
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setIconPickerVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'income' && styles.selectedTypeButton,
            selectedType === 'income' && { backgroundColor: isDarkMode ? '#2ecc71' : '#e8f8e8' },
          ]}
          onPress={() => setSelectedType('income')}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedType === 'income' && styles.selectedTypeButtonText,
              selectedType === 'income' && { color: isDarkMode ? '#FFFFFF' : '#2ecc71' },
              isDarkMode && styles.textLight,
            ]}
          >
            Receitas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'expense' && styles.selectedTypeButton,
            selectedType === 'expense' && { backgroundColor: isDarkMode ? '#e74c3c' : '#fceceb' },
          ]}
          onPress={() => setSelectedType('expense')}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedType === 'expense' && styles.selectedTypeButtonText,
              selectedType === 'expense' && { color: isDarkMode ? '#FFFFFF' : '#e74c3c' },
              isDarkMode && styles.textLight,
            ]}
          >
            Despesas
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
        {selectedType === 'income' ? 'Categorias de Receita' : 'Categorias de Despesa'}
      </Text>
      
      <FlatList
        data={filteredCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
      
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={openAddModal}
      >
        <FontAwesome5 name="plus" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Modal de Adicionar/Editar Categoria */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, isDarkMode && styles.darkModeBackground]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.textLight]}>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Text>
            
            {!editingCategory && (
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'income' && styles.selectedTypeButton,
                    selectedType === 'income' && { backgroundColor: isDarkMode ? '#2ecc71' : '#e8f8e8' },
                  ]}
                  onPress={() => setSelectedType('income')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'income' && styles.selectedTypeButtonText,
                      selectedType === 'income' && { color: isDarkMode ? '#FFFFFF' : '#2ecc71' },
                      isDarkMode && styles.textLight,
                    ]}
                  >
                    Receita
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'expense' && styles.selectedTypeButton,
                    selectedType === 'expense' && { backgroundColor: isDarkMode ? '#e74c3c' : '#fceceb' },
                  ]}
                  onPress={() => setSelectedType('expense')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === 'expense' && styles.selectedTypeButtonText,
                      selectedType === 'expense' && { color: isDarkMode ? '#FFFFFF' : '#e74c3c' },
                      isDarkMode && styles.textLight,
                    ]}
                  >
                    Despesa
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDarkMode && styles.textLight]}>Nome da Categoria</Text>
              <TextInput
                style={[styles.input, isDarkMode && styles.inputDark]}
                placeholder="Ex: Aluguel, Mercado, Presente..."
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                value={categoryName}
                onChangeText={setCategoryName}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, isDarkMode && styles.textLight]}>Ícone e Cor</Text>
              <View style={styles.iconColorContainer}>
                <TouchableOpacity
                  style={[styles.iconSelector, { backgroundColor: categoryColor }]}
                  onPress={() => setIconPickerVisible(true)}
                >
                  <Icon name={categoryIcon} size={28} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.colorSelector, { backgroundColor: categoryColor }]}
                  onPress={() => setColorPickerVisible(true)}
                >
                  <FontAwesome5 name="palette" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveCategory}
              >
                <Text style={styles.saveModalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {renderColorPicker()}
      {renderIconPicker()}
    </View>
  );
};

const { width } = Dimensions.get('window');

interface Styles {
  container: ViewStyle;
  containerDark: ViewStyle;
  textLight: TextStyle;
  sectionTitle: TextStyle;
  typeSelector: ViewStyle;
  typeButton: ViewStyle;
  selectedTypeButton: ViewStyle;
  typeButtonText: TextStyle;
  selectedTypeButtonText: TextStyle;
  categoriesList: ViewStyle;
  categoryItem: ViewStyle;
  categoryItemContent: ViewStyle;
  categoryIcon: ViewStyle;
  categoryName: TextStyle;
  categoryActions: ViewStyle;
  editButton: ViewStyle;
  deleteButton: ViewStyle;
  addButton: ViewStyle;
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  darkModeBackground: ViewStyle;
  modalTitle: TextStyle;
  formGroup: ViewStyle;
  label: TextStyle;
  input: TextStyle & ViewStyle;
  inputDark: TextStyle & ViewStyle;
  iconColorContainer: ViewStyle;
  iconSelector: ViewStyle;
  colorSelector: ViewStyle;
  modalButtons: ViewStyle;
  modalButton: ViewStyle;
  cancelModalButton: ViewStyle;
  saveModalButton: ViewStyle;
  cancelModalButtonText: TextStyle;
  saveModalButtonText: TextStyle;
  colorPickerContainer: ViewStyle;
  colorPickerGrid: ViewStyle;
  colorOption: ViewStyle;
  selectedColorOption: ViewStyle;
  iconPickerContainer: ViewStyle;
  iconPickerGrid: ViewStyle;
  iconOption: ViewStyle;
  selectedIconOption: ViewStyle;
  cancelButton: ViewStyle;
  cancelButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  textLight: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#E8F5E9',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: '#2ECC71',
    fontWeight: 'bold',
  },
  categoriesList: {
    paddingBottom: 80,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  darkModeBackground: {
    backgroundColor: '#242424',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#333',
    borderColor: '#444',
    color: '#FFFFFF',
  },
  iconColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSelector: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  colorSelector: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  saveModalButton: {
    backgroundColor: '#3498db',
    marginLeft: 8,
  },
  cancelModalButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  colorPickerContainer: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  colorPickerGrid: {
    paddingVertical: 8,
  },
  colorOption: {
    width: (width * 0.9 - 40) / 5 - 8,
    height: (width * 0.9 - 40) / 5 - 8,
    borderRadius: (width * 0.9 - 40) / 10 - 4,
    margin: 4,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconPickerContainer: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    maxHeight: width * 0.7, // Usamos width aqui para que o valor seja um número, não uma função
  },
  iconPickerGrid: {
    paddingVertical: 8,
  },
  iconOption: {
    width: (width * 0.9 - 40) / 5 - 8,
    height: (width * 0.9 - 40) / 5 - 8,
    borderRadius: 8,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  selectedIconOption: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
}); 