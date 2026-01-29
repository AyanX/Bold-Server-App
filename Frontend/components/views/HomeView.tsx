import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Category as CategoryEnum, CategoryModel } from '../../types/models';
import { AdSlot } from '../AdSlot';


interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  isPrime: boolean;
  isHeadline: boolean;
  views: number;
  status?: string;
  categories?: string[];
}



const HomeView: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'headline' | 'latest' | 'trending' | 'prime'>('headline');
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          api.articles.getAll(),
          api.categories.getAll()
        ]);
        const publishedArticles = articlesRes.data
          .filter((a: any) => a.status === 'Published' || !a.status)
          .map((a: any) => ({
            ...a,
            isPrime: !!(a.isPrime || a.is_prime),
            isHeadline: !!(a.isHeadline || a.is_headline),
            readTime: a.readTime || a.read_time || '3 min',
            categories: a.categories || (a.category ? [a.category] : [])
          }));
        setArticles(publishedArticles);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter articles
  const headlineArticles = articles.filter(a => a.isHeadline || a.category === 'Headline News' || a.categories?.includes('Headline News')).slice(0, 6);
  const mainHeadline = headlineArticles[0];
  const secondaryHeadlines = headlineArticles.slice(1, 3);
  const tertiaryHeadlines = headlineArticles.slice(3, 6);

  const primeArticles = articles.filter(a => a.isPrime);
  const trendingArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
  const latestArticles = articles;

  const getFilteredArticles = () => {
    switch (activeFilter) {
      case 'headline':
        return headlineArticles;
      case 'prime':
        return primeArticles;
      case 'trending':
        return trendingArticles;
      case 'latest':
      default:
        return latestArticles;
    }
  };

  const filteredArticles = getFilteredArticles();
  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 8);
      setIsLoadingMore(false);
    }, 500);
  };

  // Most read sidebar
  const mostReadArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // Editor's picks (prime articles with high views)
  const editorsPicks = articles
    .filter(a => a.isPrime)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <main className="container mx-auto px-4 py-2">
        {/* Filter Navigation */}
        <section className="mb-8">
          <div className="flex items-center justify-between border-b-2 border-gray-200">
            <div className="flex items-center">
              {[
                { id: 'headline', label: 'Headline News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
                { id: 'latest', label: 'Latest News', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { id: 'trending', label: 'Trending', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
                { id: 'prime', label: 'Prime', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(filter.id as any);
                    setVisibleCount(8);
                  }}
                  className={`flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 relative ${
                    activeFilter === filter.id
                      ? 'text-[#e5002b]'
                      : 'text-gray-500 hover:text-[#001733]'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filter.icon} />
                  </svg>
                  {filter.label}
                  {activeFilter === filter.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e5002b] rounded-t-full"></span>
                  )}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-400">
              {filteredArticles.length} articles
            </div>
          </div>
        </section>

        {/* Main Content Area with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedArticles.map((article, index) => (
                <article
                  key={article.id}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <Link to={`/article/${article.slug}`} className="block">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      {article.isPrime && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[10px] font-black uppercase tracking-wider rounded-sm shadow-lg flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Prime
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-[#e5002b]/10 text-[#e5002b] text-[10px] font-black uppercase tracking-widest rounded">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
                      </div>
                      <h2 className="text-lg font-bold leading-tight text-[#001733] group-hover:text-[#e5002b] transition-colors mb-3 line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#001733] to-[#003366] flex items-center justify-center text-white text-xs font-bold">
                            {article.author?.charAt(0) || 'A'}
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{article.readTime || '3 min'}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-3 bg-[#001733] text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-[#e5002b] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Articles
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Most Read Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#001733] px-5 py-4">
                <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#e5002b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Most Read
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {mostReadArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-3xl font-black text-gray-200 group-hover:text-[#e5002b] transition-colors w-8 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5002b]">
                        {article.category}
                      </span>
                      <h4 className="font-bold text-sm text-[#001733] group-hover:text-[#e5002b] transition-colors line-clamp-2 mt-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span>{formatDate(article.date)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Editor's Picks */}
            {editorsPicks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-4">
                  <h3 className="text-black font-black uppercase tracking-widest text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Editor's Picks
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {editorsPicks.map(article => (
                    <Link
                      key={article.id}
                      to={`/article/${article.slug}`}
                      className="group flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5002b]">
                          {article.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#001733] group-hover:text-[#e5002b] transition-colors line-clamp-2 mt-1">
                          {article.title}
                        </h4>
                        <span className="text-xs text-gray-400 mt-1 block">{formatDate(article.date)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Subscription */}
            <div className="bg-[#001733] rounded-xl p-8 text-white relative overflow-hidden border-t-4 border-[#e5002b]">
              <div className="absolute -right-6 -top-6 opacity-5">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>

              <div className="relative z-10">
                <span className="text-[#e5002b] font-black uppercase tracking-widest text-xs mb-2 block">The Daily Brief</span>
                <h3 className="font-bold text-2xl mb-3 leading-tight">Join the Inner Circle</h3>
                <p className="text-white/60 text-sm mb-6 font-light">
                  Get the stories that matter. Expert analysis and exclusive insights delivered to your inbox.
                </p>

                <form className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#e5002b] focus:bg-white/10 transition-all text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-[#e5002b] text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white hover:text-[#001733] transition-all duration-300 shadow-lg shadow-[#e5002b]/20"
                  >
                    Subscribe Now
                  </button>
                </form>
                <p className="text-white/30 text-[10px] mt-4 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>

            {/* Category Tags Cloud */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-black uppercase tracking-widest text-sm text-[#001733] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#e5002b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Explore Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-[#e5002b] hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Square Ad Slot */}
            <AdSlot type="mrec" />
          </aside>
        </div>
      </main>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomeView;
