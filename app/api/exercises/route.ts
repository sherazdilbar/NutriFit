import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const impactLevel = searchParams.get('impact');

    let where: any = {};

    if (search) {
      // SQLite doesn't support case-insensitive mode, so we'll filter in JS
      // Just search by contains for now
      where.name = {
        contains: search,
      };
    }

    if (impactLevel) {
      where.impactLevel = impactLevel;
    }

    const exercises = await prisma.exerciseItem.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Group by category
    if (!search) {
      const grouped = exercises.reduce((acc: any, exercise) => {
        const name = exercise.name.toLowerCase();
        let cat = 'Other';

        if (['running', 'walking', 'cycling', 'swimming', 'jump', 'rowing', 'elliptical', 'stair'].some(c => name.includes(c))) {
          cat = 'Cardio';
        } else if (['push', 'pull', 'squat', 'lunge', 'deadlift', 'bench', 'plank', 'curl'].some(c => name.includes(c))) {
          cat = 'Strength';
        } else if (['yoga', 'stretch', 'pilates', 'tai'].some(c => name.includes(c))) {
          cat = 'Flexibility';
        } else if (['basketball', 'tennis', 'soccer', 'golf', 'volleyball'].some(c => name.includes(c))) {
          cat = 'Sports';
        } else if (['hiit', 'burpee', 'mountain', 'box'].some(c => name.includes(c))) {
          cat = 'HIIT';
        }

        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(exercise);
        return acc;
      }, {});

      return NextResponse.json({ success: true, grouped });
    }

    return NextResponse.json({ success: true, exercises });
  } catch (error) {
    console.error('Get exercises error:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
  }
}


