// Smart Plan Generation Logic

interface FoodItem {
  id: number;
  name: string;
  calories: number;
  allergens: string[];
}

interface ExerciseItem {
  id: number;
  name: string;
  impactLevel: string;
}

interface HealthProfile {
  age?: number;
  weight?: number;
  height?: number;
  healthGoals?: string;
  diseases?: string[];
  allergens?: string[];
}

interface DietPlanMeal {
  meal: string;
  time: string;
  foods: Array<{ name: string; serving: string; calories: number }>;
  totalCalories: number;
}

interface WorkoutPlanExercise {
  day: string;
  category: string;
  exercises: Array<{ name: string; duration: string; rest: string }>;
  totalDuration: string;
}

/**
 * Generates personalized diet plan based on user profile and calorie targets
 * Filters foods based on allergens and distributes meals throughout the day
 */
export function generateDietPlan(
  foods: FoodItem[],
  profile: HealthProfile,
  targetCalories: number,
  days: number = 7
): { plan: DietPlanMeal[]; metadata: any } {
  const safeFoods = foods.filter(food => {
    if (!profile.allergens || profile.allergens.length === 0 || profile.allergens[0] === 'None') {
      return true;
    }
    const conflicts = food.allergens.filter(allergen =>
      profile.allergens!.includes(allergen)
    );
    return conflicts.length === 0;
  });

  const fruits = safeFoods.filter(f => 
    ['apple', 'banana', 'orange', 'strawberr', 'blueberr', 'mango', 'grape', 'watermelon'].some(fruit => 
      f.name.toLowerCase().includes(fruit)
    )
  );
  
  const vegetables = safeFoods.filter(f => 
    ['broccoli', 'carrot', 'spinach', 'pepper', 'tomato', 'cucumber', 'lettuce', 'cauliflower'].some(veg => 
      f.name.toLowerCase().includes(veg)
    )
  );
  
  const proteins = safeFoods.filter(f => 
    ['chicken', 'salmon', 'tuna', 'beef', 'tofu', 'egg', 'yogurt', 'turkey'].some(protein => 
      f.name.toLowerCase().includes(protein)
    )
  );
  
  const grains = safeFoods.filter(f => 
    ['rice', 'oatmeal', 'quinoa', 'bread', 'pasta'].some(grain => 
      f.name.toLowerCase().includes(grain)
    )
  );

  const snacks = safeFoods.filter(f =>
    ['almond', 'seed', 'protein bar', 'granola', 'chocolate', 'cake', 'chip', 'popcorn'].some(snack =>
      f.name.toLowerCase().includes(snack)
    )
  );

  const breakfastCal = Math.round(targetCalories * 0.25);
  const lunchCal = Math.round(targetCalories * 0.35);
  const dinnerCal = Math.round(targetCalories * 0.30);
  const snackCal = Math.round(targetCalories * 0.10);

  const plan: DietPlanMeal[] = [];

  const breakfastFoods = selectFoodsForMeal(
    [...fruits, ...grains, ...proteins.filter(p => p.name.includes('Egg') || p.name.includes('Yogurt'))],
    breakfastCal,
    3,
    'breakfast'
  );
  plan.push({
    meal: 'Breakfast',
    time: '8:00 AM',
    foods: breakfastFoods,
    totalCalories: breakfastFoods.reduce((sum, f) => sum + f.calories, 0),
  });

  const lunchFoods = selectFoodsForMeal(
    [...proteins, ...grains, ...vegetables],
    lunchCal,
    4,
    'lunch'
  );
  plan.push({
    meal: 'Lunch',
    time: '12:30 PM',
    foods: lunchFoods,
    totalCalories: lunchFoods.reduce((sum, f) => sum + f.calories, 0),
  });

  const dinnerFoods = selectFoodsForMeal(
    [...proteins, ...vegetables, ...grains],
    dinnerCal,
    4,
    'dinner'
  );
  plan.push({
    meal: 'Dinner',
    time: '7:00 PM',
    foods: dinnerFoods,
    totalCalories: dinnerFoods.reduce((sum, f) => sum + f.calories, 0),
  });

  if (snacks.length > 0) {
    const snackFoods = selectFoodsForMeal([...snacks, ...fruits], snackCal, 2, 'snack');
    plan.push({
      meal: 'Snacks',
      time: '3:00 PM',
      foods: snackFoods,
      totalCalories: snackFoods.reduce((sum, f) => sum + f.calories, 0),
    });
  }

  const totalDailyCalories = plan.reduce((sum, meal) => sum + meal.totalCalories, 0);

  return {
    plan,
    metadata: {
      days,
      targetCalories,
      actualCalories: totalDailyCalories,
      accuracy: Math.round((totalDailyCalories / targetCalories) * 100),
      safeFoodsCount: safeFoods.length,
      excludedAllergens: profile.allergens || [],
    },
  };
}

