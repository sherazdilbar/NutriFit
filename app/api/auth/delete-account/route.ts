import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/auth';
import prisma from '@/lib/db';

export async function DELETE(request: NextRequest) {
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
    const { password } = await request.json();

    // Validation
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete account' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Delete all user data (cascade delete)
    await prisma.$transaction([
      // Delete health profile
      prisma.healthProfile.deleteMany({ where: { userId } }),
      // Delete goals
      prisma.goal.deleteMany({ where: { userId } }),
      // Delete meal logs
      prisma.mealLog.deleteMany({ where: { userId } }),
      // Delete exercise logs
      prisma.exerciseLog.deleteMany({ where: { userId } }),
      // Delete diet plans
      prisma.dietPlan.deleteMany({ where: { userId } }),
      // Delete workout plans
      prisma.workoutPlan.deleteMany({ where: { userId } }),
      // Delete water intake
      prisma.waterIntake.deleteMany({ where: { userId } }),
      // Delete favorites
      prisma.favorite.deleteMany({ where: { userId } }),
      // Finally delete user
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
