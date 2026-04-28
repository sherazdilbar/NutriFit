import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch user's meal logs
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId as number;
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    let where: any = { userId };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const logs = await prisma.mealLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });

    // Parse meals JSON
    const parsedLogs = logs.map(log => ({
      ...log,
      meals: log.meals ? JSON.parse(log.meals) : [],
    }));

    return NextResponse.json({ success: true, logs: parsedLogs });
  } catch (error) {
    console.error('Get meal logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new meal log
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId as number;
    const { date, meals } = await request.json();

    // Validation 1: Check meals array
    if (!meals || !Array.isArray(meals)) {
      return NextResponse.json({ error: 'Meals array is required' }, { status: 400 });
    }

    if (meals.length === 0) {
      return NextResponse.json({ error: 'At least one meal is required' }, { status: 400 });
    }

    // Validation 2: Check date is not in future
    const logDate = date ? new Date(date) : new Date();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (logDate > today) {
      return NextResponse.json({ error: 'Cannot log meals for future dates' }, { status: 400 });
    }

    // Validation 3: Check each meal has valid data and fetch categories
    const mealsWithCategories = [];
    for (const meal of meals) {
      if (!meal.name || typeof meal.name !== 'string') {
        return NextResponse.json({ error: 'Each meal must have a valid name' }, { status: 400 });
      }
      
      if (!meal.calories || typeof meal.calories !== 'number' || meal.calories <= 0) {
        return NextResponse.json({ error: 'Each meal must have valid calories (positive number)' }, { status: 400 });
      }

      if (meal.quantity && (typeof meal.quantity !== 'number' || meal.quantity <= 0)) {
        return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 });
      }

      // Fetch category from FoodItem if foodId is provided
      let category = meal.category || 'Other';
      if (meal.foodId) {
        const foodItem = await prisma.foodItem.findUnique({
          where: { id: meal.foodId },
          select: { category: true },
        });
        if (foodItem && foodItem.category) {
          category = foodItem.category;
        }
      }

      mealsWithCategories.push({
        ...meal,
        category,
      });
    }

    // Validation 4: Check for duplicate logging (same meals within 1 hour)
    const oneHourAgo = new Date(logDate);
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const oneHourLater = new Date(logDate);
    oneHourLater.setHours(oneHourLater.getHours() + 1);

    const recentLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        date: {
          gte: oneHourAgo,
          lte: oneHourLater,
        },
      },
    });

    if (recentLogs.length > 0) {
      const recentMeals = recentLogs.flatMap(log => JSON.parse(log.meals));
      const mealNames = meals.map(m => m.name.toLowerCase());
      const duplicates = recentMeals.filter((rm: any) => 
        mealNames.includes(rm.name.toLowerCase())
      );

      if (duplicates.length > 0) {
        return NextResponse.json({ 
          warning: true,
          message: `You logged similar meals recently: ${duplicates.map((d: any) => d.name).join(', ')}. Are you sure you want to log again?`,
          duplicates: duplicates.map((d: any) => d.name),
        }, { status: 200 });
      }
    }

    const log = await prisma.mealLog.create({
      data: {
        userId,
        date: logDate,
        meals: JSON.stringify(mealsWithCategories),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Meal logged successfully',
      log,
    });
  } catch (error) {
    console.error('Create meal log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



