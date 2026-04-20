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
        // Extract category from food name or default to 'Other'
        let cat = 'Other';
        
        // Simple categorization based on existing data
        const name = food.name.toLowerCase();
        if (['apple', 'banana', 'orange', 'strawberries', 'blueberries', 'mango', 'grapes', 'watermelon'].some(f => name.includes(f))) {
          cat = 'Fruits';
        } else if (['broccoli', 'carrot', 'spinach', 'pepper', 'tomato', 'cucumber', 'lettuce', 'cauliflower'].some(f => name.includes(f))) {
          cat = 'Vegetables';
        } else if (['chicken', 'salmon', 'tuna', 'beef', 'tofu', 'egg', 'yogurt', 'turkey'].some(f => name.includes(f))) {
          cat = 'Proteins';
        } else if (['rice', 'oatmeal', 'quinoa', 'bread', 'pasta', 'tortilla'].some(f => name.includes(f))) {
          cat = 'Grains';
        } else if (['milk', 'cheese', 'cottage', 'butter'].some(f => name.includes(f))) {
          cat = 'Dairy';
        } else if (['almond', 'peanut', 'walnut', 'cashew', 'chia', 'seed'].some(f => name.includes(f))) {
          cat = 'Nuts & Seeds';
        } else if (['shrimp', 'crab', 'lobster'].some(f => name.includes(f))) {
          cat = 'Seafood';
        } else if (['bean', 'chickpea', 'lentil'].some(f => name.includes(f))) {
          cat = 'Legumes';
        } else if (['protein bar', 'granola', 'chocolate'].some(f => name.includes(f))) {
          cat = 'Snacks';
        }

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


