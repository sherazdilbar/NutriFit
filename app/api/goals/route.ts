import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch user's goals
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

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, goals });
  } catch (error) {
    console.error('Get goals error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST - Create a new goal
export async function POST(request: NextRequest) {
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
    const { goalType, targetValue, startValue, deadline } = await request.json();

    // Validation
    if (!goalType || !targetValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['weight', 'calories', 'workouts'].includes(goalType)) {
      return NextResponse.json({ error: 'Invalid goal type' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        goalType,
        targetValue: Number(targetValue),
        currentValue: startValue ? Number(startValue) : null,
        startValue: startValue ? Number(startValue) : null,
        deadline: deadline ? new Date(deadline) : null,
        status: 'active',
      },
    });

    return NextResponse.json({ success: true, goal });
  } catch (error) {
    console.error('Create goal error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// PUT - Update goal progress
export async function PUT(request: NextRequest) {
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
    const { goalId, currentValue, status } = await request.json();

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentValue: currentValue !== undefined ? Number(currentValue) : undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, goal: updatedGoal });
  } catch (error) {
    console.error('Update goal error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}


