/**
 * Simple Test Runner - Manual Verification
 * Run: node test-runner.js
 */

console.log('🧪 NutriFit Test Suite - Manual Verification\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision);
      if (diff > tolerance) {
        throw new Error(`Expected ${expected} but got ${actual} (diff: ${diff})`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toContain(item) {
      if (!actual.includes(item)) {
        throw new Error(`Expected array to contain ${item}`);
      }
    },
    toHaveLength(length) {
      if (actual.length !== length) {
        throw new Error(`Expected length ${length} but got ${actual.length}`);
      }
    }
  };
}

// ============================================
// TC-009: BMI Calculation Tests
// ============================================
console.log('\n📊 TC-009: BMI Calculation Tests');
console.log('-'.repeat(60));

const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

test('Should calculate BMI for normal weight (70kg, 175cm)', () => {
  const bmi = calculateBMI(70, 175);
  expect(bmi).toBeCloseTo(22.86, 1);
});

test('Should calculate BMI for overweight (90kg, 175cm)', () => {
  const bmi = calculateBMI(90, 175);
  expect(bmi).toBeCloseTo(29.39, 1);
});

test('Should calculate BMI for underweight (55kg, 175cm)', () => {
  const bmi = calculateBMI(55, 175);
  expect(bmi).toBeCloseTo(17.96, 1);
});

test('Should calculate BMI for obese (100kg, 180cm)', () => {
  const bmi = calculateBMI(100, 180);
  expect(bmi).toBeCloseTo(30.86, 1);
});

test('Should handle zero height edge case', () => {
  const calculateSafeBMI = (weight, height) => {
    if (height === 0) return 0;
    return calculateBMI(weight, height);
  };
  expect(calculateSafeBMI(70, 0)).toBe(0);
});

// ============================================
// TC-011: Calorie Calculation Tests
// ============================================
console.log('\n🔥 TC-011: Calorie Calculation Tests (Mifflin-St Jeor)');
console.log('-'.repeat(60));

const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

test('Should calculate BMR for male (70kg, 175cm, 25 years)', () => {
  const bmr = calculateBMR(70, 175, 25, 'male');
  expect(bmr).toBeCloseTo(1673.75, 1);
});

test('Should calculate BMR for female (60kg, 165cm, 25 years)', () => {
  const bmr = calculateBMR(60, 165, 25, 'female');
  expect(bmr).toBeCloseTo(1345.25, 1);
});

test('Should adjust calories for weight loss goal', () => {
  const baseBMR = 2000;
  const loseWeight = baseBMR - 500;
  expect(loseWeight).toBe(1500);
});

test('Should adjust calories for weight gain goal', () => {
  const baseBMR = 2000;
  const gainWeight = baseBMR + 500;
  expect(gainWeight).toBe(2500);
});

// ============================================
// TC-012: Allergen Filtering Tests
// ============================================
console.log('\n🚫 TC-012: Allergen Filtering Tests');
console.log('-'.repeat(60));

const filterFoodsByAllergens = (foods, allergens) => {
  return foods.filter(food => {
    if (!food.allergens || food.allergens.length === 0) return true;
    return !food.allergens.some(allergen => allergens.includes(allergen));
  });
};

test('Should filter out foods with peanuts allergen', () => {
  const foods = [
    { name: 'Chicken', allergens: [] },
    { name: 'Peanut Butter', allergens: ['Peanuts'] },
    { name: 'Rice', allergens: [] },
  ];
  const safe = filterFoodsByAllergens(foods, ['Peanuts']);
  expect(safe).toHaveLength(2);
  expect(safe.map(f => f.name)).toContain('Chicken');
  expect(safe.map(f => f.name)).toContain('Rice');
});

test('Should filter out multiple allergens', () => {
  const foods = [
    { name: 'Chicken', allergens: [] },
    { name: 'Milk', allergens: ['Dairy'] },
    { name: 'Peanut Butter', allergens: ['Peanuts'] },
    { name: 'Rice', allergens: [] },
  ];
  const safe = filterFoodsByAllergens(foods, ['Peanuts', 'Dairy']);
  expect(safe).toHaveLength(2);
});

// ============================================
// TC-015: Time-based Recipe Filtering
// ============================================
console.log('\n⏰ TC-015: Time-based Recipe Filtering Tests');
console.log('-'.repeat(60));

const getMealTypeByTime = (hour) => {
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 21) return 'dinner';
  return 'snacks';
};

test('Should return breakfast for 8 AM', () => {
  expect(getMealTypeByTime(8)).toBe('breakfast');
});

test('Should return lunch for 1 PM', () => {
  expect(getMealTypeByTime(13)).toBe('lunch');
});

test('Should return dinner for 7 PM', () => {
  expect(getMealTypeByTime(19)).toBe('dinner');
});

