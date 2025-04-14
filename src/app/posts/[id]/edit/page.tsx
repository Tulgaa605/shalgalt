'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface PostFormData {
    title: string;
    content: string;
    categoryName: string;
    imageUrl?: string | null;
}

interface PostData extends PostFormData {
    id: string;
    authorId: string;
    // Add other fields if needed, like category object itself
    category?: { id: string; name: string };
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string; // Get post ID from URL
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState<PostFormData>({ title: '', content: '', categoryName: '', imageUrl: '' });
  const [originalPost, setOriginalPost] = useState<PostData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // State for fetching initial data

  // Fetch post data on mount
  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) {
          if (res.status === 404) {
            notFound(); // Use Next.js notFound helper
          } else {
            throw new Error('Failed to fetch post data');
          }
          return; // Stop execution if not ok
        }
        const data: PostData = await res.json();
        
        // Security check: Ensure logged-in user is the author
        if (status === 'authenticated' && session?.user?.id !== data.authorId) {
             setError("You are not authorized to edit this post.");
             // Optionally redirect
             // router.push('/'); 
             setOriginalPost(data); // Still set data to show content if desired, but disable form
             setFormData({ 
                title: data.title, 
                content: data.content, 
                categoryName: data.category?.name || '', // Use fetched category name
                imageUrl: data.imageUrl 
            });
             setFetching(false);
             return;
        }

        setOriginalPost(data);
        setFormData({ 
            title: data.title, 
            content: data.content, 
            categoryName: data.category?.name || '', // Use fetched category name
            imageUrl: data.imageUrl 
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load post data');
      } finally {
        setFetching(false);
      }
    };

    // Only fetch if authenticated or still loading session
    if (status !== 'unauthenticated') {
        fetchPost();
    }

  }, [postId, status, session?.user?.id]); // Re-fetch if postId or session status changes

  // Redirect if unauthenticated after session check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/posts/${postId}/edit`);
    }
  }, [status, router, postId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'authenticated' || session?.user?.id !== originalPost?.authorId) {
        setError("You are not authorized to edit this post.");
        return;
    }
    if (!formData.title || !formData.content || !formData.categoryName.trim()) {
      setError('Title, Content, and Category Name are required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const updateData = {
          title: formData.title,
          content: formData.content,
          categoryName: formData.categoryName.trim(),
          imageUrl: formData.imageUrl || null
      };

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData = { message: `Failed to update post (Status: ${response.status})` };
        try {
            errorData = JSON.parse(responseText);
        } catch (parseError) {
            errorData.message = responseText;
        }
        throw new Error(errorData.message || 'Failed to update post');
      }

      // Redirect back to the post detail page after successful update
      router.push(`/posts/${postId}`);
      router.refresh(); // Important to refresh data on the detail page

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Loading and Auth States
  if (fetching || status === 'loading') {
    return <div className="flex justify-center items-center h-64"><p>Loading post data...</p></div>;
  }
  if (status === 'unauthenticated') {
     return <div className="flex justify-center items-center h-64"><p>Redirecting to login...</p></div>;
  }
   // If user is authenticated but not the author (and error is set)
  if (error && originalPost && session?.user?.id !== originalPost?.authorId) {
      return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center text-red-600">Authorization Error</h1>
            <p className="text-center text-gray-700 bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded text-sm">{error}</p>
            <div className="mt-6 text-center">
                <Link href={`/posts/${postId}`} className="text-primary-600 hover:text-primary-500 underline">
                    Go back to post
                </Link>
            </div>
        </div>
      );
  }
  // Handle general fetch errors after loading/auth checks
  if (error) {
      return (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold mb-6 text-center text-red-600">Error</h1>
              <p className="text-center text-gray-700 bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded text-sm">{error}</p>
              <div className="mt-6 text-center">
                  <Link href="/" className="text-primary-600 hover:text-primary-500 underline">
                      Go back home
                  </Link>
              </div>
          </div>
        );
  }
  
  if (!originalPost) {
      // This case should ideally be handled by notFound() triggered during fetch
      return <div className="flex justify-center items-center h-64"><p>Post not found.</p></div>;
  }


  // Determine if form should be disabled (e.g., if user is not author)
  const isFormDisabled = loading || (status === 'authenticated' && session?.user?.id !== originalPost?.authorId);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded text-sm" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Post Title
          </label>
          <input
            type="text"
            id="title"
            name="title" // Add name attribute for handleInputChange
            value={formData.title}
            onChange={handleInputChange}
            className="appearance-none block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content" // Add name attribute
            rows={10}
            value={formData.content}
            onChange={handleInputChange}
            className="appearance-none block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label htmlFor="categoryName" className="block text-black text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            name="categoryName" // Add name attribute
            value={formData.categoryName}
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 text-black py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (Optional)
          </label>
          <input
            type="url" 
            id="imageUrl"
            name="imageUrl" // Add name attribute
            value={formData.imageUrl || ''} // Handle null value for input
            onChange={handleInputChange}
            className="appearance-none block w-full px-3 text-black py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="https://example.com/image.jpg"
            disabled={isFormDisabled}
          />
        </div>
        <div>
          <button
            type="submit"
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isFormDisabled}
          >
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
        <div className="text-center mt-4">
            <Link href={`/posts/${postId}`} className="text-sm text-gray-500 hover:text-gray-700 underline">
                Cancel
            </Link>
        </div>
      </form>
    </div>
  );
} 