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

    // Fetch all active goals
    const goals = await prisma.goal.findMany({
      where: { userId, status: 'active' },
    });

    // Calculate real-time progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        let currentValue = goal.currentValue || goal.startValue || 0;

        if (goal.goalType === 'calories') {
          // Calculate today's calorie intake
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const mealLogs = await prisma.mealLog.findMany({
            where: {
              userId,
              date: {
                gte: today,
                lt: tomorrow,
              },
            },
          });

          let totalCalories = 0;
          mealLogs.forEach((log) => {
            const meals = JSON.parse(log.meals);
            meals.forEach((meal: any) => {
              totalCalories += meal.calories * (meal.quantity || 1);
            });
          });

          currentValue = totalCalories;
        } else if (goal.goalType === 'workouts') {
          // Calculate this week's workout count
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
          startOfWeek.setHours(0, 0, 0, 0);

          const exerciseLogs = await prisma.exerciseLog.findMany({
            where: {
              userId,
              date: {
                gte: startOfWeek,
              },
            },
          });

          currentValue = exerciseLogs.length;
        }
        // For weight goals, keep the manually set currentValue

        return {
          ...goal,
          currentValue,
        };
      })
    );

    return NextResponse.json({ success: true, goals: goalsWithProgress });
  } catch (error) {
    console.error('Get goals progress error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals progress' }, { status: 500 });
  }
}


