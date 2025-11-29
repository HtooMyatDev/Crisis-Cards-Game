import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { role, isActive } = body;

    // Validate input
    if (role && !['ADMIN', 'PLAYER'].includes(role.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Build update data
    const updateData: Prisma.UserUpdateInput = {};
    if (role) {
      updateData.role = role.toUpperCase();
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Format response
    const formatted = {
      id: updatedUser.id.toString(),
      name: updatedUser.name ?? '',
      email: updatedUser.email,
      role: updatedUser.role.toLowerCase() === 'admin' ? 'admin' : 'player',
      status: updatedUser.isActive ? 'active' : 'inactive',
      joinDate: updatedUser.createdAt.toISOString().slice(0, 10),
      lastActivity: updatedUser.updatedAt.toISOString().slice(0, 10),
      gamesPlayed: 0
    };

    return NextResponse.json({ success: true, user: formatted });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
