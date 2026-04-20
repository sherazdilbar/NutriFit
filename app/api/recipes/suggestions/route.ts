import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

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

    // Get user's allergens
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: Number(payload.userId) },
    });

    const userAllergens = profile?.allergens ? JSON.parse(profile.allergens) : [];

    // Get all foods
    const allFoods = await prisma.foodItem.findMany();

    // Filter safe foods
    const safeFoods = allFoods.filter(food => {
      const foodAllergens = food.allergens ? JSON.parse(food.allergens) : [];
      return !foodAllergens.some((allergen: string) => userAllergens.includes(allergen));
    });

    // Generate 5 recipe suggestions
    const recipes = [];
    const categories = {
      protein: ['Chicken Breast', 'Salmon', 'Tofu', 'Eggs', 'Turkey', 'Tuna'],
      carb: ['Brown Rice', 'Quinoa', 'Sweet Potato', 'Oats', 'Whole Wheat Bread', 'Pasta'],
      vegetable: ['Broccoli', 'Spinach', 'Carrots', 'Bell Peppers', 'Tomatoes', 'Cucumber'],
      fruit: ['Apple', 'Banana', 'Orange', 'Berries', 'Grapes'],
    };

    for (let i = 0; i < 5; i++) {
      const ingredients = [];
      let totalCalories = 0;

      // Pick 1 protein
      const proteins = safeFoods.filter(f => categories.protein.some(p => f.name.includes(p)));
      if (proteins.length > 0) {
        const protein = proteins[Math.floor(Math.random() * proteins.length)];
        ingredients.push(protein);
        totalCalories += protein.calories;
      }

      // Pick 1 carb
      const carbs = safeFoods.filter(f => categories.carb.some(c => f.name.includes(c)));
      if (carbs.length > 0) {
        const carb = carbs[Math.floor(Math.random() * carbs.length)];
        ingredients.push(carb);
        totalCalories += carb.calories;
      }

      // Pick 1-2 vegetables
      const vegetables = safeFoods.filter(f => categories.vegetable.some(v => f.name.includes(v)));
      const vegCount = Math.random() > 0.5 ? 2 : 1;
      for (let j = 0; j < vegCount && vegetables.length > 0; j++) {
        const veg = vegetables[Math.floor(Math.random() * vegetables.length)];
        if (!ingredients.find(ing => ing.id === veg.id)) {
          ingredients.push(veg);
          totalCalories += veg.calories;
        }
      }

      if (ingredients.length >= 3) {
        recipes.push({
          id: i + 1,
          name: `${ingredients[0].name} with ${ingredients.slice(1).map(ing => ing.name).join(' & ')}`,
          ingredients: ingredients.map(ing => ({
            id: ing.id,
            name: ing.name,
            calories: ing.calories,
          })),
          totalCalories,
          servings: 1,
        });
      }
    }

    return NextResponse.json({
      success: true,
      recipes,
      count: recipes.length,
    });
  } catch (error) {
    console.error('Get recipe suggestions error:', error);
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 });
  }
}
