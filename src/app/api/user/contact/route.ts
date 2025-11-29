import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';

interface EmailOptions {
    to: string;
    from: string;
    subject: string;
    text: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
    // Placeholder for email service integration (e.g., SendGrid, AWS SES)
    // In production, replace this with actual email service call
    console.log('Sending email:', {
        ...options,
        timestamp: new Date().toISOString()
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        const { type, message, subject } = await req.json();

        if (!message || !type) {
            return NextResponse.json(
                { error: 'Message and type are required' },
                { status: 400 }
            );
        }

        if (type === 'email') {
            await sendEmail({
                to: 'support@crisiscard.game',
                from: user?.email || 'noreply@crisiscard.game',
                subject: subject || 'Support Request',
                text: message
            });
        } else if (type === 'chat') {
            // Placeholder for live chat integration
            console.log('Chat request received:', { userId: user?.id, message });
        }

        return NextResponse.json({
            success: true,
            message: 'Your message has been sent. We\'ll get back to you soon!'
        });
    } catch (error) {
        console.error('Error processing contact request:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
