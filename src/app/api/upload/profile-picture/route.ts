import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import path from 'path';
import { writeFile } from 'fs/promises';
import { stat, mkdir } from 'fs/promises';
async function ensureDirExists(dirPath: string) {
    try {
        await stat(dirPath);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            try {
                await mkdir(dirPath, { recursive: true });
                console.log(`Created directory: ${dirPath}`);
            } catch (mkdirError) {
                console.error(`Error creating directory ${dirPath}:`, mkdirError);
                throw new Error(`Could not create directory: ${dirPath}`);
            }
        } else {
            console.error(`Error checking directory ${dirPath}:`, error);
            throw new Error(`Could not access directory: ${dirPath}`);
        }
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        const formData = await request.formData();
        const file = formData.get('profilePicture') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
             return NextResponse.json({ error: 'Invalid file type, please upload an image.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileExtension = path.extname(file.name);
        const timestamp = Date.now();
        const filename = `${userId}-${timestamp}${fileExtension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-pictures');
        const filePath = path.join(uploadDir, filename);
        await ensureDirExists(uploadDir);
        await writeFile(filePath, buffer);
        console.log(`File saved to: ${filePath}`);
        const imageUrl = `/uploads/profile-pictures/${filename}`;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl },
        });

        return NextResponse.json({ success: true, imageUrl: imageUrl }, { status: 200 });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        if (error instanceof Error && error.message.includes('Could not create directory')) {
             return NextResponse.json({ error: 'Server error: Could not create upload directory.' }, { status: 500 });
        }
         if (error instanceof Error && error.message.includes('Could not access directory')) {
             return NextResponse.json({ error: 'Server error: Could not access upload directory.' }, { status: 500 });
        }
        return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 });
    }
} 