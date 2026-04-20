// Safety checking logic for foods and exercises

interface SafetyCheck {
  safe: boolean;
  conflicts?: string[];
  severity?: 'SAFE' | 'WARNING' | 'DANGER';
  message: string;
  recommendation?: string;
}

export function checkFoodSafety(
  foodAllergens: string[],
  userAllergens: string[]
): SafetyCheck {
  if (!userAllergens || userAllergens.length === 0 || userAllergens[0] === 'None') {
    return {
      safe: true,
      severity: 'SAFE',
      message: '✓ Safe for you',
    };
  }

  if (!foodAllergens || foodAllergens.length === 0) {
    return {
      safe: true,
      severity: 'SAFE',
      message: '✓ No known allergens',
    };
  }

  const conflicts = foodAllergens.filter(allergen =>
    userAllergens.includes(allergen)
  );

  if (conflicts.length > 0) {
    return {
      safe: false,
      conflicts,
      severity: 'DANGER',
      message: `⚠️ Contains: ${conflicts.join(', ')}`,
      recommendation: 'Do not consume - allergen detected',
    };
  }

  return {
    safe: true,
    severity: 'SAFE',
    message: '✓ Safe for you',
  };
}

export function checkExerciseSafety(
  exerciseImpact: string,
  userConditions: string[]
): SafetyCheck {
  if (!userConditions || userConditions.length === 0 || userConditions[0] === 'None') {
    return {
      safe: true,
      severity: 'SAFE',
      message: '✓ Suitable for you',
    };
  }

  // Expanded list of conditions that require caution with high-impact exercises
  const highImpactRisks = [
    'Arthritis', 
    'Heart Disease', 
    'Hypertension', 
    'Joint Problems',
    'Diabetes',
    'Asthma',
    'Back Pain',
    'Obesity',
    'Osteoporosis',
    'Knee Problems',
    'Hip Problems',
    'Chronic Pain'
  ];

  // Conditions that require caution even with medium-impact exercises
  const mediumImpactRisks = [
    'Heart Disease',
    'Severe Asthma',
    'Recent Surgery',
    'Osteoporosis'
  ];

  const hasHighRisk = userConditions.some(condition =>
    highImpactRisks.includes(condition)
  );

  const hasMediumRisk = userConditions.some(condition =>
    mediumImpactRisks.includes(condition)
  );

  // Check for high-impact exercises
  if (exerciseImpact === 'High' && hasHighRisk) {
    const matchedConditions = userConditions.filter(c => highImpactRisks.includes(c));
    return {
      safe: false,
      severity: 'WARNING',
      message: `⚠️ High-impact exercise may not be suitable due to: ${matchedConditions.join(', ')}`,
      recommendation: 'Consult your doctor or try low-impact alternatives',
    };
  }

  // Check for medium-impact exercises with serious conditions
  if (exerciseImpact === 'Medium' && hasMediumRisk) {
    const matchedConditions = userConditions.filter(c => mediumImpactRisks.includes(c));
    return {
      safe: true,
      severity: 'WARNING',
      message: `⚠️ Exercise with caution due to: ${matchedConditions.join(', ')}`,
      recommendation: 'Start slow, monitor your body, and consult your doctor if needed',
    };
  }

  // General caution for medium-impact with any risk condition
  if (exerciseImpact === 'Medium' && hasHighRisk) {
    return {
      safe: true,
      severity: 'WARNING',
      message: '⚠️ Monitor intensity and listen to your body',
      recommendation: 'Start slow and gradually increase intensity',
    };
  }

  return {
    safe: true,
    severity: 'SAFE',
    message: '✓ Suitable for you',
  };
}

export function calculateBMI(weight: number, height: number = 0): { bmi: number | null; error?: string } {
  // Validate inputs
  if (!weight || weight <= 0) {
    return { bmi: null, error: 'Invalid weight' };
  }

  if (!height || height <= 0) {
    return { bmi: null, error: 'Height not set. Please update your health profile.' };
  }

  // Validate reasonable ranges
  if (height < 100 || height > 250) {
    return { bmi: null, error: 'Height must be between 100-250 cm' };
  }

  if (weight < 20 || weight > 300) {
    return { bmi: null, error: 'Weight must be between 20-300 kg' };
  }

  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  
  return { bmi };
}

export function calculateDailyCalories(
  age: number,
  weight: number,
  height: number = 170,
  gender: 'male' | 'female' = 'male',
  goal: 'lose' | 'maintain' | 'gain' = 'maintain',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'
): number {
  // Validate inputs
  if (!age || age < 10 || age > 120) {
    throw new Error('Invalid age');
  }
  if (!weight || weight < 20 || weight > 300) {
    throw new Error('Invalid weight');
  }
  if (!height || height < 100 || height > 250) {
    throw new Error('Invalid height');
  }

  // Mifflin-St Jeor Equation for BMR (Basal Metabolic Rate)
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity level multipliers (TDEE = Total Daily Energy Expenditure)
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9,    // Very hard exercise & physical job
  };

  const tdee = bmr * activityMultipliers[activityLevel];

  // Adjust for goal (safe deficit/surplus)
  const adjustments = {
    lose: -500,     // 0.5kg per week loss (safe rate)
    maintain: 0,
    gain: +500,     // 0.5kg per week gain (safe rate)
  };

  const targetCalories = tdee + adjustments[goal];

  // Ensure minimum safe calorie intake
  const minCalories = gender === 'male' ? 1500 : 1200;
  
  return Math.round(Math.max(targetCalories, minCalories));
}

export function getBMICategory(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: 'text-blue-600' };
  } else if (bmi < 25) {
    return { category: 'Normal', color: 'text-green-600' };
  } else if (bmi < 30) {
    return { category: 'Overweight', color: 'text-yellow-600' };
  } else {
    return { category: 'Obese', color: 'text-red-600' };
  }
}



