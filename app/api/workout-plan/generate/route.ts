import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';
import { generateWorkoutPlan } from '@/lib/planGenerator';

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
    const { days = 7, focusArea = 'balanced' } = await request.json();

    // Get user's health profile
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Please create your health profile first' },
        { status: 400 }
      );
    }

    // Get all exercises
    const exercises = await prisma.exerciseItem.findMany();

    // Parse diseases from JSON
    const diseases = profile.diseases ? JSON.parse(profile.diseases) : [];

    // Generate workout plan
    const { plan, metadata } = generateWorkoutPlan(
      exercises,
      {
        age: profile.age || undefined,
        weight: profile.weight || undefined,
        diseases,
      },
      days,
      focusArea as 'cardio' | 'strength' | 'balanced' | 'flexibility'
    );

    // Save workout plan to database
    const savedPlan = await prisma.workoutPlan.create({
      data: {
        userId,
        exercises: JSON.stringify({ plan, metadata, focusArea }),
        intensity: focusArea,
      },
    });

    return NextResponse.json({
      success: true,
      plan,
      metadata,
      planId: savedPlan.id,
      message: 'Workout plan generated successfully',
    });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    );
  }
}

