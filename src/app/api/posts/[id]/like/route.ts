import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
    params: { id: string }; // Post ID
}

// POST /api/posts/[id]/like - Toggle like status for a post
export async function POST(request: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const postId = params.id;

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Check if the like already exists
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        let updatedLikesCount;
        let userLiked;

        if (existingLike) {
            // User has already liked, so unlike it
            await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    },
                },
            });
            userLiked = false;
        } else {
            // User hasn't liked, so create a new like
            await prisma.like.create({
                data: {
                    userId,
                    postId,
                },
            });
            userLiked = true;
        }

        // Get the updated like count for the post
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { _count: { select: { likes: true } } },
        });

        updatedLikesCount = post?._count.likes ?? 0;

        // Return the new like count and the user's like status
        return NextResponse.json({ likes: updatedLikesCount, hasLiked: userLiked });

    } catch (error) {
        // console.error(`Failed to toggle like for post ${postId}:`, error);
        // Avoid specific errors, return generic message
        return new NextResponse('Failed to update like status', { status: 500 });
    }
} 