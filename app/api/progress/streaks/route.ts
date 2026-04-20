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

    // Calculate meal logging streak
    const mealStreak = await calculateStreak(userId, 'meal');
    
    // Calculate exercise streak
    const exerciseStreak = await calculateStreak(userId, 'exercise');

    return NextResponse.json({ 
      success: true, 
      streaks: {
        meal: mealStreak,
        exercise: exerciseStreak,
      }
    });
  } catch (error) {
    console.error('Get streaks error:', error);
    return NextResponse.json({ error: 'Failed to fetch streaks' }, { status: 500 });
  }
}

async function calculateStreak(userId: number, type: 'meal' | 'exercise'): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);

  // Check backwards from today
  for (let i = 0; i < 365; i++) { // Max 365 days
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    let hasLog = false;

    if (type === 'meal') {
      const logs = await prisma.mealLog.findFirst({
        where: {
          userId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });
      hasLog = !!logs;
    } else {
      const logs = await prisma.exerciseLog.findFirst({
        where: {
          userId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });
      hasLog = !!logs;
    }

    if (hasLog) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If it's the first day (today) and no log, streak is 0
      // If it's not the first day, break the loop
      if (i === 0) {
        // Check yesterday to see if streak continues
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}
