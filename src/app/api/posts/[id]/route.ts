import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: { id: string };
}
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        comments: {
          select: { 
              id: true, 
              text: true, 
              createdAt: true, 
              userId: true, 
              postId: true, 
              user: {
                  select: {
                      id: true,
                      name: true,
                      email: true,
                  },
              },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }
    const session = await getServerSession(authOptions);
    let hasLiked = false;
    if (session?.user?.id) {
        const like = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId: id,
                }
            }
        });
        hasLiked = !!like;
    }
    const postData = { ...post, hasLiked };

    return NextResponse.json(postData);
  } catch (error) {
    return new NextResponse('Failed to fetch post', { status: 500 });
  }
}
export async function PUT(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

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

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        categoryId,
        imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl,
      },
       include: {
          category: true,
          author: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
         return new NextResponse('Error handling category during update', { status: 409 });
    }
    return new NextResponse('Failed to update post', { status: 500 });
  }
}
export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }
    if (post.authorId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    await prisma.post.delete({ where: { id } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
         return new NextResponse('Cannot delete post due to related data', { status: 409 });
    }
    return new NextResponse('Failed to delete post', { status: 500 });
  }
} 