import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch both logs in parallel for better performance
    const [mealLogs, exerciseLogs] = await Promise.all([
      prisma.mealLog.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
        select: {
          date: true,
          meals: true,
        },
      }),
      prisma.exerciseLog.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
        select: {
          date: true,
          exercises: true,
        },
      }),
    ]);

    // Process data for charts
    const dailyCalories: { date: string; calories: number }[] = [];
    const dailyWorkouts: { date: string; count: number }[] = [];
    const foodCategories: { [key: string]: number } = {};

    // Group meals by date
    const mealsByDate: { [key: string]: any[] } = {};
    mealLogs.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      if (!mealsByDate[dateStr]) mealsByDate[dateStr] = [];
      const meals = JSON.parse(log.meals);
      mealsByDate[dateStr].push(...meals);
    });

    // Calculate daily calories
    Object.entries(mealsByDate).forEach(([date, meals]) => {
      const totalCalories = meals.reduce(
        (sum, meal) => sum + (meal.calories * (meal.quantity || 1)),
        0
      );
      dailyCalories.push({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: totalCalories,
      });

      // Count food categories
      meals.forEach((meal) => {
        const category = meal.category || 'Other';
        foodCategories[category] = (foodCategories[category] || 0) + 1;
      });
    });

    // Group exercises by date
    const exercisesByDate: { [key: string]: any[] } = {};
    exerciseLogs.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      if (!exercisesByDate[dateStr]) exercisesByDate[dateStr] = [];
      exercisesByDate[dateStr].push(log);
    });

    // Calculate daily workout counts
    Object.entries(exercisesByDate).forEach(([date, logs]) => {
      dailyWorkouts.push({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: logs.length,
      });
    });

    // Fill in missing dates with 0 values
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dailyCalories.find(d => d.date === dateStr)) {
        dailyCalories.push({ date: dateStr, calories: 0 });
      }
      if (!dailyWorkouts.find(d => d.date === dateStr)) {
        dailyWorkouts.push({ date: dateStr, count: 0 });
      }
    }

    // Sort by date
    dailyCalories.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    dailyWorkouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Convert food categories to array for pie chart
    const foodCategoryData = Object.entries(foodCategories).map(([name, value]) => ({
      name,
      value,
    }));

    // Calculate summary stats
    const totalMeals = mealLogs.length;
    const totalWorkouts = exerciseLogs.length;
    const avgCalories = dailyCalories.length > 0
      ? Math.round(dailyCalories.reduce((sum, d) => sum + d.calories, 0) / dailyCalories.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        dailyCalories,
        dailyWorkouts,
        foodCategories: foodCategoryData,
        summary: {
          totalMeals,
          totalWorkouts,
          avgCalories,
          daysTracked: days,
        },
      },
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress stats' }, { status: 500 });
  }
}


