import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    // console.error("Failed to fetch categories:", error);
    return new NextResponse('Failed to fetch categories', { status: 500 });
  }
}

// Optional: Add POST handler later if you want to create categories via API
// export async function POST(request: Request) { ... } 