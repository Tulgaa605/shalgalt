import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function GET(request: Request) {

  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    return new NextResponse('Failed to fetch posts', { status: 500 });
  }
}
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, categoryName, imageUrl } = body; 
    if (!title || !content || !categoryName) {
      return new NextResponse('Missing required fields: title, content, categoryName', { status: 400 });
    }
    const category = await prisma.category.upsert({
      where: { name: categoryName.trim() },
      update: {},
      create: { name: categoryName.trim() },
    });
    const categoryId = category.id;

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        categoryId,
        authorId: session.user.id, 
      },
      include: {
          category: true,
          author: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
         return new NextResponse('Error handling category', { status: 409 });
    }
    return new NextResponse('Failed to create post', { status: 500 });
  }
} 