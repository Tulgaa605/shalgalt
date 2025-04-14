import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Basic validation
    if (!email || !password) {
      return new NextResponse('Email and password are required', { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse('User with this email already exists', { status: 409 }); // 409 Conflict
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null, // Use provided name or null
      },
    });

    // Return success response (don't send back the password hash)
    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("Registration error:", error);
    // Generic error for security
    return new NextResponse('An error occurred during registration', { status: 500 });
  }
} 