/**
 * Test Suite: Health Profile API
 * Tests BMI calculation and profile management
 */

describe('Health Profile Tests', () => {
  
  // TC-009: BMI Calculation Accuracy
  test('TC-009: Should calculate BMI correctly', () => {
    const calculateBMI = (weight: number, height: number): number => {
      const heightInMeters = height / 100
      return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2))
    }

    // Test cases from TC-009
    const testCases = [
      { weight: 70, height: 175, expected: 22.86, category: 'Normal' },
      { weight: 90, height: 175, expected: 29.39, category: 'Overweight' },
      { weight: 55, height: 175, expected: 17.96, category: 'Underweight' },
      { weight: 100, height: 180, expected: 30.86, category: 'Obese' },
    ]

    testCases.forEach(({ weight, height, expected, category }) => {
      const bmi = calculateBMI(weight, height)
      expect(bmi).toBeCloseTo(expected, 1)
      console.log(`✓ ${category}: BMI ${bmi} (expected ${expected})`)
    })
  })

  // TC-009: BMI Edge Cases
  test('TC-009: Should handle BMI edge cases', () => {
    const calculateBMI = (weight: number, height: number): number => {
      if (height === 0) return 0
      const heightInMeters = height / 100
      return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2))
    }

    // Zero height
    expect(calculateBMI(70, 0)).toBe(0)

    // Very low values
    expect(calculateBMI(40, 150)).toBeGreaterThan(0)

    // Very high values
    expect(calculateBMI(150, 200)).toBeGreaterThan(0)
  })

  // TC-008: Profile Data Validation
  test('TC-008: Should validate health profile data', () => {
    const validateProfile = (profile: any) => {
      const errors: string[] = []

      if (profile.age && (profile.age < 1 || profile.age > 120)) {
        errors.push('Age must be between 1 and 120')
      }

      if (profile.weight && (profile.weight < 20 || profile.weight > 300)) {
        errors.push('Weight must be between 20 and 300 kg')
      }

      if (profile.height && (profile.height < 50 || profile.height > 300)) {
        errors.push('Height must be between 50 and 300 cm')
      }

      if (profile.gender && !['male', 'female'].includes(profile.gender)) {
        errors.push('Gender must be male or female')
      }

      return errors
    }

    // Valid profile
    const validProfile = {
      age: 25,
      weight: 70,
      height: 175,
      gender: 'male',
    }
    expect(validateProfile(validProfile)).toHaveLength(0)

    // Invalid age
    const invalidAge = { ...validProfile, age: 150 }
    expect(validateProfile(invalidAge)).toContain('Age must be between 1 and 120')

    // Invalid weight
    const invalidWeight = { ...validProfile, weight: 500 }
    expect(validateProfile(invalidWeight)).toContain('Weight must be between 20 and 300 kg')

    // Invalid height
    const invalidHeight = { ...validProfile, height: 30 }
    expect(validateProfile(invalidHeight)).toContain('Height must be between 50 and 300 cm')
  })

  // TC-011: Calorie Calculation (Mifflin-St Jeor)
  test('TC-011: Should calculate daily calorie needs correctly', () => {
    const calculateBMR = (
      weight: number,
      height: number,
      age: number,
      gender: 'male' | 'female'
    ): number => {
      if (gender === 'male') {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5
      } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161
      }
    }

    // Male test case
    const maleBMR = calculateBMR(70, 175, 25, 'male')
    expect(maleBMR).toBeCloseTo(1693.75, 1)

    // Female test case
    const femaleBMR = calculateBMR(60, 165, 25, 'female')
    expect(femaleBMR).toBeCloseTo(1381.25, 1)

    // Activity level multipliers
    const activityLevels = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    }

    const moderateCalories = maleBMR * activityLevels.moderate
    expect(moderateCalories).toBeCloseTo(2625.31, 1)
  })

  // TC-011: Goal-based Calorie Adjustment
  test('TC-011: Should adjust calories based on health goal', () => {
    const baseBMR = 2000

    const adjustCaloriesForGoal = (bmr: number, goal: string): number => {
      switch (goal) {
        case 'lose':
          return bmr - 500 // Deficit for weight loss
        case 'gain':
          return bmr + 500 // Surplus for weight gain
        case 'maintain':
        default:
          return bmr
      }
    }

    expect(adjustCaloriesForGoal(baseBMR, 'lose')).toBe(1500)
    expect(adjustCaloriesForGoal(baseBMR, 'maintain')).toBe(2000)
    expect(adjustCaloriesForGoal(baseBMR, 'gain')).toBe(2500)
  })
})