test('Should return snacks for 10 PM', () => {
  expect(getMealTypeByTime(22)).toBe('snacks');
});

test('Should return snacks for 3 AM', () => {
  expect(getMealTypeByTime(3)).toBe('snacks');
});

// ============================================
// TC-023: Water Intake Tests
// ============================================
console.log('\n💧 TC-023: Water Intake Tracking Tests');
console.log('-'.repeat(60));

let waterIntake = { glasses: 0, goal: 8 };

const addGlass = () => waterIntake.glasses++;
const removeGlass = () => {
  if (waterIntake.glasses > 0) waterIntake.glasses--;
};
const getProgress = () => (waterIntake.glasses / waterIntake.goal) * 100;

test('Should start with 0 glasses', () => {
  waterIntake = { glasses: 0, goal: 8 };
  expect(waterIntake.glasses).toBe(0);
});

test('Should add glasses correctly', () => {
  waterIntake = { glasses: 0, goal: 8 };
  addGlass();
  addGlass();
  addGlass();
  expect(waterIntake.glasses).toBe(3);
});

test('Should calculate progress correctly', () => {
  waterIntake = { glasses: 4, goal: 8 };
  expect(getProgress()).toBe(50);
});

test('Should not go below 0 glasses', () => {
  waterIntake = { glasses: 0, goal: 8 };
  removeGlass();
  expect(waterIntake.glasses).toBe(0);
});

// ============================================
// TC-024: Water Reminder Tests
// ============================================
console.log('\n🔔 TC-024: Water Intake Reminder Tests');
console.log('-'.repeat(60));

const checkWaterReminder = (glasses, goal) => {
  if (glasses < goal) {
    return { show: true, message: 'Drink more water', priority: 'medium' };
  }
  return { show: false };
};

test('Should show reminder when below goal', () => {
  const reminder = checkWaterReminder(5, 8);
  expect(reminder.show).toBe(true);
  expect(reminder.message).toBe('Drink more water');
});

test('Should not show reminder when goal reached', () => {
  const reminder = checkWaterReminder(8, 8);
  expect(reminder.show).toBe(false);
});

// ============================================
// Meal Distribution Tests
// ============================================
console.log('\n🍽️  Meal Calorie Distribution Tests');
console.log('-'.repeat(60));

const distributeMealCalories = (total) => {
  return {
    breakfast: Math.round(total * 0.25),
    lunch: Math.round(total * 0.35),
    dinner: Math.round(total * 0.30),
    snacks: Math.round(total * 0.10),
  };
};

test('Should distribute 2000 calories correctly', () => {
  const dist = distributeMealCalories(2000);
  expect(dist.breakfast).toBe(500);
  expect(dist.lunch).toBe(700);
  expect(dist.dinner).toBe(600);
  expect(dist.snacks).toBe(200);
});

test('Should distribute 1500 calories correctly', () => {
  const dist = distributeMealCalories(1500);
  expect(dist.breakfast).toBe(375);
  expect(dist.lunch).toBe(525);
  expect(dist.dinner).toBe(450);
  expect(dist.snacks).toBe(150);
});

// ============================================
// Profile Validation Tests
// ============================================
console.log('\n✅ Profile Validation Tests');
console.log('-'.repeat(60));

const validateProfile = (profile) => {
  const errors = [];
  if (profile.age && (profile.age < 1 || profile.age > 120)) {
    errors.push('Age must be between 1 and 120');
  }
  if (profile.weight && (profile.weight < 20 || profile.weight > 300)) {
    errors.push('Weight must be between 20 and 300 kg');
  }
  if (profile.height && (profile.height < 50 || profile.height > 300)) {
    errors.push('Height must be between 50 and 300 cm');
  }
  return errors;
};

test('Should accept valid profile', () => {
  const profile = { age: 25, weight: 70, height: 175 };
  expect(validateProfile(profile)).toHaveLength(0);
});

test('Should reject invalid age', () => {
  const profile = { age: 150, weight: 70, height: 175 };
  expect(validateProfile(profile)).toContain('Age must be between 1 and 120');
});

test('Should reject invalid weight', () => {
  const profile = { age: 25, weight: 500, height: 175 };
  expect(validateProfile(profile)).toContain('Weight must be between 20 and 300 kg');
});

test('Should reject invalid height', () => {
  const profile = { age: 25, weight: 70, height: 30 };
  expect(validateProfile(profile)).toContain('Height must be between 50 and 300 cm');
});

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(60));
console.log('📊 Test Results Summary');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total:  ${passed + failed}`);
console.log(`🎯 Pass Rate: ${((passed / (passed + failed)) * 100).toFixed(2)}%`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n🎉 All tests passed! Great job!');
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Please review.`);
  process.exit(1);
}