function selectFoodsForMeal(
  availableFoods: FoodItem[],
  targetCalories: number,
  maxItems: number = 4,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
): Array<{ name: string; serving: string; calories: number }> {
  const selected: Array<{ name: string; serving: string; calories: number }> = [];
  let remainingCalories = targetCalories;

  const shuffled = [...availableFoods].sort(() => Math.random() - 0.5);

  let needsProtein = mealType !== 'snack';
  let needsCarb = true;
  let needsVegetable = mealType === 'lunch' || mealType === 'dinner';

  for (const food of shuffled) {
    if (selected.length >= maxItems) break;
    
    const foodName = food.name.toLowerCase();
    
    const isProtein = ['chicken', 'salmon', 'tuna', 'beef', 'tofu', 'egg', 'yogurt', 'turkey'].some(p => foodName.includes(p));
    const isCarb = ['rice', 'oatmeal', 'quinoa', 'bread', 'pasta', 'potato'].some(c => foodName.includes(c));
    const isVegetable = ['broccoli', 'carrot', 'spinach', 'pepper', 'tomato', 'cucumber', 'lettuce', 'cauliflower'].some(v => foodName.includes(v));
    
    const shouldAdd = (
      (needsProtein && isProtein) ||
      (needsCarb && isCarb) ||
      (needsVegetable && isVegetable) ||
      (!needsProtein && !needsCarb && !needsVegetable)
    );

    if (shouldAdd && food.calories <= remainingCalories * 1.3) {
      selected.push({
        name: food.name,
        serving: '1 serving',
        calories: food.calories,
      });
      remainingCalories -= food.calories;

      if (isProtein) needsProtein = false;
      if (isCarb) needsCarb = false;
      if (isVegetable) needsVegetable = false;
    }

    if (remainingCalories <= 50) break;
  }

  if (selected.length < 2 && availableFoods.length > 0) {
    for (const food of shuffled) {
      if (selected.length >= maxItems) break;
      if (selected.find(s => s.name === food.name)) continue;
      
      if (food.calories <= remainingCalories * 1.5) {
        selected.push({
          name: food.name,
          serving: '1 serving',
          calories: food.calories,
        });
        remainingCalories -= food.calories;
      }
    }
  }

  return selected;
}

/**
 * Generates personalized workout plan based on user profile and health conditions
 * Filters high-impact exercises for users with medical conditions
 */
export function generateWorkoutPlan(
  exercises: ExerciseItem[],
  profile: HealthProfile,
  days: number = 7,
  focusArea: 'cardio' | 'strength' | 'balanced' | 'flexibility' = 'balanced'
): { plan: WorkoutPlanExercise[]; metadata: any } {
  const safeExercises = exercises.filter(exercise => {
    if (!profile.diseases || profile.diseases.length === 0 || profile.diseases[0] === 'None') {
      return true;
    }

    const riskyConditions = ['Arthritis', 'Heart Disease', 'Hypertension', 'Joint Problems'];
    const hasRisk = profile.diseases.some(d => riskyConditions.includes(d));

    if (hasRisk && exercise.impactLevel === 'High') {
      return false;
    }

    return true;
  });

  const cardio = safeExercises.filter(e =>
    ['running', 'walking', 'cycling', 'swimming', 'jump', 'rowing', 'elliptical', 'stair'].some(c =>
      e.name.toLowerCase().includes(c)
    )
  );

  const strength = safeExercises.filter(e =>
    ['push', 'pull', 'squat', 'lunge', 'deadlift', 'bench', 'plank', 'curl'].some(s =>
      e.name.toLowerCase().includes(s)
    )
  );

  const flexibility = safeExercises.filter(e =>
    ['yoga', 'stretch', 'pilates', 'tai'].some(f =>
      e.name.toLowerCase().includes(f)
    )
  );

  const sports = safeExercises.filter(e =>
    ['basketball', 'tennis', 'soccer', 'golf', 'volleyball'].some(sp =>
      e.name.toLowerCase().includes(sp)
    )
  );

  const hiit = safeExercises.filter(e =>
    ['hiit', 'burpee', 'mountain', 'box'].some(h =>
      e.name.toLowerCase().includes(h)
    )
  );

  const plan: WorkoutPlanExercise[] = [];
  
  const schedule = [
    { day: 'Monday', category: 'Strength', pool: strength },
    { day: 'Tuesday', category: 'Cardio', pool: cardio },
    { day: 'Wednesday', category: 'Flexibility', pool: flexibility },
    { day: 'Thursday', category: 'Strength', pool: strength },
    { day: 'Friday', category: 'Cardio', pool: cardio },
    { day: 'Saturday', category: 'Mixed', pool: [...sports, ...hiit] },
    { day: 'Sunday', category: 'Rest/Light', pool: [...flexibility, ...cardio.slice(0, 2)] },
  ];

  for (let i = 0; i < days && i < schedule.length; i++) {
    const { day, category, pool } = schedule[i];
    
    if (pool.length === 0) continue;

    const selectedExercises = selectExercisesForDay(pool, category === 'Rest/Light' ? 2 : 3);

    plan.push({
      day,
      category,
      exercises: selectedExercises,
      totalDuration: category === 'Rest/Light' ? '30 min' : '45-60 min',
    });
  }

  return {
    plan,
    metadata: {
      days,
      focusArea,
      safeExercisesCount: safeExercises.length,
      excludedConditions: profile.diseases || [],
      totalWorkouts: plan.length,
    },
  };
}

function selectExercisesForDay(
  availableExercises: ExerciseItem[],
  count: number
): Array<{ name: string; duration: string; rest: string }> {
  const shuffled = [...availableExercises].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return selected.map(exercise => ({
    name: exercise.name,
    duration: getDurationForExercise(exercise.name),
    rest: exercise.impactLevel === 'High' ? '90 sec' : '60 sec',
  }));
}

function getDurationForExercise(name: string): string {
  if (name.includes('sets')) {
    return 'As prescribed';
  }
  if (name.toLowerCase().includes('cardio') || name.includes('min)')) {
    return 'As prescribed';
  }
  return '15-20 min';
}



