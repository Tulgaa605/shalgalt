import Link from 'next/link';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { FiThumbsUp, FiMessageSquare } from 'react-icons/fi';
import CategoryFilter from '../../components/CategoryFilter';
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
interface Category {
    id: string;
    name: string;
}
async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}
async function getPosts(searchQuery: string, categoryName: string): Promise<PostSummary[]> {
  try {
    let whereClause: any = {};
    const searchFilter = searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' as const } },
            { content: { contains: searchQuery, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const categoryFilter = categoryName
      ? { category: { name: categoryName } }
      : {};
    if(searchQuery && categoryName) {
        whereClause = {
            AND: [
                { category: { name: categoryName } },
                { OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' as const } },
                    { content: { contains: searchQuery, mode: 'insensitive' as const } },
                ]}
            ]
        }
    } else if (categoryName) {
        whereClause = { category: { name: categoryName } };
    } else if (searchQuery) {
         whereClause = {
            OR: [
                { title: { contains: searchQuery, mode: 'insensitive' as const } },
                { content: { contains: searchQuery, mode: 'insensitive' as const } },
            ]
        };
    }


    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: { select: { name: true, email: true } },
        category: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts as PostSummary[]
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}
function truncateContent(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    category?: string;
  };
}) {
  const searchQuery = searchParams?.search || '';
  const categoryName = searchParams?.category || '';
  const [posts, categories] = await Promise.all([
    getPosts(searchQuery, categoryName),
    getCategories(),
  ]);

  const pageTitle = categoryName
    ? `"${categoryName}" ангиллын постууд`
    : "Сүүлд нэмэгдсэн постууд";

  return (
    <div>
      <CategoryFilter categories={categories} />
      {searchQuery && (
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-100">
          Хайлтын үр дүн: &quot;{searchQuery}&quot;
          {categoryName && ` (${categoryName} ангилалд)`}
        </h2>
      )}
      {!searchQuery && (
          <h1 className="text-3xl font-bold mb-10 text-center text-gray-100">{pageTitle}</h1>
      )}


      {posts.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchQuery || categoryName ? 'Тохирох пост олдсонгүй.' : 'Пост олдсонгүй. Шинээр үүсгэнэ үү!'}
        </p>
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
                <span className="inline-block bg-primary-100 text-black text-sm font-bold px-3 py-1 rounded-full mb-3 self-start">
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
    </div>
  );
}
