import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// DELETE - Remove a meal log
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
    const logId = parseInt(params.id);

    // Verify the log belongs to the user before deleting
    const log = await prisma.mealLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    if (log.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this log' }, { status: 403 });
    }

    // Delete the log
    await prisma.mealLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({
      success: true,
      message: 'Meal log deleted successfully',
    });
  } catch (error) {
    console.error('Delete meal log error:', error);
    return NextResponse.json(
      { error: 'Failed to delete meal log' },
      { status: 500 }
    );
  }
}


