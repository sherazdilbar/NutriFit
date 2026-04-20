import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Food Items
  console.log('\n📦 Seeding food items...');
  
  const foods = [
    // Fruits
    { name: 'Apple', calories: 95, allergens: JSON.stringify([]) },
    { name: 'Banana', calories: 105, allergens: JSON.stringify([]) },
    { name: 'Orange', calories: 62, allergens: JSON.stringify([]) },
    { name: 'Strawberries (1 cup)', calories: 49, allergens: JSON.stringify([]) },
    { name: 'Blueberries (1 cup)', calories: 84, allergens: JSON.stringify([]) },
    { name: 'Mango', calories: 135, allergens: JSON.stringify([]) },
    { name: 'Grapes (1 cup)', calories: 104, allergens: JSON.stringify([]) },
    { name: 'Watermelon (1 cup)', calories: 46, allergens: JSON.stringify([]) },
    
    // Vegetables
    { name: 'Broccoli (1 cup)', calories: 55, allergens: JSON.stringify([]) },
    { name: 'Carrot', calories: 25, allergens: JSON.stringify([]) },
    { name: 'Spinach (1 cup)', calories: 7, allergens: JSON.stringify([]) },
    { name: 'Bell Pepper', calories: 30, allergens: JSON.stringify([]) },
    { name: 'Tomato', calories: 22, allergens: JSON.stringify([]) },
    { name: 'Cucumber', calories: 16, allergens: JSON.stringify([]) },
    { name: 'Lettuce (1 cup)', calories: 5, allergens: JSON.stringify([]) },
    { name: 'Cauliflower (1 cup)', calories: 25, allergens: JSON.stringify([]) },
    
    // Proteins
    { name: 'Chicken Breast (100g)', calories: 165, allergens: JSON.stringify([]) },
    { name: 'Salmon (100g)', calories: 208, allergens: JSON.stringify(['Fish']) },
    { name: 'Tuna (100g)', calories: 144, allergens: JSON.stringify(['Fish']) },
    { name: 'Ground Beef (100g)', calories: 250, allergens: JSON.stringify([]) },
    { name: 'Tofu (100g)', calories: 76, allergens: JSON.stringify(['Soy']) },
    { name: 'Eggs (2 large)', calories: 140, allergens: JSON.stringify(['Eggs']) },
    { name: 'Greek Yogurt (1 cup)', calories: 133, allergens: JSON.stringify(['Milk']) },
    { name: 'Turkey Breast (100g)', calories: 135, allergens: JSON.stringify([]) },
    
    // Grains
    { name: 'Brown Rice (1 cup cooked)', calories: 218, allergens: JSON.stringify([]) },
    { name: 'Oatmeal (1 cup cooked)', calories: 166, allergens: JSON.stringify(['Gluten']) },
    { name: 'Quinoa (1 cup cooked)', calories: 222, allergens: JSON.stringify([]) },
    { name: 'Whole Wheat Bread (1 slice)', calories: 81, allergens: JSON.stringify(['Wheat', 'Gluten']) },
    { name: 'White Rice (1 cup cooked)', calories: 205, allergens: JSON.stringify([]) },
    { name: 'Pasta (1 cup cooked)', calories: 220, allergens: JSON.stringify(['Wheat', 'Gluten']) },
    
    // Dairy
    { name: 'Milk (1 cup)', calories: 149, allergens: JSON.stringify(['Milk']) },
    { name: 'Cheddar Cheese (1 oz)', calories: 114, allergens: JSON.stringify(['Milk']) },
    { name: 'Cottage Cheese (1 cup)', calories: 206, allergens: JSON.stringify(['Milk']) },
    { name: 'Butter (1 tbsp)', calories: 102, allergens: JSON.stringify(['Milk']) },
    
    // Nuts & Seeds
    { name: 'Almonds (1 oz)', calories: 164, allergens: JSON.stringify(['Tree Nuts']) },
    { name: 'Peanut Butter (2 tbsp)', calories: 188, allergens: JSON.stringify(['Peanuts']) },
    { name: 'Walnuts (1 oz)', calories: 185, allergens: JSON.stringify(['Tree Nuts']) },
    { name: 'Cashews (1 oz)', calories: 157, allergens: JSON.stringify(['Tree Nuts']) },
    { name: 'Chia Seeds (1 oz)', calories: 138, allergens: JSON.stringify([]) },
    { name: 'Sunflower Seeds (1 oz)', calories: 165, allergens: JSON.stringify([]) },
    
    // Seafood
    { name: 'Shrimp (100g)', calories: 99, allergens: JSON.stringify(['Shellfish']) },
    { name: 'Crab (100g)', calories: 97, allergens: JSON.stringify(['Shellfish']) },
    { name: 'Lobster (100g)', calories: 89, allergens: JSON.stringify(['Shellfish']) },
    
    // Legumes
    { name: 'Black Beans (1 cup cooked)', calories: 227, allergens: JSON.stringify([]) },
    { name: 'Chickpeas (1 cup cooked)', calories: 269, allergens: JSON.stringify([]) },
    { name: 'Lentils (1 cup cooked)', calories: 230, allergens: JSON.stringify([]) },
    
    // Snacks
    { name: 'Protein Bar', calories: 200, allergens: JSON.stringify(['Milk', 'Soy', 'Peanuts']) },
    { name: 'Granola (1/2 cup)', calories: 212, allergens: JSON.stringify(['Tree Nuts', 'Gluten']) },
    { name: 'Dark Chocolate (1 oz)', calories: 170, allergens: JSON.stringify(['Milk', 'Soy']) },
    { name: 'Rice Cakes (2 cakes)', calories: 70, allergens: JSON.stringify([]) },
    { name: 'Tortilla Chips (1 oz)', calories: 140, allergens: JSON.stringify([]) },
    { name: 'Popcorn (1 cup)', calories: 31, allergens: JSON.stringify([]) },
  ];

  // Clear existing food items to avoid duplicates
  await prisma.foodItem.deleteMany({});
  
  // Insert all foods
  await prisma.foodItem.createMany({
    data: foods,
  });

  console.log(`✅ Seeded ${foods.length} food items`);

  // Seed Exercise Items
  console.log('\n💪 Seeding exercise items...');

  const exercises = [
    // Cardio
    { name: 'Running (30 min)', impactLevel: 'High' },
    { name: 'Walking (30 min)', impactLevel: 'Low' },
    { name: 'Cycling (30 min)', impactLevel: 'Low' },
    { name: 'Swimming (30 min)', impactLevel: 'Low' },
    { name: 'Jump Rope (15 min)', impactLevel: 'High' },
    { name: 'Rowing (30 min)', impactLevel: 'Medium' },
    { name: 'Elliptical (30 min)', impactLevel: 'Low' },
    { name: 'Stair Climbing (20 min)', impactLevel: 'Medium' },
    
    // Strength
    { name: 'Push-ups (3 sets of 15)', impactLevel: 'Medium' },
    { name: 'Pull-ups (3 sets of 10)', impactLevel: 'Medium' },
    { name: 'Squats (3 sets of 15)', impactLevel: 'Medium' },
    { name: 'Lunges (3 sets of 12)', impactLevel: 'Medium' },
    { name: 'Deadlifts (3 sets of 10)', impactLevel: 'High' },
    { name: 'Bench Press (3 sets of 10)', impactLevel: 'Medium' },
    { name: 'Plank (3 sets of 1 min)', impactLevel: 'Low' },
    { name: 'Bicep Curls (3 sets of 12)', impactLevel: 'Low' },
    
    // Flexibility
    { name: 'Yoga (45 min)', impactLevel: 'Low' },
    { name: 'Stretching (20 min)', impactLevel: 'Low' },
    { name: 'Pilates (45 min)', impactLevel: 'Low' },
    { name: 'Tai Chi (30 min)', impactLevel: 'Low' },
    
    // Sports
    { name: 'Basketball (30 min)', impactLevel: 'High' },
    { name: 'Tennis (30 min)', impactLevel: 'Medium' },
    { name: 'Soccer (30 min)', impactLevel: 'High' },
    { name: 'Golf (60 min)', impactLevel: 'Low' },
    { name: 'Volleyball (30 min)', impactLevel: 'Medium' },
    
    // HIIT
    { name: 'HIIT Workout (20 min)', impactLevel: 'High' },
    { name: 'Burpees (3 sets of 10)', impactLevel: 'High' },
    { name: 'Mountain Climbers (3 sets of 20)', impactLevel: 'High' },
    { name: 'Box Jumps (3 sets of 10)', impactLevel: 'High' },
  ];

  // Clear existing exercise items to avoid duplicates
  await prisma.exerciseItem.deleteMany({});
  
  // Insert all exercises
  await prisma.exerciseItem.createMany({
    data: exercises,
  });

  console.log(`✅ Seeded ${exercises.length} exercise items`);

  console.log('\n🎉 Database seeding completed successfully!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
