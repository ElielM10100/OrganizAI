import React, { createContext, useContext, useState, useCallback } from 'react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
}

interface FinancialContextData {
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  deleteBudget: (id: string) => void;
}

const FinancialContext = createContext<FinancialContextData>({} as FinancialContextData);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [...prev, newTransaction]);
  }, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    const newBudget = {
      ...budget,
      id: Math.random().toString(36).substr(2, 9),
    };
    setBudgets(prev => [...prev, newBudget]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        budgets,
        addTransaction,
        addBudget,
        deleteTransaction,
        deleteBudget,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}; 