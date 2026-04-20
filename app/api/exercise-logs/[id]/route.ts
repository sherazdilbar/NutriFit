import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// DELETE - Remove an exercise log
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
    const log = await prisma.exerciseLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    if (log.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this log' }, { status: 403 });
    }

    // Delete the log
    await prisma.exerciseLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({
      success: true,
      message: 'Exercise log deleted successfully',
    });
  } catch (error) {
    console.error('Delete exercise log error:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise log' },
      { status: 500 }
    );
  }
}


