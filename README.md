# NutriFit - Health & Fitness Tracking Application

A comprehensive health and fitness tracking web application built with Next.js, TypeScript, and Prisma.

## Features

- User Authentication (Sign Up / Sign In)
- Health Profile Management
- Personalized Diet Plan Generation
- Custom Workout Plan Creation
- Meal & Exercise Logging
- Goal Setting & Progress Tracking
- Food & Exercise Catalogs with Safety Checks
- Weekly Summary & Streak Tracking
- Water Intake Tracking
- Favorites System
- Smart Reminders
- Recipe Suggestions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd nutrifit
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
```

4. Set up the database
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Login page
│   └── register/         # Register page
├── components/            # Reusable components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Database Schema

The application uses SQLite with the following main models:
- User
- HealthProfile
- Goal
- DietPlan
- WorkoutPlan
- MealLog
- ExerciseLog
- WaterIntake
- Favorite
- FoodItem
- ExerciseItem

## License

MIT
