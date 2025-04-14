import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
    params: { id: string };
}
export async function POST(request: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const postId = params.id;

    if (!session?.user?.id) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    try {
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
            await prisma.like.create({
                data: {
                    userId,
                    postId,
                },
            });
            userLiked = true;
        }
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { _count: { select: { likes: true } } },
        });

        updatedLikesCount = post?._count.likes ?? 0;
        return NextResponse.json({ likes: updatedLikesCount, hasLiked: userLiked });

    } catch (error) {
        return new NextResponse('Failed to update like status', { status: 500 });
    }
} 