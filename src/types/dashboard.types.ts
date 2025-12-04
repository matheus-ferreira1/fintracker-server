
export interface PercentageComparison {
  current: number;
  previous: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}


export interface BalanceMetric {
  balance: number;
  comparison: PercentageComparison;
}

export interface IncomeMetric {
  totalIncome: number;
  comparison: PercentageComparison;
}

export interface ExpenseMetric {
  totalExpenses: number;
  comparison: PercentageComparison;
}

export interface MonthlyData {
  month: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
}

export interface MonthlyComparison {
  months: MonthlyData[];
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface ExpensesByCategory {
  categories: CategoryExpense[];
  totalExpenses: number;
}

export interface NextMonthPrediction {
  predictedExpenses: number;
  predictedIncome: number;
  predictedBalance: number;
  recurringTransactionsCount: {
    income: number;
    expenses: number;
  };
}

export interface DashboardResponse {
  balance: BalanceMetric;
  income: IncomeMetric;
  expenses: ExpenseMetric;
  monthlyComparison: MonthlyComparison;
  expensesByCategory: ExpensesByCategory;
  nextMonthPrediction: NextMonthPrediction;
}

export interface DashboardFilters {
  period?: string; 
}

export interface MonthlyAggregation {
  month: Date;
  income: number;
  expenses: number;
}

export interface CategoryAggregation {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
}

export interface RecurringTransactionsSummary {
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expensesCount: number;
}

export interface PeriodSummary {
  totalIncome: number;
  totalExpenses: number;
}
