import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch user's exercise logs
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId as number;
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    let where: any = { userId };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const logs = await prisma.exerciseLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });

    // Parse exercises JSON
    const parsedLogs = logs.map(log => ({
      ...log,
      exercises: log.exercises ? JSON.parse(log.exercises) : [],
    }));

    return NextResponse.json({ success: true, logs: parsedLogs });
  } catch (error) {
    console.error('Get exercise logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new exercise log
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = payload.userId as number;
    const { date, exercises } = await request.json();

    // Validation 1: Check exercises array
    if (!exercises || !Array.isArray(exercises)) {
      return NextResponse.json({ error: 'Exercises array is required' }, { status: 400 });
    }

    if (exercises.length === 0) {
      return NextResponse.json({ error: 'At least one exercise is required' }, { status: 400 });
    }

    // Validation 2: Check date is not in future
    const logDate = date ? new Date(date) : new Date();
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (logDate > today) {
      return NextResponse.json({ error: 'Cannot log exercises for future dates' }, { status: 400 });
    }

    // Validation 3: Check each exercise has valid data
    for (const exercise of exercises) {
      if (!exercise.name || typeof exercise.name !== 'string') {
        return NextResponse.json({ error: 'Each exercise must have a valid name' }, { status: 400 });
      }
      
      if (exercise.duration && typeof exercise.duration !== 'number') {
        return NextResponse.json({ error: 'Duration must be a number (minutes)' }, { status: 400 });
      }

      if (exercise.duration && exercise.duration <= 0) {
        return NextResponse.json({ error: 'Duration must be a positive number' }, { status: 400 });
      }

      if (exercise.sets && (typeof exercise.sets !== 'number' || exercise.sets <= 0)) {
        return NextResponse.json({ error: 'Sets must be a positive number' }, { status: 400 });
      }

      if (exercise.reps && (typeof exercise.reps !== 'number' || exercise.reps <= 0)) {
        return NextResponse.json({ error: 'Reps must be a positive number' }, { status: 400 });
      }
    }

    // Validation 4: Check for duplicate logging (same exercises within 2 hours)
    const twoHoursAgo = new Date(logDate);
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const twoHoursLater = new Date(logDate);
    twoHoursLater.setHours(twoHoursLater.getHours() + 2);

    const recentLogs = await prisma.exerciseLog.findMany({
      where: {
        userId,
        date: {
          gte: twoHoursAgo,
          lte: twoHoursLater,
        },
      },
    });

    if (recentLogs.length > 0) {
      const recentExercises = recentLogs.flatMap(log => JSON.parse(log.exercises));
      const exerciseNames = exercises.map(e => e.name.toLowerCase());
      const duplicates = recentExercises.filter((re: any) => 
        exerciseNames.includes(re.name.toLowerCase())
      );

      if (duplicates.length > 0) {
        return NextResponse.json({ 
          warning: true,
          message: `You logged similar exercises recently: ${duplicates.map((d: any) => d.name).join(', ')}. Are you sure you want to log again?`,
          duplicates: duplicates.map((d: any) => d.name),
        }, { status: 200 });
      }
    }

    const log = await prisma.exerciseLog.create({
      data: {
        userId,
        date: logDate,
        exercises: JSON.stringify(exercises),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Exercise logged successfully',
      log,
    });
  } catch (error) {
    console.error('Create exercise log error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



