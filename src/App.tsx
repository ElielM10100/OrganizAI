import React from "react";
import { View, StyleSheet, Dimensions, Platform, TextStyle, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTheme, ThemeProvider } from "./contexts/ThemeContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import { HomeScreen } from "./screens/home/HomeScreen";
import { TransactionsScreen } from "./screens/transactions/TransactionsScreen";
import { BudgetScreen } from "./screens/budget/BudgetScreen";
import { ReportsScreen } from "./screens/reports/ReportsScreen";
import { ProfileScreen } from "./screens/profile/ProfileScreen";
import { GoalsScreen } from "./screens/goals/GoalsScreen";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { CategoryManagementScreen } from "./screens/category/CategoryManagementScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width } = Dimensions.get("window");

function TabNavigator() {
  const { isDarkMode, theme } = useTheme();

  const styles = StyleSheet.create({
    iconWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 52,
      height: 44,
      borderRadius: 16,
    },
    iconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 52,
      height: 44,
      zIndex: 1,
    },
    activeIconContainer: {
      transform: [{ translateY: -2 }],
    },
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: isDarkMode ? theme.colors.card : theme.colors.background,
          borderTopWidth: 0,
          elevation: 16,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: -3,
          },
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        headerStyle: {
          backgroundColor: isDarkMode ? theme.colors.card : theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;
            case "Transações":
              iconName = "exchange-alt";
              break;
            case "Orçamento":
              iconName = "wallet";
              break;
            case "Metas":
              iconName = "bullseye";
              break;
            case "Relatórios":
              iconName = "chart-bar";
              break;
            case "Categorias":
              iconName = "list-alt";
              break;
            case "Perfil":
              iconName = "user";
              break;
            default:
              iconName = "question";
          }

          return (
            <View style={styles.iconWrapper}>
              {focused && (
                <View
                  style={{
                    position: 'absolute',
                    backgroundColor: theme.colors.primary,
                    width: '100%',
                    height: '100%',
                    borderRadius: theme.borderRadius.lg,
                    opacity: 0.15,
                  }}
                />
              )}
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.activeIconContainer,
                ]}
              >
                <FontAwesome5 name={iconName} size={focused ? size + 2 : size} color={color} />
              </View>
            </View>
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary.light,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
          marginBottom: -2
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          headerShown: false
        }}
      />
      <Tab.Screen name="Transações" component={TransactionsScreen} />
      <Tab.Screen name="Orçamento" component={BudgetScreen} />
      <Tab.Screen name="Metas" component={GoalsScreen} />
      <Tab.Screen name="Relatórios" component={ReportsScreen} />
      <Tab.Screen name="Categorias" component={CategoryManagementScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigation() {
  const { isDarkMode } = useTheme();
  const { user, isLoading, hasOnboarded } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#7E57C2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
      />

      {user && hasOnboarded ? (
        <TabNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <FinanceProvider>
          <AppNavigation />
        </FinanceProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
