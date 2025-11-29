import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id }
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          emailNotifications: true,
          pushNotifications: false,
          soundEffects: true,
          autoSave: true,
          difficulty: 'medium'
        }
      });
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, pushNotifications, soundEffects, autoSave, difficulty } = body;

    // Validate difficulty if provided
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty level' }, { status: 400 });
    }

    // Update or create settings
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(soundEffects !== undefined && { soundEffects }),
        ...(autoSave !== undefined && { autoSave }),
        ...(difficulty !== undefined && { difficulty })
      },
      create: {
        userId: user.id,
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? false,
        soundEffects: soundEffects ?? true,
        autoSave: autoSave ?? true,
        difficulty: difficulty ?? 'medium'
      }
    });

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
