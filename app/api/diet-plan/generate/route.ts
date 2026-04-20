import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';
import { generateDietPlan } from '@/lib/planGenerator';
import { calculateDailyCalories } from '@/lib/safetyCheck';

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
    const { days = 7, goal = 'maintain' } = await request.json();

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

    // Calculate target calories
    const targetCalories = calculateDailyCalories(
      profile.age || 30,
      profile.weight || 70,
      profile.height || 170,
      'male', // Default, could be added to profile
      goal as 'lose' | 'maintain' | 'gain'
    );

    // Get all foods
    const foods = await prisma.foodItem.findMany();
    
    // Parse allergens
    const foodsWithAllergens = foods.map(food => ({
      ...food,
      allergens: food.allergens ? JSON.parse(food.allergens) : [],
    }));

    // Parse diseases and allergens from JSON
    const diseases = profile.diseases ? JSON.parse(profile.diseases) : [];
    const allergens = profile.allergens ? JSON.parse(profile.allergens) : [];

    // Generate diet plan
    const { plan, metadata } = generateDietPlan(
      foodsWithAllergens,
      {
        age: profile.age || undefined,
        weight: profile.weight || undefined,
        diseases,
        allergens,
      },
      targetCalories,
      days
    );

    // Save diet plan to database
    const savedPlan = await prisma.dietPlan.create({
      data: {
        userId,
        meals: JSON.stringify({ plan, metadata, goal }),
        calories: targetCalories,
      },
    });

    return NextResponse.json({
      success: true,
      plan,
      metadata,
      planId: savedPlan.id,
      message: 'Diet plan generated successfully',
    });
  } catch (error) {
    console.error('Generate diet plan error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diet plan' },
      { status: 500 }
    );
  }
}

