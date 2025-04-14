'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiEdit, FiTrash2, FiPlus, FiThumbsUp, FiMessageSquare, FiUpload, FiCamera } from 'react-icons/fi';
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
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(session?.user?.image || null);

  useEffect(() => {
    setUploadedImageUrl(session?.user?.image || null);
  }, [session?.user?.image]);

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
        setLoadingPosts(false);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Эхлээд зураг сонгоно уу.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedImageUrl(data.imageUrl);
      setSelectedFile(null);
      toast.success('Профайл зураг амжилттай солигдлоо!');
      await updateSession({ image: data.imageUrl });

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Зураг upload хийхэд алдаа гарлаа.');
      toast.error(error.message || 'Зураг upload хийхэд алдаа гарлаа.');
    } finally {
      setUploading(false);
    }
  };

  if (status === 'loading' || loadingPosts) {
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
      <div className="bg-gradient-to-r from-primary-50 to-secondary-100 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
              {uploadedImageUrl ? (
                <Image
                  src={uploadedImageUrl}
                  alt="Profile Picture"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  onError={() => setUploadedImageUrl(null)}
                />
              ) : (
                <span className="text-primary-600 text-4xl font-bold">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <label htmlFor="profile-picture-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
              <FiCamera className="w-8 h-8 text-white" />
            </label>
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              {session?.user?.name || session?.user?.email}
            </h1>
            <p className="text-gray-600 mb-4">{session?.user?.email}</p>
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'}`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ачаалж байна...
                    </>
                  ) : (
                    <>
                      <FiUpload className="-ml-1 mr-2 h-5 w-5" />
                      {selectedFile.name} - Хадгалах
                    </>
                  )}
                </button>
              )}
              {!selectedFile && (
                <span className="text-sm text-gray-500">Шинэ зураг сонгохын тулд дээр дарна уу.</span>
              )}
            </div>
            {uploadError && <p className="text-red-600 text-sm mt-2">{uploadError}</p>}
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white text-gray-700 shadow-sm text-sm">
                <span className="text-primary-600 font-semibold mr-1.5">{posts.length}</span>
                Пост
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white text-gray-700 shadow-sm text-sm">
                <span className="text-primary-600 font-semibold mr-1.5">
                  {posts.reduce((acc, post) => acc + post._count.likes, 0)}
                </span>
                Лайк
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Миний постууд</h2>
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

        {loadingPosts ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Постуудыг ачаалж байна...</p>
          </div>
        ) : posts.length === 0 ? (
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
                    <span className="inline-block bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 text-xs font-semibold px-3 py-1 rounded-full mb-2">
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
                  <div className="flex items-center space-x-4 text-gray-500">
                    <span className="flex items-center">
                      <FiThumbsUp className="w-4 h-4 mr-1" /> {post._count.likes}
                    </span>
                    <span className="flex items-center">
                      <FiMessageSquare className="w-4 h-4 mr-1" /> {post._count.comments}
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