import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Removendo a importação do uuid que estava causando o erro
// import { v4 as uuidv4 } from 'uuid';
import type { 
  Transaction, 
  Budget,
  Goal,
  Category,
  FinanceContextData,
  FinancialReport,
  ExportFormat,
  RecurrenceType,
} from '../types/finance';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { Platform, Share } from 'react-native';

// Função simples para gerar IDs únicos
const generateId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

const STORAGE_KEYS = {
  TRANSACTIONS: '@FinanceApp:transactions',
  BUDGETS: '@FinanceApp:budgets',
  CATEGORIES: '@FinanceApp:categories',
  GOALS: '@FinanceApp:goals',
};

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  // Verificar e criar transações recorrentes
  useEffect(() => {
    const checkRecurrentTransactions = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filtrar transações recorrentes
        const recurrentTransactions = transactions.filter(t => 
          t.isRecurrent && 
          !t.parentTransactionId && // Apenas as originais, não as geradas
          t.recurrenceType !== 'none'
        );
        
        // Transações que serão adicionadas
        const newTransactions: Omit<Transaction, 'id'>[] = [];
        
        // Verificar cada transação recorrente
        for (const transaction of recurrentTransactions) {
          const lastTransactionDate = new Date(transaction.date);
          let shouldCreateNew = false;
          let newTransactionDate = new Date();
          
          // Verificar se já existe uma transação gerada pela recorrência no período atual
          const existingGeneratedTransaction = transactions.find(t => 
            t.parentTransactionId === transaction.id &&
            isTransactionInCurrentPeriod(t.date, transaction.recurrenceType)
          );
          
          if (existingGeneratedTransaction) {
            continue; // Já existe uma transação para este período
          }
          
          // Calcular a próxima data com base no tipo de recorrência
          switch (transaction.recurrenceType) {
            case 'daily':
              // Verifica se já passou 1 dia desde a última transação
              shouldCreateNew = (today.getTime() - lastTransactionDate.getTime()) >= 86400000; // 1 dia em ms
              if (shouldCreateNew) {
                newTransactionDate = today;
              }
              break;
              
            case 'weekly':
              // Verifica se já passou 1 semana desde a última transação
              shouldCreateNew = (today.getTime() - lastTransactionDate.getTime()) >= 604800000; // 7 dias em ms
              if (shouldCreateNew) {
                newTransactionDate = today;
              }
              break;
              
            case 'monthly':
              // Verifica se estamos em um novo mês em relação à última transação
              shouldCreateNew = 
                (today.getMonth() > lastTransactionDate.getMonth() || 
                (today.getMonth() === 0 && lastTransactionDate.getMonth() === 11)) && 
                today.getDate() >= lastTransactionDate.getDate();
                
              if (shouldCreateNew) {
                // Usar o mesmo dia do mês
                newTransactionDate = new Date(today.getFullYear(), today.getMonth(), lastTransactionDate.getDate());
                
                // Ajustar para o último dia do mês se o mês não tiver o mesmo número de dias
                const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                if (lastTransactionDate.getDate() > lastDayOfMonth) {
                  newTransactionDate = new Date(today.getFullYear(), today.getMonth(), lastDayOfMonth);
                }
              }
              break;
              
            case 'yearly':
              // Verifica se estamos em um novo ano em relação à última transação e na mesma data
              shouldCreateNew = 
                today.getFullYear() > lastTransactionDate.getFullYear() && 
                today.getMonth() === lastTransactionDate.getMonth() && 
                today.getDate() >= lastTransactionDate.getDate();
                
              if (shouldCreateNew) {
                newTransactionDate = new Date(
                  today.getFullYear(), 
                  lastTransactionDate.getMonth(), 
                  lastTransactionDate.getDate()
                );
              }
              break;
          }
          
          // Verificar se chegou à data de fim da recorrência
          if (transaction.recurrenceEndDate) {
            const endDate = new Date(transaction.recurrenceEndDate);
            if (today > endDate) {
              shouldCreateNew = false;
            }
          }
          
          // Criar nova transação se for o caso
          if (shouldCreateNew) {
            newTransactions.push({
              type: transaction.type,
              amount: transaction.amount,
              categoryId: transaction.categoryId,
              description: transaction.description,
              date: newTransactionDate.toISOString(),
              isRecurrent: false, // Transações geradas não são recorrentes
              recurrenceType: 'none',
              parentTransactionId: transaction.id, // Referência à transação original
              tags: transaction.tags
            });
          }
        }
        
        // Adicionar as novas transações ao estado
        if (newTransactions.length > 0) {
          console.log(`Criando ${newTransactions.length} transações recorrentes`);
          
          const updatedTransactions = [...transactions];
          
          for (const newTransaction of newTransactions) {
            const transactionWithId = {
              ...newTransaction,
              id: generateId(),
            };
            updatedTransactions.push(transactionWithId);
          }
          
          // Salvar no AsyncStorage
          await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
          setTransactions(updatedTransactions);
        }
      } catch (error) {
        console.error('Erro ao processar transações recorrentes:', error);
      }
    };
    
    // Executar na inicialização e configurar intervalo diário
    checkRecurrentTransactions();
    
    // Configurar verificação diária
    const intervalId = setInterval(checkRecurrentTransactions, 1000 * 60 * 60 * 4); // A cada 4 horas
    
    return () => clearInterval(intervalId);
  }, [transactions]);

  // Função auxiliar para verificar se uma data está no período atual
  const isTransactionInCurrentPeriod = (dateString: string, recurrenceType: RecurrenceType): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Data em formato de timestamp
    const dateTime = date.getTime();
    const todayTime = today.getTime();
    
    switch (recurrenceType) {
      case 'daily':
        // Verifica se é de hoje
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
        
      case 'weekly':
        // Verifica se está na mesma semana
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Domingo da semana atual
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Sábado da semana atual
        
        return dateTime >= weekStart.getTime() && dateTime <= weekEnd.getTime();
        
      case 'monthly':
        // Verifica se está no mesmo mês
        return date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
        
      case 'yearly':
        // Verifica se está no mesmo ano
        return date.getFullYear() === today.getFullYear();
        
      default:
        return false;
    }
  };

  const loadStoredData = async () => {
    try {
      const [
        storedTransactions,
        storedBudgets,
        storedCategories,
        storedGoals,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGETS),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.GOALS),
      ]);

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }

      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }

      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        setCategories(parsedCategories);
      } else {
        // Inicializa com categorias padrão se não houver categorias salvas
        const defaultCategoriesWithIds = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          id: generateId(),
        }));
        setCategories(defaultCategoriesWithIds);
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategoriesWithIds));
      }

      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      console.log('Salvando transações:', newTransactions);
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
      await updateBudgetSpent(newTransactions);
      await updateGoalsProgress(newTransactions);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
      throw new Error('Falha ao salvar transações: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const saveBudgets = async (newBudgets: Budget[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(newBudgets));
      setBudgets(newBudgets);
    } catch (error) {
      console.error('Erro ao salvar orçamentos:', error);
      throw error;
    }
  };

  const saveCategories = async (newCategories: Category[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
      setCategories(newCategories);
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
      throw error;
    }
  };

  const saveGoals = async (newGoals: Goal[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error('Erro ao salvar metas:', error);
      throw error;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: generateId(),
    };
    const newCategories = [...categories, newCategory];
    await saveCategories(newCategories);
  };

  const updateCategory = async (category: Category) => {
    const newCategories = categories.map(c =>
      c.id === category.id ? category : c
    );
    await saveCategories(newCategories);
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category?.isDefault) {
      throw new Error('Não é possível excluir uma categoria padrão');
    }
    const newCategories = categories.filter(c => c.id !== id);
    await saveCategories(newCategories);
  };

  const updateBudgetSpent = useCallback(async (currentTransactions: Transaction[]) => {
    const newBudgets = budgets.map(budget => {
      const spent = currentTransactions
        .filter(t => 
          t.type === 'expense' && 
          t.categoryId === budget.categoryId &&
          isTransactionInBudgetPeriod(t.date, budget.period)
        )
        .reduce((total, t) => total + t.amount, 0);

      return { ...budget, spent };
    });

    await saveBudgets(newBudgets);
  }, [budgets]);

  const updateGoalsProgress = useCallback(async (currentTransactions: Transaction[]) => {
    const newGoals = goals.map(goal => {
      let currentAmount = goal.currentAmount;

      if (goal.type === 'savings') {
        const relevantTransactions = currentTransactions.filter(t => 
          new Date(t.date) >= new Date(goal.createdAt) &&
          new Date(t.date) <= new Date(goal.deadline)
        );

        currentAmount = relevantTransactions.reduce((total, t) => 
          total + (t.type === 'income' ? t.amount : -t.amount)
        , 0);
      } else if (goal.type === 'debt') {
        const payments = currentTransactions.filter(t => 
          t.type === 'expense' &&
          t.categoryId === goal.id &&
          new Date(t.date) >= new Date(goal.createdAt)
        );

        currentAmount = payments.reduce((total, t) => total + t.amount, 0);
      }

      return {
        ...goal,
        currentAmount,
        updatedAt: new Date().toISOString(),
      };
    });

    await saveGoals(newGoals);
  }, [goals]);

  const isTransactionInBudgetPeriod = (transactionDate: string, budgetPeriod: 'monthly' | 'yearly') => {
    const date = new Date(transactionDate);
    const now = new Date();

    if (budgetPeriod === 'monthly') {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return date.getFullYear() === now.getFullYear();
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      // Garantir que a transação tenha todas as propriedades necessárias
      const fullTransaction = {
        ...transaction,
        id: generateId(),
        isRecurrent: transaction.isRecurrent || false,
        recurrenceType: transaction.recurrenceType || 'none',
      };
      
      const newTransactions = [...transactions, fullTransaction];
      await saveTransactions(newTransactions);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw new Error('Falha ao adicionar transação: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    const newTransactions = transactions.map(t =>
      t.id === transaction.id ? transaction : t
    );
    await saveTransactions(newTransactions);
  };

  const deleteTransaction = async (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    await saveTransactions(newTransactions);
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget = {
      ...budget,
      id: generateId(),
      spent: 0,
    };

    const newBudgets = [...budgets, newBudget];
    await saveBudgets(newBudgets);
  };

  const updateBudget = async (budget: Budget) => {
    const newBudgets = budgets.map(b =>
      b.id === budget.id ? budget : b
    );
    await saveBudgets(newBudgets);
  };

  const deleteBudget = async (id: string) => {
    const newBudgets = budgets.filter(b => b.id !== id);
    await saveBudgets(newBudgets);
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newGoal = {
      ...goal,
      id: generateId(),
      currentAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    const newGoals = [...goals, newGoal];
    await saveGoals(newGoals);
  };

  const updateGoal = async (goal: Goal) => {
    const newGoals = goals.map(g =>
      g.id === goal.id ? { ...goal, updatedAt: new Date().toISOString() } : g
    );
    await saveGoals(newGoals);
  };

  const deleteGoal = async (id: string) => {
    const newGoals = goals.filter(g => g.id !== id);
    await saveGoals(newGoals);
  };

  const getMonthlyIncome = async () => {
    const now = new Date();
    return transactions
      .filter(t => 
        t.type === 'income' &&
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear()
      )
      .reduce((total, t) => total + t.amount, 0);
  };

  const getMonthlyExpenses = async () => {
    const now = new Date();
    return transactions.filter(t => 
      t.type === 'expense' &&
      new Date(t.date).getMonth() === now.getMonth() &&
      new Date(t.date).getFullYear() === now.getFullYear()
    );
  };

  const getSavingsRate = async () => {
    const monthlyIncome = await getMonthlyIncome();
    const monthlyExpenses = await getMonthlyExpenses();
    const totalExpenses = monthlyExpenses.reduce((total, t) => total + t.amount, 0);

    if (monthlyIncome === 0) return 0;
    return ((monthlyIncome - totalExpenses) / monthlyIncome) * 100;
  };

  const getFinancialReport = async (period: { start: string; end: string }): Promise<FinancialReport> => {
    const filteredTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= new Date(period.start) && date <= new Date(period.end);
    });

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);

    const categoryBreakdown = categories.map(category => {
      const categoryTransactions = filteredTransactions.filter(t => t.categoryId === category.id);
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = expenses > 0 ? (total / expenses) * 100 : 0;

      return {
        categoryId: category.id,
        total,
        percentage,
        transactions: categoryTransactions,
      };
    }).filter(breakdown => breakdown.total > 0);

    // Agrupa transações por dia para análise de tendências
    const trends = Array.from(new Set(
      filteredTransactions.map(t => t.date.split('T')[0])
    )).sort().map(date => {
      const dayTransactions = filteredTransactions.filter(t => 
        t.date.startsWith(date)
      );

      return {
        date,
        income: dayTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: dayTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
        balance: dayTransactions.reduce((sum, t) => 
          sum + (t.type === 'income' ? t.amount : -t.amount), 0
        ),
      };
    });

    // Calcula previsões para o próximo mês
    const predictions = await getPredictions();

    return {
      period,
      summary: {
        income,
        expenses,
        balance: income - expenses,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      },
      categoryBreakdown,
      trends,
      predictions,
    };
  };

  const getPredictions = async () => {
    // Implementação básica de previsões
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);

    const lastMonthReport = await getFinancialReport({
      start: lastMonthStart.toISOString(),
      end: lastMonthEnd.toISOString(),
    });

    // Sugere ajustes no orçamento com base nos gastos do mês anterior
    const suggestedBudgetAdjustments = lastMonthReport.categoryBreakdown
      .map(breakdown => {
        const category = categories.find(c => c.id === breakdown.categoryId);
        const budget = budgets.find(b => b.categoryId === breakdown.categoryId);

        if (!budget || !category) return null;

        const difference = breakdown.total - budget.amount;
        const percentageDiff = (difference / budget.amount) * 100;

        if (Math.abs(percentageDiff) < 10) return null;

        return {
          categoryId: breakdown.categoryId,
          currentBudget: budget.amount,
          suggestedBudget: breakdown.total,
          reason: percentageDiff > 0
            ? `Gastos ${percentageDiff.toFixed(0)}% acima do orçamento`
            : `Gastos ${Math.abs(percentageDiff).toFixed(0)}% abaixo do orçamento`,
        };
      })
      .filter((adjustment): adjustment is NonNullable<typeof adjustment> => adjustment !== null);

    return {
      nextMonth: {
        expectedIncome: lastMonthReport.summary.income,
        expectedExpenses: lastMonthReport.summary.expenses,
        suggestedBudgetAdjustments,
      },
    };
  };

  const getCategoryInsights = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    const categoryTransactions = transactions.filter(t => t.categoryId === categoryId);
    const averageSpending = categoryTransactions.length > 0
      ? categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length
      : 0;

    // Analisa tendência dos últimos 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentTransactions = categoryTransactions.filter(t => 
      new Date(t.date) >= threeMonthsAgo
    );

    const monthlyTotals = recentTransactions.reduce((acc, t) => {
      const month = new Date(t.date).getMonth();
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {} as Record<number, number>);

    const monthlyValues = Object.values(monthlyTotals);
    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (monthlyValues.length >= 2) {
      const firstMonth = monthlyValues[0];
      const lastMonth = monthlyValues[monthlyValues.length - 1];
      const percentageChange = ((lastMonth - firstMonth) / firstMonth) * 100;

      if (percentageChange > 10) {
        trend = 'up';
      } else if (percentageChange < -10) {
        trend = 'down';
      }
    }

    // Gera sugestões baseadas na análise
    const suggestions: string[] = [];
    const budget = budgets.find(b => b.categoryId === categoryId);

    if (budget) {
      if (trend === 'up') {
        suggestions.push(`Seus gastos com ${category.name} estão aumentando. Considere revisar seu orçamento.`);
      }
      if (budget.spent > budget.amount) {
        suggestions.push(`Você ultrapassou o orçamento de ${category.name}. Que tal estabelecer limites mais realistas?`);
      }
    }

    if (categoryTransactions.length > 0) {
      const recurrentValues = findRecurrentValues(categoryTransactions);
      if (recurrentValues.length > 0) {
        suggestions.push(`Detectamos gastos recorrentes. Considere marcar como transação recorrente.`);
      }
    }

    return {
      averageSpending,
      trend,
      suggestions,
    };
  };

  const findRecurrentValues = (transactions: Transaction[]): number[] => {
    const valueFrequency: Record<number, number> = {};
    transactions.forEach(t => {
      valueFrequency[t.amount] = (valueFrequency[t.amount] || 0) + 1;
    });

    return Object.entries(valueFrequency)
      .filter(([_, frequency]) => frequency >= 2)
      .map(([value]) => Number(value));
  };

  const exportData = async (format: ExportFormat, period?: { start: string; end: string }): Promise<string> => {
    try {
      // Filtrar transações por período, se fornecido
      let dataToExport = transactions;
      
      if (period) {
        dataToExport = transactions.filter(t => {
          const date = new Date(t.date);
          return date >= new Date(period.start) && date <= new Date(period.end);
        });
      }
      
      // Criar uma string com os dados
      let content = '';
      
      if (format === 'csv') {
        // Gerar cabeçalho do CSV
        content = 'ID,Tipo,Valor,Categoria,Descrição,Data\n';
        
        // Adicionar dados
        for (const transaction of dataToExport) {
          const category = categories.find(c => c.id === transaction.categoryId);
          const categoryName = category ? category.name : 'Categoria Desconhecida';
          const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          
          // Formatar os valores 
          const row = [
            transaction.id,
            type,
            transaction.amount.toString().replace('.', ','),
            categoryName,
            `"${transaction.description.replace(/"/g, '""')}"`,
            date
          ].join(',');
          
          content += row + '\n';
        }
      } else {
        // Formato PDF/HTML
        // Calcular totais
        const totalIncome = dataToExport
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = dataToExport
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpense;
        
        // Criar tabela de transações
        let tableRows = '';
        for (const transaction of dataToExport) {
          const category = categories.find(c => c.id === transaction.categoryId);
          const categoryName = category ? category.name : 'Categoria Desconhecida';
          const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          
          tableRows += `
            ${type} | R$ ${transaction.amount.toFixed(2).replace('.', ',')} | ${categoryName} | ${transaction.description} | ${date}\n
          `;
        }
        
        content = `
RELATÓRIO FINANCEIRO

RESUMO:
Receitas: R$ ${totalIncome.toFixed(2).replace('.', ',')}
Despesas: R$ ${totalExpense.toFixed(2).replace('.', ',')}
Saldo: R$ ${Math.abs(balance).toFixed(2).replace('.', ',')} ${balance >= 0 ? '' : '(negativo)'}

TRANSAÇÕES (${dataToExport.length}):
Tipo | Valor | Categoria | Descrição | Data
${tableRows}

Gerado em ${new Date().toLocaleDateString('pt-BR')}
        `;
      }
      
      // Compartilhar os dados em vez de salvar em arquivo
      await Share.share({
        title: `Relatório Financeiro (${format.toUpperCase()})`,
        message: content
      });
      
      return "Dados compartilhados com sucesso";
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw new Error('Falha ao exportar dados: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const importData = async (data: string): Promise<void> => {
    // TODO: Implementar importação de dados
    throw new Error('Função ainda não implementada');
  };

  const balance = transactions.reduce((total, t) => {
    return total + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  return (
    <FinanceContext.Provider
      value={{
        balance,
        transactions,
        categories,
        budgets,
        goals,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        getMonthlyIncome,
        getMonthlyExpenses,
        getSavingsRate,
        getFinancialReport,
        getPredictions,
        exportData,
        importData,
        getCategoryInsights,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }

  return context;
}; 