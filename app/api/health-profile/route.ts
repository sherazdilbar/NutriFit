import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch user's health profile
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId as number;

    const profile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { exists: false, profile: null },
        { status: 200 }
      );
    }

    // Parse JSON fields
    const profileData = {
      ...profile,
      diseases: profile.diseases ? JSON.parse(profile.diseases) : [],
      allergens: profile.allergens ? JSON.parse(profile.allergens) : [],
    };

    return NextResponse.json({
      exists: true,
      profile: profileData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new health profile
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId as number;
    const { age, weight, permissions, diseases, allergens } = await request.json();

    // Validate input
    if (!age || !weight) {
      return NextResponse.json(
        { error: 'Age and weight are required' },
        { status: 400 }
      );
    }

    if (age < 1 || age > 150) {
      return NextResponse.json(
        { error: 'Please enter a valid age' },
        { status: 400 }
      );
    }

    if (weight < 1 || weight > 500) {
      return NextResponse.json(
        { error: 'Please enter a valid weight' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Health profile already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Create profile
    const profile = await prisma.healthProfile.create({
      data: {
        userId,
        age: parseInt(age),
        weight: parseFloat(weight),
        permissions: permissions || null,
        diseases: diseases ? JSON.stringify(diseases) : null,
        allergens: allergens ? JSON.stringify(allergens) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Health profile created successfully',
      profile,
    });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing health profile
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId as number;
    const { age, weight, permissions, diseases, allergens } = await request.json();

    // Validate input
    if (age && (age < 1 || age > 150)) {
      return NextResponse.json(
        { error: 'Please enter a valid age' },
        { status: 400 }
      );
    }

    if (weight && (weight < 1 || weight > 500)) {
      return NextResponse.json(
        { error: 'Please enter a valid weight' },
        { status: 400 }
      );
    }

    // Update profile
    const profile = await prisma.healthProfile.update({
      where: { userId },
      data: {
        ...(age && { age: parseInt(age) }),
        ...(weight && { weight: parseFloat(weight) }),
        permissions: permissions || null,
        diseases: diseases ? JSON.stringify(diseases) : null,
        allergens: allergens ? JSON.stringify(allergens) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Health profile updated successfully',
      profile,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Health profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



