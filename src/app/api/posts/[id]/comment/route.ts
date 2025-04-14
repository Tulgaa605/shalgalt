import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
    params: { id: string }; // Post ID
}

// POST /api/posts/[id]/comment - Add a comment to a post
export async function POST(request: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const postId = params.id;

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    try {
        const body = await request.json();
        const { text } = body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return new NextResponse('Comment text is required', { status: 400 });
        }

        // Check if the post exists
        const postExists = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true } // Only need to select id to check existence
        });

        if (!postExists) {
            return new NextResponse('Post not found', { status: 404 });
        }

        const newComment = await prisma.comment.create({
            data: {
                text: text.trim(),
                postId,
                userId,
            },
            include: {
                user: { select: { id: true, name: true, email: true } } // Include author details in response
            }
        });

        return NextResponse.json(newComment, { status: 201 });

    } catch (error) {
        // console.error(`Failed to add comment to post ${postId}:`, error);
        return new NextResponse('Failed to add comment', { status: 500 });
    }
}

// Optional: GET handler to fetch comments for a post (alternative to including in post detail)
// export async function GET(request: Request, { params }: RouteParams) { ... } 