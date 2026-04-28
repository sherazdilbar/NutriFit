import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// Popular recipe combinations - More variety
const RECIPE_TEMPLATES = {
  breakfast: [
    { name: 'Classic Breakfast Bowl', protein: 'Eggs', carb: 'Oats', extras: ['Banana', 'Berries'] },
    { name: 'Protein Pancakes', protein: 'Eggs', carb: 'Whole Wheat Bread', extras: ['Banana', 'Strawberries'] },
    { name: 'Healthy Breakfast Plate', protein: 'Turkey', carb: 'Whole Wheat Bread', extras: ['Tomato', 'Cucumber'] },
    { name: 'Greek Yogurt Parfait', protein: 'Greek Yogurt', carb: 'Granola', extras: ['Blueberries', 'Banana'] },
    { name: 'Scrambled Eggs & Toast', protein: 'Eggs', carb: 'Whole Wheat Bread', extras: ['Spinach', 'Tomato'] },
    { name: 'Oatmeal Power Bowl', protein: 'Greek Yogurt', carb: 'Oatmeal', extras: ['Apple', 'Walnuts'] },
    { name: 'Breakfast Burrito', protein: 'Eggs', carb: 'Tortilla', extras: ['Bell Pepper', 'Tomato'] },
    { name: 'Smoothie Bowl', protein: 'Greek Yogurt', carb: 'Oats', extras: ['Mango', 'Strawberries'] },
  ],
  lunch: [
    { name: 'Grilled Chicken Bowl', protein: 'Chicken Breast', carb: 'Brown Rice', veggies: ['Broccoli', 'Carrot'] },
    { name: 'Salmon Power Bowl', protein: 'Salmon', carb: 'Quinoa', veggies: ['Spinach', 'Bell Pepper'] },
    { name: 'Tofu Stir-Fry', protein: 'Tofu', carb: 'Brown Rice', veggies: ['Broccoli', 'Carrot'] },
    { name: 'Turkey Wrap', protein: 'Turkey', carb: 'Whole Wheat Bread', veggies: ['Tomato', 'Cucumber'] },
    { name: 'Tuna Salad Bowl', protein: 'Tuna', carb: 'Quinoa', veggies: ['Lettuce', 'Tomato'] },
    { name: 'Chicken Caesar Salad', protein: 'Chicken Breast', carb: 'Whole Wheat Bread', veggies: ['Lettuce', 'Tomato'] },
    { name: 'Beef & Rice Bowl', protein: 'Ground Beef', carb: 'Brown Rice', veggies: ['Bell Pepper', 'Broccoli'] },
    { name: 'Shrimp Pasta', protein: 'Shrimp', carb: 'Pasta', veggies: ['Spinach', 'Tomato'] },
    { name: 'Chickpea Buddha Bowl', protein: 'Chickpeas', carb: 'Quinoa', veggies: ['Cucumber', 'Carrot'] },
    { name: 'Turkey & Quinoa Bowl', protein: 'Turkey', carb: 'Quinoa', veggies: ['Broccoli', 'Bell Pepper'] },
  ],
  dinner: [
    { name: 'Baked Salmon Dinner', protein: 'Salmon', carb: 'Sweet Potato', veggies: ['Broccoli', 'Spinach'] },
    { name: 'Chicken & Veggies', protein: 'Chicken Breast', carb: 'Brown Rice', veggies: ['Bell Pepper', 'Carrot'] },
    { name: 'Tuna Pasta', protein: 'Tuna', carb: 'Pasta', veggies: ['Tomato', 'Spinach'] },
    { name: 'Tofu Buddha Bowl', protein: 'Tofu', carb: 'Quinoa', veggies: ['Broccoli', 'Carrot'] },
    { name: 'Grilled Chicken Plate', protein: 'Chicken Breast', carb: 'Sweet Potato', veggies: ['Broccoli', 'Cauliflower'] },
    { name: 'Beef Stir-Fry', protein: 'Ground Beef', carb: 'Brown Rice', veggies: ['Bell Pepper', 'Broccoli'] },
    { name: 'Shrimp & Rice', protein: 'Shrimp', carb: 'White Rice', veggies: ['Spinach', 'Tomato'] },
    { name: 'Turkey Meatballs', protein: 'Turkey', carb: 'Pasta', veggies: ['Tomato', 'Spinach'] },
    { name: 'Lentil Curry Bowl', protein: 'Lentils', carb: 'Brown Rice', veggies: ['Spinach', 'Tomato'] },
    { name: 'Salmon & Quinoa', protein: 'Salmon', carb: 'Quinoa', veggies: ['Broccoli', 'Bell Pepper'] },
  ],
  snack: [
    { name: 'Fruit & Protein', protein: 'Eggs', extras: ['Apple', 'Banana'] },
    { name: 'Light Snack', protein: 'Turkey', extras: ['Orange', 'Strawberries'] },
    { name: 'Yogurt & Berries', protein: 'Greek Yogurt', extras: ['Blueberries', 'Strawberries'] },
    { name: 'Nut Mix', protein: 'Almonds', extras: ['Apple', 'Grapes'] },
    { name: 'Protein Bar & Fruit', protein: 'Protein Bar', extras: ['Banana', 'Orange'] },
    { name: 'Cottage Cheese Bowl', protein: 'Cottage Cheese', extras: ['Mango', 'Blueberries'] },
  ],
};

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

    // Get user's health profile
    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Please create health profile first' }, { status: 400 });
    }

    const userAllergens = profile.allergens ? JSON.parse(profile.allergens) : [];
    const healthGoal = profile.healthGoals || 'maintain';

    // Get all foods
    const allFoods = await prisma.foodItem.findMany();

    // Filter safe foods
    const safeFoods = allFoods.filter(food => {
      const foodAllergens = food.allergens ? JSON.parse(food.allergens) : [];
      return !foodAllergens.some((allergen: string) => userAllergens.includes(allergen));
    });

    // Determine calorie targets based on health goal
    const calorieTargets = {
      lose_weight: { breakfast: 300, lunch: 450, dinner: 400, snack: 150 },
      maintain: { breakfast: 400, lunch: 550, dinner: 500, snack: 200 },
      gain_weight: { breakfast: 500, lunch: 650, dinner: 600, snack: 250 },
    };

    const targets = calorieTargets[healthGoal as keyof typeof calorieTargets] || calorieTargets.maintain;

    // Generate recipes for different meal types with randomization
    const recipes = [];

    // Shuffle templates for variety
    const shuffleArray = (array: any[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Try to get 1-2 breakfast recipes
    const breakfastTemplates = shuffleArray(RECIPE_TEMPLATES.breakfast);
    let breakfastCount = 0;
    for (const template of breakfastTemplates) {
      if (breakfastCount >= 2) break;
      const recipe = buildRecipe(template, safeFoods, targets.breakfast, 'breakfast');
      if (recipe) {
        recipes.push(recipe);
        breakfastCount++;
      }
    }

    // Try to get 2-3 lunch recipes
    const lunchTemplates = shuffleArray(RECIPE_TEMPLATES.lunch);
    let lunchCount = 0;
    for (const template of lunchTemplates) {
      if (lunchCount >= 3) break;
      const recipe = buildRecipe(template, safeFoods, targets.lunch, 'lunch');
      if (recipe) {
        recipes.push(recipe);
        lunchCount++;
      }
    }

    // Try to get 1-2 dinner recipes
    const dinnerTemplates = shuffleArray(RECIPE_TEMPLATES.dinner);
    let dinnerCount = 0;
    for (const template of dinnerTemplates) {
      if (dinnerCount >= 2) break;
      const recipe = buildRecipe(template, safeFoods, targets.dinner, 'dinner');
      if (recipe) {
        recipes.push(recipe);
        dinnerCount++;
      }
    }

    // Try to get 1-2 snack recipes
    const snackTemplates = shuffleArray(RECIPE_TEMPLATES.snack);
    let snackCount = 0;
    for (const template of snackTemplates) {
      if (snackCount >= 2) break;
      const recipe = buildRecipe(template, safeFoods, targets.snack, 'snack');
      if (recipe) {
        recipes.push(recipe);
        snackCount++;
      }
    }

    return NextResponse.json({
      success: true,
      recipes,
      count: recipes.length,
      metadata: {
        healthGoal,
        calorieTargets: targets,
      },
    });
  } catch (error) {
    console.error('Get recipe suggestions error:', error);
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 });
  }
}

