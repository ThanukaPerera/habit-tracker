import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await prisma.$executeRaw`SELECT 1`;
        return NextResponse.json({ status: 'success', message: 'Database connected successfully' });
    } catch (error) {
        return NextResponse.json({ status: 'error', message: 'Database connection failed', error: String(error) }, { status: 500 });
    }
}
