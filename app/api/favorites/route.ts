import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Fetch user's favorites
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const searchParams = request.nextUrl.searchParams;
    const itemType = searchParams.get('type'); // 'food' or 'exercise'

    let where: any = { userId };
    if (itemType) {
      where.itemType = itemType;
    }

    const favorites = await prisma.favorite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse itemData JSON
    const parsedFavorites = favorites.map(fav => ({
      ...fav,
      itemData: JSON.parse(fav.itemData),
    }));

    return NextResponse.json({ success: true, favorites: parsedFavorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const { itemType, itemId, itemName, itemData } = await request.json();

    // Validation
    if (!itemType || !['food', 'exercise'].includes(itemType)) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    if (!itemId || !itemName || !itemData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType,
          itemId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        message: 'Already in favorites' 
      }, { status: 200 });
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        itemType,
        itemId,
        itemName,
        itemData: JSON.stringify(itemData),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = Number(payload.userId);
    const searchParams = request.nextUrl.searchParams;
    const favoriteId = searchParams.get('id');

    if (!favoriteId) {
      return NextResponse.json({ error: 'Favorite ID required' }, { status: 400 });
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        id: Number(favoriteId),
        userId, // Ensure user owns this favorite
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (error) {
    console.error('Delete favorite error:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