function buildRecipe(
  template: any,
  safeFoods: any[],
  targetCalories: number,
  mealType: string
): any | null {
  const ingredients = [];
  let totalCalories = 0;

  // Find protein (more flexible matching)
  const protein = safeFoods.find(f => 
    f.name.toLowerCase().includes(template.protein.toLowerCase()) ||
    template.protein.toLowerCase().includes(f.name.toLowerCase())
  );
  if (protein) {
    ingredients.push({ id: protein.id, name: protein.name, calories: protein.calories });
    totalCalories += protein.calories;
  }

  // Find carb (more flexible matching)
  if (template.carb) {
    const carb = safeFoods.find(f => 
      f.name.toLowerCase().includes(template.carb.toLowerCase()) ||
      template.carb.toLowerCase().includes(f.name.toLowerCase())
    );
    if (carb) {
      ingredients.push({ id: carb.id, name: carb.name, calories: carb.calories });
      totalCalories += carb.calories;
    }
  }

  // Find veggies or extras (more flexible matching)
  const extrasList = template.veggies || template.extras || [];
  extrasList.forEach((extraName: string) => {
    const extra = safeFoods.find(f => 
      (f.name.toLowerCase().includes(extraName.toLowerCase()) ||
      extraName.toLowerCase().includes(f.name.toLowerCase())) &&
      !ingredients.find(ing => ing.id === f.id)
    );
    if (extra && !ingredients.find(ing => ing.id === extra.id)) {
      ingredients.push({ id: extra.id, name: extra.name, calories: extra.calories });
      totalCalories += extra.calories;
    }
  });

  // Only return if we have at least 2 ingredients
  if (ingredients.length < 2) return null;

  // Add calorie badge based on target
  const calorieStatus = 
    totalCalories <= targetCalories * 0.9 ? 'Low Cal' :
    totalCalories <= targetCalories * 1.1 ? 'Balanced' :
    'High Cal';

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: template.name,
    mealType,
    ingredients,
    totalCalories,
    targetCalories,
    calorieStatus,
    servings: 1,
  };
}
