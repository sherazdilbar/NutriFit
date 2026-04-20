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

    // Calculate date range for this week (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Fetch meal logs for the week
    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Fetch exercise logs for the week
    const exerciseLogs = await prisma.exerciseLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate total meals
    const totalMeals = mealLogs.length;

    // Calculate total workouts
    const totalWorkouts = exerciseLogs.length;

    // Calculate average daily calories
    let totalCalories = 0;
    const daysWithMeals = new Set<string>();

    mealLogs.forEach((log) => {
      const meals = JSON.parse(log.meals);
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      daysWithMeals.add(dateStr);
      
      meals.forEach((meal: any) => {
        totalCalories += meal.calories * (meal.quantity || 1);
      });
    });

    const avgCalories = daysWithMeals.size > 0 
      ? Math.round(totalCalories / daysWithMeals.size) 
      : 0;

    // Calculate active days (days with either meal or exercise log)
    const activeDaysSet = new Set<string>();
    mealLogs.forEach(log => {
      activeDaysSet.add(new Date(log.date).toISOString().split('T')[0]);
    });
    exerciseLogs.forEach(log => {
      activeDaysSet.add(new Date(log.date).toISOString().split('T')[0]);
    });

    const summary = {
      totalMeals,
      totalWorkouts,
      avgCalories,
      activeDays: activeDaysSet.size,
      weekStart: startDate.toISOString().split('T')[0],
      weekEnd: endDate.toISOString().split('T')[0],
    };

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Get weekly summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly summary' }, { status: 500 });
  }
}
