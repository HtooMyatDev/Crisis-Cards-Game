import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter'); // 'all', 'read', 'unread'

    const whereClause: Prisma.NotificationWhereInput = {};

    if (filter === 'read') {
      whereClause.isRead = true;
    } else if (filter === 'unread') {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, type, userId, sendToAll } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (!sendToAll && !userId) {
      return NextResponse.json({ error: 'userId required when not sending to all' }, { status: 400 });
    }

    if (sendToAll) {
      // Send notification to all users
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      });

      const notifications = users.map(u => ({
        userId: u.id,
        title,
        message,
        type: type || 'INFO'
      }));

      await prisma.notification.createMany({
        data: notifications
      });

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${users.length} users`
      });
    } else {
      // Send to specific user
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type: type || 'INFO'
        }
      });

      return NextResponse.json({
        success: true,
        notification
      });
    }
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
