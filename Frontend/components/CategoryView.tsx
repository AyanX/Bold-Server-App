import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArticleCard } from './ArticleCard';
import { Pagination } from './Pagination';
import { api } from '../services/api';
import { CATEGORIES } from '../constants';
import { AdSlot } from './AdSlot';

export const CategoryView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categoryInfo = CATEGORIES.find(c => c.slug === slug) || { name: slug, slug: slug };
  const categoryName = categoryInfo.name;

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await api.articles.getAll();
        const allArticles = res.data || [];

        // Helper to normalize category for comparison
        const normalize = (s: string) => s?.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

        const filtered = allArticles.filter((a: any) => {
            // Check if article category matches the current slug
            const catSlug = CATEGORIES.find(c => c.name.toLowerCase() === a.category.toLowerCase())?.slug;
            const articleCategoryNormalized = normalize(a.category);
            return catSlug === slug || articleCategoryNormalized === slug || articleCategoryNormalized === 'opinion' && slug === 'opinions';
        });

        setArticles(filtered);
        setCurrentPage(1); // Reset to page 1 on category change
      } catch (error) {
        console.error('Failed to fetch articles', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [slug]);

  const totalItems = articles.length;
  const paginatedArticles = articles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 min-h-[50vh]">
        <div className="animate-pulse space-y-8">
           <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#f8fafc] border-b border-gray-100 py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <span className="text-xs font-black text-[#e5002b] uppercase tracking-widest mb-2 block">Category</span>
           <h1 className="text-4xl md:text-5xl font-black text-[#001733] uppercase tracking-tight">{categoryName}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-9">
              {articles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-12">
                    {paginatedArticles.map(article => (
                      <ArticleCard key={article.id} article={article} layout="grid" />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-sm border border-gray-100">
                   <p className="text-gray-500 font-medium">No articles found in this category.</p>
                   <Link to="/" className="text-[#e5002b] text-xs font-black uppercase tracking-widest mt-4 inline-block hover:underline">Return Home</Link>
                </div>
              )}
           </div>

           <div className="lg:col-span-3 space-y-8">
              <div className="sticky top-24">
                 <AdSlot type="mrec" />
                 <div className="mt-8 bg-[#001733] text-white p-6 rounded-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Popular Categories</h3>
                    <ul className="space-y-2">
                       {CATEGORIES.filter(c => c.slug !== slug).slice(0, 6).map(cat => (
                          <li key={cat.slug}>
                             <Link to={`/category/${cat.slug}`} className="text-xs font-bold text-gray-400 hover:text-[#e5002b] transition-colors flex justify-between items-center group">
                                <span>{cat.name}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                             </Link>
                          </li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
