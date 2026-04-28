import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let where: any = {};

    if (search) {
      // SQLite doesn't support case-insensitive mode, so we'll filter in JS
      // Just search by contains for now
      where.name = {
        contains: search,
      };
    }

    const foods = await prisma.foodItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Parse JSON allergens
    const foodsWithAllergens = foods.map(food => ({
      ...food,
      allergens: food.allergens ? JSON.parse(food.allergens) : [],
    }));

    // Group by category if no search
    if (!search) {
      const grouped = foodsWithAllergens.reduce((acc: any, food) => {
        const cat = food.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(food);
        return acc;
      }, {});

      return NextResponse.json({ success: true, grouped });
    }

    return NextResponse.json({ success: true, foods: foodsWithAllergens });
  } catch (error) {
    console.error('Get foods error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch foods' },
      { status: 500 }
    );
  }
}


