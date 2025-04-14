'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  category: {
    name: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts/my-posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Постуудыг ачаалахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchPosts();
    }
  }, [status, router]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Та энэ постыг устгахдаа итгэлтэй байна уу?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Пост амжилттай устгагдлаа');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Пост устгахад алдаа гарлаа');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Ачаалж байна...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header Section */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl shadow-lg p-8 mb-8 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105">
            <span className="text-primary-600 text-4xl font-bold">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)}
            </span>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {session?.user?.name || session?.user?.email}
            </h1>
            <p className="text-gray-600 mb-4">{session?.user?.email}</p>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-700 shadow-sm">
                <span className="text-primary-600 font-semibold mr-2">{posts.length}</span>
                Пост
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white text-gray-700 shadow-sm">
                <span className="text-primary-600 font-semibold mr-2">
                  {posts.reduce((acc, post) => acc + post._count.likes, 0)}
                </span>
                Лайк
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Миний постууд</h2>
          <Link
            href="/create-post"
            className="group relative inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-2xl text-gray-900 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg border border-primary-200/50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary-100 to-secondary-100 transition-all duration-300 group-hover:opacity-90"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary-200 to-secondary-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              <FiPlus className="mr-2 h-4 w-4 transform group-hover:rotate-90 transition-all duration-300" />
              Шинэ пост
            </span>
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl shadow-sm">
            <p className="text-gray-600 text-lg mb-4">Та одоогоор пост оруулаагүй байна.</p>
            <Link
              href="/create-post"
              className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-2xl text-gray-900 bg-white hover:bg-gray-50 focus:outline-none transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg border border-primary-200/50"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Шинэ пост үүсгэх
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      {post.category.name}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group">
                      <Link href={`/posts/${post.id}`} className="hover:text-primary-600 transition-colors">
                        {post.title}
                      </Link>
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-full hover:bg-primary-50"
                    >
                      <FiEdit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-gray-500">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                      👍 {post._count.likes}
                    </span>
                    <span className="flex items-center text-gray-500">
                      <span className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></span>
                      💬 {post._count.comments}
                    </span>
                  </div>
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Дэлгэрэнгүй
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 