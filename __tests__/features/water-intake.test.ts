/**
 * Test Suite: Water Intake Tracking
 * Tests water consumption tracking and reminders
 */

describe('Water Intake Tests', () => {
  
  // TC-023: Water Intake CRUD
  test('TC-023: Should track water intake correctly', () => {
    let waterIntake = {
      glasses: 0,
      goal: 8,
      date: new Date().toISOString().split('T')[0],
    }

    const addGlass = () => {
      waterIntake.glasses += 1
    }

    const removeGlass = () => {
      if (waterIntake.glasses > 0) {
        waterIntake.glasses -= 1
      }
    }

    const getProgress = () => {
      return (waterIntake.glasses / waterIntake.goal) * 100
    }

    // Initial state
    expect(waterIntake.glasses).toBe(0)
    expect(getProgress()).toBe(0)

    // Add glasses
    addGlass()
    expect(waterIntake.glasses).toBe(1)
    expect(getProgress()).toBe(12.5)

    addGlass()
    addGlass()
    expect(waterIntake.glasses).toBe(3)
    expect(getProgress()).toBe(37.5)

    // Remove glass
    removeGlass()
    expect(waterIntake.glasses).toBe(2)
    expect(getProgress()).toBe(25)

    // Can't go below 0
    waterIntake.glasses = 0
    removeGlass()
    expect(waterIntake.glasses).toBe(0)
  })

  // TC-024: Water Intake Reminder
  test('TC-024: Should generate reminder when below goal', () => {
    const checkWaterReminder = (glasses: number, goal: number) => {
      if (glasses < goal) {
        return {
          show: true,
          message: 'Drink more water',
          priority: 'medium',
        }
      }
      return { show: false }
    }

    // Below goal
    const reminder1 = checkWaterReminder(5, 8)
    expect(reminder1.show).toBe(true)
    expect(reminder1.message).toBe('Drink more water')
    expect(reminder1.priority).toBe('medium')

    // Goal reached
    const reminder2 = checkWaterReminder(8, 8)
    expect(reminder2.show).toBe(false)

    // Above goal
    const reminder3 = checkWaterReminder(10, 8)
    expect(reminder3.show).toBe(false)
  })

  // TC-023: Daily Unique Constraint
  test('TC-023: Should enforce one record per user per day', () => {
    const waterRecords: any[] = []

    const addOrUpdateWaterIntake = (userId: number, date: string, glasses: number) => {
      const existingIndex = waterRecords.findIndex(
        r => r.userId === userId && r.date === date
      )

      if (existingIndex >= 0) {
        // Update existing
        waterRecords[existingIndex].glasses = glasses
        return { action: 'updated', record: waterRecords[existingIndex] }
      } else {
        // Create new
        const newRecord = { userId, date, glasses }
        waterRecords.push(newRecord)
        return { action: 'created', record: newRecord }
      }
    }

    const today = '2024-04-27'

    // First entry
    const result1 = addOrUpdateWaterIntake(1, today, 3)
    expect(result1.action).toBe('created')
    expect(waterRecords).toHaveLength(1)

    // Same day, should update
    const result2 = addOrUpdateWaterIntake(1, today, 5)
    expect(result2.action).toBe('updated')
    expect(waterRecords).toHaveLength(1)
    expect(waterRecords[0].glasses).toBe(5)

    // Different day, should create
    const result3 = addOrUpdateWaterIntake(1, '2024-04-28', 2)
    expect(result3.action).toBe('created')
    expect(waterRecords).toHaveLength(2)
  })

  // Progress Calculation
  test('Should calculate water intake progress percentage', () => {
    const calculateProgress = (current: number, goal: number): number => {
      return Math.min(Math.round((current / goal) * 100), 100)
    }

    expect(calculateProgress(0, 8)).toBe(0)
    expect(calculateProgress(4, 8)).toBe(50)
    expect(calculateProgress(8, 8)).toBe(100)
    expect(calculateProgress(10, 8)).toBe(100) // Capped at 100%
  })

  // Goal Validation
  test('Should validate water intake goal', () => {
    const validateGoal = (goal: number): boolean => {
      return goal >= 1 && goal <= 20
    }

    expect(validateGoal(8)).toBe(true)
    expect(validateGoal(0)).toBe(false)
    expect(validateGoal(25)).toBe(false)
    expect(validateGoal(-1)).toBe(false)
  })
})
