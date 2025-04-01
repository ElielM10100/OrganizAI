/**
 * Tipos relacionados às funcionalidades financeiras
 */

/**
 * Tipo de transação: entrada ou saída
 */
export type TransactionType = 'income' | 'expense';

/**
 * Status de uma transação
 */
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

/**
 * Tipo de recorrência para transações
 */
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none';

/**
 * Tipo de meta financeira
 */
export type GoalType = 'savings' | 'debt' | 'investment' | 'purchase';

/**
 * Formato de exportação de dados
 */
export type ExportFormat = 'csv' | 'pdf';

/**
 * Interface para representar uma categoria
 */
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault?: boolean;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para representar uma transação financeira
 */
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  categoryId: string;
  type: TransactionType;
  status: TransactionStatus;
  isRecurrent?: boolean;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
  parentTransactionId?: string;
  tags?: string[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // a cada X dias, semanas, meses ou anos
    endDate?: string; // data final da recorrência, se houver
  };
  notes?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  coordinates?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para representar um orçamento
 */
export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  categoryId?: string;
  month: number;
  year: number;
  period: 'monthly' | 'yearly';
  notes?: string;
  rollover: boolean;
  previousRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para representar uma meta financeira
 */
export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  description?: string;
  categoryId?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  color?: string;
  notes?: string;
  contributions?: {
    id: string;
    amount: number;
    date: string;
    source?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para o contexto de finanças
 */
export interface FinanceContextData {
  balance: number;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  
  // Métodos para transações
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactions: (filters?: TransactionFilters) => Promise<Transaction[]>;
  
  // Métodos para categorias
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Métodos para orçamentos
  addBudget: (budget: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Métodos para metas
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'isCompleted' | 'createdAt' | 'updatedAt'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number, source?: string) => Promise<Goal>;
  
  // Métodos para análises
  getMonthlyIncome: (month?: number, year?: number) => Promise<number>;
  getMonthlyExpenses: (month?: number, year?: number) => Promise<Transaction[]>;
  getSavingsRate: (month?: number, year?: number) => Promise<number>;
  getCategoryBreakdown: (type: TransactionType, period?: DateRange) => Promise<CategoryBreakdown[]>;
  getFinancialReport: (period?: DateRange) => Promise<FinancialReport>;
  getCategoryInsights: (categoryId: string) => Promise<CategoryInsight>;
  
  // Métodos para exportação
  exportData: (format: ExportFormat, dateRange: DateRange) => Promise<void>;
}

/**
 * Interface para filtros de transações
 */
export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  categoryId?: string;
  dateRange?: DateRange;
  searchTerm?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
}

/**
 * Interface para representar um período de tempo
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Interface para o breakdown de categorias
 */
export interface CategoryBreakdown {
  category: Category;
  amount: number;
  percentage: number;
  transactions: Transaction[];
}

/**
 * Interface para relatório financeiro
 */
export interface FinancialReport {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  largestExpenseCategory?: {
    category: Category;
    amount: number;
  };
  largestIncomeSource?: {
    category: Category;
    amount: number;
  };
  monthlyComparison: {
    month: number;
    year: number;
    income: number;
    expenses: number;
    netIncome: number;
  }[];
}

/**
 * Interface para insights de categoria
 */
export interface CategoryInsight {
  trend: 'up' | 'down' | 'stable';
  averageMonthlySpend: number;
  previousMonthComparison: number; // percentual em relação ao mês anterior
  suggestions: string[];
} 