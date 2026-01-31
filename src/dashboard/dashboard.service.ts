import { DashboardRepository } from './dashboard.repository.js';

export class DashboardService {
  constructor(private repository: DashboardRepository) {}

  async getDashboard(userId: string) {
    const [
      balance,
      monthly,
      chart,
      incomeBreakdown,
      expensesBreakdown,
      recentTransactions,
    ] = await Promise.all([
      this.repository.getBalance(userId),
      this.repository.getMonthlyMetrics(userId),
      this.repository.getChartData(userId),
      this.repository.getCategoryBreakdown(userId, 'income'),
      this.repository.getCategoryBreakdown(userId, 'expense'),
      this.repository.getRecentTransactions(userId, 10),
    ]);

    return {
      balance,
      monthly: {
        income: monthly.income,
        expenses: monthly.expenses,
        savings: monthly.savings,
        incomeChange: Number(monthly.incomeChange.toFixed(2)),
        expensesChange: Number(monthly.expensesChange.toFixed(2)),
        savingsChange: Number(monthly.savingsChange.toFixed(2)),
      },
      chart: {
        last6Months: chart,
      },
      breakdown: {
        incomeByCategory: incomeBreakdown.map(item => ({
          ...item,
          percentage: Number(item.percentage.toFixed(2)),
        })),
        expensesByCategory: expensesBreakdown.map(item => ({
          ...item,
          percentage: Number(item.percentage.toFixed(2)),
        })),
      },
      recentTransactions,
    };
  }
}
