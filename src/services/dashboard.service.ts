

import { dashboardRepository } from "@/repositories/dashboard.repository";
import type {
  BalanceMetric,
  DashboardFilters,
  DashboardResponse,
  ExpenseMetric,
  ExpensesByCategory,
  IncomeMetric,
  MonthlyComparison,
  MonthlyData,
  NextMonthPrediction,
  PercentageComparison,
} from "@/types/dashboard.types";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

class DashboardService {
  async getDashboard(
    userId: string,
    filters: DashboardFilters
  ): Promise<DashboardResponse> {
    const { currentMonth, currentYear, previousMonth, previousYear } =
      this.parsePeriod(filters.period);

    const currentStartDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
    const currentEndDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const previousStartDate = new Date(
      previousYear,
      previousMonth - 1,
      1,
      0,
      0,
      0,
      0
    );
    const previousEndDate = new Date(
      previousYear,
      previousMonth,
      0,
      23,
      59,
      59,
      999
    );

    const [
      currentPeriodSummary,
      previousPeriodSummary,
      monthlyAggregations,
      expensesByCategory,
      recurringTransactionsSummary,
    ] = await Promise.all([
      dashboardRepository.getPeriodSummary(
        userId,
        currentStartDate,
        currentEndDate
      ),
      dashboardRepository.getPeriodSummary(
        userId,
        previousStartDate,
        previousEndDate
      ),
      dashboardRepository.getMonthlyAggregations(userId, 6),
      dashboardRepository.getExpensesByCategory(
        userId,
        currentStartDate,
        currentEndDate
      ),
      dashboardRepository.getRecurringTransactionsSummary(userId),
    ]);

    const balance = this.calculateBalanceMetric(
      currentPeriodSummary,
      previousPeriodSummary
    );

    const income = this.calculateIncomeMetric(
      currentPeriodSummary.totalIncome,
      previousPeriodSummary.totalIncome
    );

    const expenses = this.calculateExpenseMetric(
      currentPeriodSummary.totalExpenses,
      previousPeriodSummary.totalExpenses
    );

    const monthlyComparison = this.formatMonthlyComparison(monthlyAggregations);

    const expensesByCategoryFormatted = this.formatExpensesByCategory(
      expensesByCategory,
      currentPeriodSummary.totalExpenses
    );

    const nextMonthPrediction = this.calculateNextMonthPrediction(
      recurringTransactionsSummary
    );

    return {
      balance,
      income,
      expenses,
      monthlyComparison,
      expensesByCategory: expensesByCategoryFormatted,
      nextMonthPrediction,
    };
  }

  private parsePeriod(period?: string): {
    currentMonth: number;
    currentYear: number;
    previousMonth: number;
    previousYear: number;
  } {
    let currentMonth: number;
    let currentYear: number;

    if (period) {
      currentMonth = Number.parseInt(period.substring(0, 2), 10);
      currentYear = Number.parseInt(period.substring(2), 10);
    } else {
      const now = new Date();
      currentMonth = now.getMonth() + 1;
      currentYear = now.getFullYear();
    }

    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear -= 1;
    }

    return {
      currentMonth,
      currentYear,
      previousMonth,
      previousYear,
    };
  }

  private calculatePercentageComparison(
    current: number,
    previous: number
  ): PercentageComparison {
    let percentageChange = 0;
    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (previous === 0 && current > 0) {
      percentageChange = 100;
      trend = 'up';
    } else if (previous > 0) {
      percentageChange = ((current - previous) / previous) * 100;

      if (percentageChange > 0.01) {
        trend = 'up';
      } else if (percentageChange < -0.01) {
        trend = 'down';
      }
    }

    return {
      current,
      previous,
      percentageChange: Number(percentageChange.toFixed(2)),
      trend,
    };
  }

  private calculateBalanceMetric(
    currentPeriod: { totalIncome: number; totalExpenses: number },
    previousPeriod: { totalIncome: number; totalExpenses: number }
  ): BalanceMetric {
    const currentBalance = currentPeriod.totalIncome - currentPeriod.totalExpenses;
    const previousBalance =
      previousPeriod.totalIncome - previousPeriod.totalExpenses;

    return {
      balance: currentBalance,
      comparison: this.calculatePercentageComparison(
        currentBalance,
        previousBalance
      ),
    };
  }

  private calculateIncomeMetric(
    currentIncome: number,
    previousIncome: number
  ): IncomeMetric {
    return {
      totalIncome: currentIncome,
      comparison: this.calculatePercentageComparison(
        currentIncome,
        previousIncome
      ),
    };
  }

  private calculateExpenseMetric(
    currentExpenses: number,
    previousExpenses: number
  ): ExpenseMetric {
    return {
      totalExpenses: currentExpenses,
      comparison: this.calculatePercentageComparison(
        currentExpenses,
        previousExpenses
      ),
    };
  }

  private formatMonthlyComparison(
    aggregations: Array<{ month: Date; income: number; expenses: number }>
  ): MonthlyComparison {
    const months: MonthlyData[] = aggregations.map((agg) => {
      const month = agg.month.getMonth() + 1;
      const year = agg.month.getFullYear();
      const monthName = monthNames[month - 1] || 'Unknown';

      return {
        month,
        year,
        label: `${monthName.substring(0, 3)} ${year}`,
        income: agg.income,
        expenses: agg.expenses,
      };
    });

    return { months };
  }

  private formatExpensesByCategory(
    categories: Array<{
      categoryId: string;
      categoryName: string;
      categoryColor: string;
      totalAmount: number;
    }>,
    totalExpenses: number
  ): ExpensesByCategory {
    const formattedCategories = categories.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      categoryColor: cat.categoryColor,
      amount: cat.totalAmount,
      percentage:
        totalExpenses > 0
          ? Number(((cat.totalAmount / totalExpenses) * 100).toFixed(2))
          : 0,
    }));

    return {
      categories: formattedCategories,
      totalExpenses,
    };
  }

  private calculateNextMonthPrediction(summary: {
    totalIncome: number;
    totalExpenses: number;
    incomeCount: number;
    expensesCount: number;
  }): NextMonthPrediction {
    const predictedBalance = summary.totalIncome - summary.totalExpenses;

    return {
      predictedExpenses: summary.totalExpenses,
      predictedIncome: summary.totalIncome,
      predictedBalance,
      recurringTransactionsCount: {
        income: summary.incomeCount,
        expenses: summary.expensesCount,
      },
    };
  }
}

export const dashboardService = new DashboardService();
