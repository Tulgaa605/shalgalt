import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/posts - Fetch all posts (add filtering/searching later)
export async function GET(request: Request) {
  // TODO: Add search, filter, pagination logic based on URL query params
  // const { searchParams } = new URL(request.url);
  // const category = searchParams.get('category');
  // const searchTerm = searchParams.get('search');

  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true, email: true } }, // Select author fields
        category: { select: { name: true } }, // Select category name
        _count: { select: { likes: true, comments: true } } // Count likes and comments
      },
      orderBy: {
        createdAt: 'desc',
      },
      // where: { ... filtering logic ...}
    });
    return NextResponse.json(posts);
  } catch (error) {
    // console.error("Failed to fetch posts:", error);
    return new NextResponse('Failed to fetch posts', { status: 500 });
  }
}

// POST /api/posts - Create a new post (requires authentication)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    // Expect categoryName instead of categoryId
    const { title, content, categoryName, imageUrl } = body; 

    // Basic validation
    if (!title || !content || !categoryName) {
      return new NextResponse('Missing required fields: title, content, categoryName', { status: 400 });
    }

    // Find or create the category
    const category = await prisma.category.upsert({
      where: { name: categoryName.trim() }, // Find by name (case-sensitive, trim whitespace)
      update: {}, // No update needed if found
      create: { name: categoryName.trim() }, // Create if not found
    });

    // Now we have the category object with its ID
    const categoryId = category.id;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        categoryId, // Use the found or created categoryId
        authorId: session.user.id, 
      },
      // Optionally include related data in the response
      include: {
          category: true, // Include the full category object
          author: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    // console.error("Failed to create post:", error);
    // Handle potential Prisma errors like unique constraint violation for category name if needed
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
         // This shouldn't happen with upsert unless there's a race condition or different casing issue
         return new NextResponse('Error handling category', { status: 409 });
    }
    return new NextResponse('Failed to create post', { status: 500 });
  }
} 