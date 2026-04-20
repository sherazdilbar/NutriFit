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
    const reminders: Array<{ type: string; message: string; priority: string }> = [];

    // Check if user logged meal today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMealLog = await prisma.mealLog.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!todayMealLog) {
      reminders.push({
        type: 'meal',
        message: "You haven't logged any meals today. Track your nutrition!",
        priority: 'high',
      });
    }

    // Check if user logged exercise in last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentExercise = await prisma.exerciseLog.findFirst({
      where: {
        userId,
        date: {
          gte: threeDaysAgo,
        },
      },
    });

    if (!recentExercise) {
      reminders.push({
        type: 'exercise',
        message: "It's been 3+ days since your last workout. Time to get moving!",
        priority: 'medium',
      });
    }

    // Check water intake today
    const todayWater = await prisma.waterIntake.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (!todayWater || todayWater.glasses < todayWater.goal) {
      const remaining = todayWater ? todayWater.goal - todayWater.glasses : 8;
      reminders.push({
        type: 'water',
        message: `Don't forget to drink water! ${remaining} glasses remaining today.`,
        priority: 'low',
      });
    }

    // Check active goals progress
    const goals = await prisma.goal.findMany({
      where: {
        userId,
        status: 'active',
      },
    });

    for (const goal of goals) {
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7 && daysLeft > 0) {
          const progress = goal.currentValue && goal.targetValue 
            ? Math.round((goal.currentValue / goal.targetValue) * 100)
            : 0;
          
          if (progress < 50) {
            reminders.push({
              type: 'goal',
              message: `Your ${goal.goalType} goal deadline is in ${daysLeft} days. You're at ${progress}% progress.`,
              priority: 'high',
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      reminders,
      count: reminders.length,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}
