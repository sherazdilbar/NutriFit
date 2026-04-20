import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// DELETE - Remove a workout plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const planId = parseInt(params.id);

    // Verify the plan belongs to the user before deleting
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (plan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this plan' }, { status: 403 });
    }

    // Delete the plan
    await prisma.workoutPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json({
      success: true,
      message: 'Workout plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout plan' },
      { status: 500 }
    );
  }
}


