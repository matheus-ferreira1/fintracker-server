import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { transactions, categories } from '../db/schema.js';

export interface MonthlyData {
  income: string;
  expenses: string;
  savings: string;
  incomeChange: number;
  expensesChange: number;
  savingsChange: number;
}

export interface ChartDataPoint {
  month: string;
  income: string;
  expenses: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: string;
  percentage: number;
}

export class DashboardRepository {
  async getBalance(userId: string): Promise<{ total: string }> {
    const [incomeResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
      ));

    const [expensesResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
      ));

    const income = parseFloat(incomeResult?.total || '0');
    const expenses = parseFloat(expensesResult?.total || '0');
    const total = income - expenses;

    return { total: total.toFixed(4) };
  }

  async getMonthlyMetrics(userId: string): Promise<MonthlyData> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentIncome] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        gte(transactions.date, currentMonthStart),
        lte(transactions.date, currentMonthEnd),
      ));

    const [currentExpenses] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, currentMonthStart),
        lte(transactions.date, currentMonthEnd),
      ));

    const [prevIncome] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'income'),
        gte(transactions.date, prevMonthStart),
        lte(transactions.date, prevMonthEnd),
      ));

    const [prevExpenses] = await db
      .select({ total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, prevMonthStart),
        lte(transactions.date, prevMonthEnd),
      ));

    const currentIncomeNum = parseFloat(currentIncome?.total || '0');
    const currentExpensesNum = parseFloat(currentExpenses?.total || '0');
    const prevIncomeNum = parseFloat(prevIncome?.total || '0');
    const prevExpensesNum = parseFloat(prevExpenses?.total || '0');

    const currentSavings = currentIncomeNum - currentExpensesNum;
    const prevSavings = prevIncomeNum - prevExpensesNum;

    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      income: currentIncomeNum.toFixed(4),
      expenses: currentExpensesNum.toFixed(4),
      savings: currentSavings.toFixed(4),
      incomeChange: calculateChange(currentIncomeNum, prevIncomeNum),
      expensesChange: calculateChange(currentExpensesNum, prevExpensesNum),
      savingsChange: calculateChange(currentSavings, prevSavings),
    };
  }

  async getChartData(userId: string): Promise<ChartDataPoint[]> {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const results = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.date}, 'YYYY-MM')`,
        type: transactions.type,
        total: sql<string>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, sixMonthsAgo),
      ))
      .groupBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`, transactions.type)
      .orderBy(sql`TO_CHAR(${transactions.date}, 'YYYY-MM')`);

    const monthlyData = new Map<string, { income: string; expenses: string }>();

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, { income: '0', expenses: '0' });
    }

    for (const row of results) {
      const existing = monthlyData.get(row.month);
      if (existing) {
        if (row.type === 'income') {
          existing.income = row.total;
        } else {
          existing.expenses = row.total;
        }
      }
    }

    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
    }));
  }

  async getCategoryBreakdown(userId: string, type: 'income' | 'expense'): Promise<CategoryBreakdown[]> {
    const results = await db
      .select({
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        total: sql<string>`SUM(${transactions.amount})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, type),
      ))
      .groupBy(transactions.categoryId, categories.name, categories.color);

    const totalSum = results.reduce((sum, row) => sum + parseFloat(row.total), 0);

    return results.map(row => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName || 'Unknown',
      categoryColor: row.categoryColor || '#000000',
      total: row.total,
      percentage: totalSum > 0 ? (parseFloat(row.total) / totalSum) * 100 : 0,
    }));
  }

  async getRecentTransactions(userId: string, limit = 10) {
    return await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        description: transactions.description,
        type: transactions.type,
        date: transactions.date,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(limit);
  }
}
