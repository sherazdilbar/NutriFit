import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch today's water intake
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
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let intake = await prisma.waterIntake.findFirst({
      where: {
        userId,
        date: {
          gte: today,
        },
      },
    });

    // If no record for today, create one
    if (!intake) {
      intake = await prisma.waterIntake.create({
        data: {
          userId,
          date: today,
          glasses: 0,
          goal: 8,
        },
      });
    }

    return NextResponse.json({ success: true, intake });
  } catch (error) {
    console.error('Get water intake error:', error);
    return NextResponse.json({ error: 'Failed to fetch water intake' }, { status: 500 });
  }
}

// POST - Update water intake (add or subtract glasses)
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
    const { action } = await request.json(); // 'add' or 'subtract'

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let intake = await prisma.waterIntake.findFirst({
      where: {
        userId,
        date: {
          gte: today,
        },
      },
    });

    if (!intake) {
      // Create new record
      intake = await prisma.waterIntake.create({
        data: {
          userId,
          date: today,
          glasses: action === 'add' ? 1 : 0,
          goal: 8,
        },
      });
    } else {
      // Update existing record
      const newGlasses = action === 'add' 
        ? intake.glasses + 1 
        : Math.max(0, intake.glasses - 1);

      intake = await prisma.waterIntake.update({
        where: { id: intake.id },
        data: { glasses: newGlasses },
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: action === 'add' ? 'Glass added!' : 'Glass removed',
      intake 
    });
  } catch (error) {
    console.error('Update water intake error:', error);
    return NextResponse.json({ error: 'Failed to update water intake' }, { status: 500 });
  }
}
