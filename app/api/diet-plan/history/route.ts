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

    // Get all diet plans for user
    const plans = await prisma.dietPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse the meals JSON
    const parsedPlans = plans.map(plan => {
      const data = plan.meals ? JSON.parse(plan.meals) : { plan: [], metadata: {} };
      return {
        id: plan.id,
        createdAt: plan.createdAt,
        calories: plan.calories,
        ...data,
      };
    });

    return NextResponse.json({
      success: true,
      plans: parsedPlans,
    });
  } catch (error) {
    console.error('Get diet plan history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan history' },
      { status: 500 }
    );
  }
}


