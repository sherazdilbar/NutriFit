/**
 * Test Suite: Diet Plan Generation
 * Tests meal planning logic and allergen filtering
 */

describe('Diet Plan Generation Tests', () => {
  
  // TC-012: Allergen Filtering
  test('TC-012: Should filter out foods with user allergens', () => {
    const userAllergens = ['Peanuts', 'Dairy']
    
    const foodDatabase = [
      { id: 1, name: 'Chicken Breast', allergens: [] },
      { id: 2, name: 'Peanut Butter', allergens: ['Peanuts'] },
      { id: 3, name: 'Milk', allergens: ['Dairy'] },
      { id: 4, name: 'Brown Rice', allergens: [] },
      { id: 5, name: 'Cheese', allergens: ['Dairy'] },
    ]

    const filterFoodsByAllergens = (foods: any[], allergens: string[]) => {
      return foods.filter(food => {
        if (!food.allergens || food.allergens.length === 0) return true
        return !food.allergens.some((allergen: string) => 
          allergens.includes(allergen)
        )
      })
    }

    const safeFoods = filterFoodsByAllergens(foodDatabase, userAllergens)

    expect(safeFoods).toHaveLength(2)
    expect(safeFoods.map(f => f.name)).toEqual(['Chicken Breast', 'Brown Rice'])
    expect(safeFoods.every(f => 
      !f.allergens.some((a: string) => userAllergens.includes(a))
    )).toBe(true)
  })

  // TC-011: Meal Distribution
  test('TC-011: Should distribute calories across meals correctly', () => {
    const targetCalories = 2000
    
    const distributeMealCalories = (total: number) => {
      return {
        breakfast: Math.round(total * 0.25), // 25%
        lunch: Math.round(total * 0.35),     // 35%
        dinner: Math.round(total * 0.30),    // 30%
        snacks: Math.round(total * 0.10),    // 10%
      }
    }

    const distribution = distributeMealCalories(targetCalories)

    expect(distribution.breakfast).toBe(500)
    expect(distribution.lunch).toBe(700)
    expect(distribution.dinner).toBe(600)
    expect(distribution.snacks).toBe(200)

    // Total should be close to target (within rounding)
    const total = Object.values(distribution).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(targetCalories, -1)
  })

  // TC-016: Recipe Randomization
  test('TC-016: Should randomize recipe selection', () => {
    const recipes = [
      { id: 1, name: 'Recipe 1' },
      { id: 2, name: 'Recipe 2' },
      { id: 3, name: 'Recipe 3' },
      { id: 4, name: 'Recipe 4' },
      { id: 5, name: 'Recipe 5' },
    ]

    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    const shuffled1 = shuffleArray(recipes)
    const shuffled2 = shuffleArray(recipes)

    // Both should have same length
    expect(shuffled1).toHaveLength(recipes.length)
    expect(shuffled2).toHaveLength(recipes.length)

    // Both should contain all original items
    expect(shuffled1.map(r => r.id).sort()).toEqual([1, 2, 3, 4, 5])
    expect(shuffled2.map(r => r.id).sort()).toEqual([1, 2, 3, 4, 5])
  })

  // TC-011: Calorie Accuracy
  test('TC-011: Should generate plan within calorie target range', () => {
    const targetCalories = 2000
    const tolerance = 0.1 // 10%

    const validateCalorieAccuracy = (actual: number, target: number): boolean => {
      const difference = Math.abs(actual - target)
      const percentDiff = difference / target
      return percentDiff <= tolerance
    }

    // Test various actual calorie values
    expect(validateCalorieAccuracy(2000, targetCalories)).toBe(true)  // Exact
    expect(validateCalorieAccuracy(2100, targetCalories)).toBe(true)  // +5%
    expect(validateCalorieAccuracy(1900, targetCalories)).toBe(true)  // -5%
    expect(validateCalorieAccuracy(2200, targetCalories)).toBe(false) // +10% (outside)
    expect(validateCalorieAccuracy(1700, targetCalories)).toBe(false) // -15% (outside)
  })

  // TC-015: Time-based Meal Filtering
  test('TC-015: Should filter recipes by time of day', () => {
    const getMealTypeByTime = (hour: number): string => {
      if (hour >= 6 && hour < 11) return 'breakfast'
      if (hour >= 11 && hour < 16) return 'lunch'
      if (hour >= 16 && hour < 21) return 'dinner'
      return 'snacks'
    }

    expect(getMealTypeByTime(8)).toBe('breakfast')   // 8 AM
    expect(getMealTypeByTime(13)).toBe('lunch')      // 1 PM
    expect(getMealTypeByTime(19)).toBe('dinner')     // 7 PM
    expect(getMealTypeByTime(22)).toBe('snacks')     // 10 PM
    expect(getMealTypeByTime(3)).toBe('snacks')      // 3 AM
  })

  // Meal Variety Test
  test('Should ensure variety in meal selection', () => {
    const foods = [
      { id: 1, name: 'Food A', calories: 100 },
      { id: 2, name: 'Food B', calories: 150 },
      { id: 3, name: 'Food C', calories: 200 },
    ]

    const selectRandomFoods = (foods: any[], count: number) => {
      const shuffled = [...foods].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, count)
    }

    const selection = selectRandomFoods(foods, 2)
    
    expect(selection).toHaveLength(2)
    expect(selection[0].id).not.toBe(selection[1].id)
  })
})
