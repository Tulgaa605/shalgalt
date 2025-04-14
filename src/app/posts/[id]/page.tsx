import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Icons for buttons
import DeletePostButton from '@/components/DeletePostButton'; // Add this import

// Define a specific type for comments fetched with user data
export interface CommentWithUser {
    id: string;
    text: string;
    createdAt: Date;
    userId: string;
    postId: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

interface PostDetailPageProps {
  params: { id: string };
}

// Update PostDetail to use CommentWithUser
interface PostDetail {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string | null;
        email: string | null;
    };
    category: {
        id: string;
        name: string;
    };
    comments: CommentWithUser[]; // Use the specific type here
    _count: {
        likes: number;
    };
    hasLiked: boolean;
}

// Define the return type of getPostData explicitly
// This helps TypeScript understand the shape, including nested selects
type GetPostDataReturnType = Omit<PostDetail, 'hasLiked'> & { hasLiked: boolean } | null;

async function getPostData(id: string): Promise<GetPostDataReturnType> {
    const post = await prisma.post.findUnique({
        where: { id },
        // Use the corrected select statement from previous step
        include: {
            author: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true } },
            _count: { select: { likes: true } },
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
        },
    });

    if (!post) {
        return null;
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
    return { ...post, hasLiked } as GetPostDataReturnType;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = params; 
  const postData = await getPostData(id); 

  if (!postData) {
    notFound();
  }

  const post = postData as PostDetail;
  const session = await getServerSession(authOptions);
  const isAuthor = session?.user?.id === post.author.id;

  return (
    <article className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
      {/* Header Section: Category, Meta, Edit/Delete Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Category & Meta */}
        <div>
          <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            {post.category.name}
          </span>
          <div className="text-sm text-gray-500">
            <span>By <span className="font-medium text-gray-700 hover:text-gray-900 transition-colors">{post.author.name || post.author.email}</span></span>
            <span className="mx-2">·</span>
            <span>{format(new Date(post.createdAt), 'PPP')}</span>
            {post.createdAt.toISOString() !== post.updatedAt.toISOString() && (
                <span className="text-xs italic text-gray-400 ml-2">(edited)</span>
            )}
          </div>
        </div>
        {isAuthor && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link 
                href={`/posts/${id}/edit`} 
                className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm transition-colors duration-200"
              >
                  <FiEdit className="mr-1.5 h-5 w-5" /> Edit
              </Link>
              <DeletePostButton postId={id} isAuthor={isAuthor} />
          </div>
        )}
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-900 leading-tight">{post.title}</h1>
      {post.imageUrl && (
        <div className="mb-8 rounded-lg overflow-hidden">
             <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto object-cover"
             />
        </div>
      )}
      <div className="prose prose-lg max-w-none prose-gray">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </div>
      <hr className="my-8 border-gray-200" />
      <div className="mb-8">
        <LikeButton 
            postId={id}
            initialLikes={post._count.likes} 
            initialLiked={post.hasLiked} 
        />
      </div>
      <CommentSection 
        postId={id}
        initialComments={post.comments} 
      />
    </article>
  );
}