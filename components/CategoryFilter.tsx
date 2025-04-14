'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  const currentSearch = searchParams.get('search') || '';
  const createHref = (categoryName: string | null) => {
    const params = new URLSearchParams();
    if (currentSearch) {
      params.set('search', currentSearch);
    }
    if (categoryName) {
      params.set('category', categoryName);
    }
    const queryString = params.toString();
    return `/${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-2">
      <Link
        href={createHref(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
          !currentCategory
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Бүгд
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={createHref(category.name)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            currentCategory === category.name
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
};

export default CategoryFilter; 