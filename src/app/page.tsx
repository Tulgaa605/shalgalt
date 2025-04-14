import Link from 'next/link';
import prisma from '@/lib/prisma';
import { format } from 'date-fns'; // For formatting dates
import { FiThumbsUp, FiMessageSquare } from 'react-icons/fi'; // Import icons

// Define the expected shape of a post fetched from the DB
// Including related data like author, category, and counts
interface PostSummary {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    name: string | null;
    email: string | null;
  };
  category: {
    name: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

async function getPosts(): Promise<PostSummary[]> {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // Ensure the returned data matches the PostSummary interface
    // Prisma should handle this, but explicit type assertion can be added if needed
    return posts as PostSummary[];
  } catch (error) {
    console.error("Failed to fetch posts for homepage:", error);
    return []; // Return empty array on error
  }
}

// Helper function to truncate content
function truncateContent(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">Latest Posts</h1>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts found yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              {post.imageUrl && (
                <div className="aspect-video overflow-hidden"> 
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full mb-3 self-start">
                  {post.category.name}
                </span>
                <Link href={`/posts/${post.id}`} className="block mb-2 group">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
                  {truncateContent(post.content)}
                </p>
                <div className="text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700 hover:text-gray-900 transition-colors">{post.author.name || post.author.email}</span>
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                      <FiThumbsUp className="w-4 h-4 mr-1" /> {post._count.likes}
                    </span>
                    <span className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                      <FiMessageSquare className="w-4 h-4 mr-1" /> {post._count.comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* TODO: Add Category Filter Component */}
      {/* TODO: Add Search Bar Component */}
    </div>
  );
}

// Optional: Add revalidation if needed (ISR)
// export const revalidate = 60; // Revalidate every 60 seconds
