import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdSlot } from './AdSlot';
import { api } from '../services/api';

interface CategoryItem {
  name: string;
  slug: string;
  color?: string;
}

// Fallback categories in case API fails
const FALLBACK_CATEGORIES: CategoryItem[] = [
  { name: 'Latest News', slug: 'latest' },
  { name: 'Politics', slug: 'politics' },
  { name: 'Corporate', slug: 'corporate' },
  { name: 'Health', slug: 'health' },
  { name: 'Law & Order', slug: 'law-order' },
  { name: 'Startup & Tech', slug: 'startup-tech' },
  { name: 'Career', slug: 'career' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Opinions', slug: 'opinion' },
  { name: 'Lifestyle', slug: 'lifestyle' }
];

export const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATEGORIES);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const trendingNews = allArticles.slice(0, 5);

  // Fetch articles and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          api.articles.getAll(),
          api.categories.getAll()
        ]);
        setAllArticles(articlesRes.data || []);

        // Use API categories if available, fallback to FALLBACK_CATEGORIES
        if (categoriesRes.data && categoriesRes.data.length > 0) {
          setCategories(categoriesRes.data.map((cat: any) => ({
            name: cat.name,
            slug: cat.slug,
            color: cat.color
          })));
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
        // Keep using FALLBACK_CATEGORIES as fallback
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (trendingNews.length === 0) return;
    const newsTimer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % trendingNews.length);
    }, 4000);

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(newsTimer);
      clearInterval(clockTimer);
    };
  }, [trendingNews.length]);

  useEffect(() => {
    if (searchQuery.trim() && allArticles.length > 0) {
      const results = allArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allArticles]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDay = currentTime.toLocaleDateString('en-GB', { weekday: 'long' });
  const formattedTime = currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky-nav">
      {/* Top Ticker Bar */}
      <div className="bg-[#001733] py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center flex-grow overflow-hidden">
            <div className="flex-shrink-0 bg-[#e5002b] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider mr-4 rounded-sm">
              Flash
            </div>
            <div className="relative flex-grow h-4 overflow-hidden">
              {trendingNews.length > 0 ? trendingNews.map((news, index) => (
                <Link
                  key={news.id}
                  to={`/article/${news.id}`}
                  className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out ${
                    index === currentNewsIndex
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <span className="px-2 text-[12px] text-white/90 font-medium truncate hover:text-white transition-colors">
                    <span className="text-white/40 mr-2">[{news.category}]</span>
                    {news.title}
                  </span>
                </Link>
              )) : (
                <span className="text-[10px] text-white/60 font-medium">Loading latest news...</span>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[9px] text-white/60 font-bold uppercase tracking-widest ml-4 whitespace-nowrap">
             <span className="text-white">{formattedDay}</span>
             <span className="text-white/20">|</span>
             <span className="tabular-nums">{formattedTime}</span>
             <span className="text-white/20">|</span>
             <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Header with Logo (Left) and Ad (Right) */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="group flex items-center gap-2 hover:text-[#001733] transition-colors focus:outline-none shrink-0"
            aria-label="Open side menu"
          >
            <div className="flex flex-col gap-1 w-6">
              <span className="h-0.5 w-6 bg-current transition-all"></span>
              <span className="h-0.5 w-4 bg-current transition-all group-hover:w-6"></span>
              <span className="h-0.5 w-6 bg-current transition-all"></span>
            </div>
            <span className="hidden sm:block text-[11px] font-black uppercase tracking-[0.2em]">Menu</span>
          </button>

          <Link to="/" className="flex items-center group shrink-0">
            <img src="/logo.png" alt="The Bold East Africa" className="h-12 md:h-14 lg:h-16 object-contain transition-transform group-hover:-skew-x-3" />
          </Link>
        </div>

        {/* Ad Slot - Fixed to Right on LG screens */}
        <div className="hidden lg:block overflow-hidden w-[728px]">
          <AdSlot type="leaderboard" scrollable={true} />
        </div>
      </div>

      <nav className="hidden md:block bg-white border-t py-3 border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="overflow-x-auto no-scrollbar flex-grow">
            <ul className="flex items-center gap-6 py-2 whitespace-nowrap">
              {categories.map(cat => (
                <li key={cat.slug} className="text-xs font-black uppercase  tracking-widest text-[#001733] hover:text-[#e5002b] transition-all relative group">
                  <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#e5002b] transition-all group-hover:w-full"></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0 ml-6 pl-6 border-l border-gray-200 flex items-center gap-6">
             <div className="relative" ref={searchRef}>
                <div className="flex items-center">
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'w-48 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search news..."
                            className="w-full border-b border-gray-300 text-xs py-1 focus:outline-none focus:border-[#001733] bg-transparent placeholder-gray-400 text-[#001733]"
                        />
                    </div>
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`text-[#001733] hover:text-[#e5002b] transition-colors ${isSearchOpen ? 'text-[#e5002b]' : ''}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </div>

                {isSearchOpen && searchQuery && (
                    <div className="absolute top-full right-0 mt-3 w-72 bg-white shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto rounded-sm">
                        {searchResults.length > 0 ? (
                            searchResults.map(article => (
                                <Link
                                    key={article.id}
                                    to={`/article/${article.id}`}
                                    className="block p-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors group"
                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                >
                                    <span className="text-[9px] font-black text-[#e5002b] uppercase tracking-widest mb-1 block">{article.category}</span>
                                    <h4 className="text-xs font-bold text-[#001733] line-clamp-2 group-hover:text-[#e5002b] transition-colors">{article.title}</h4>
                                </Link>
                            ))
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-xs text-gray-400 font-medium">No results found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                )}
             </div>

             {isLoggedIn ? (
               <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-[#001733] hover:text-[#e5002b] transition-colors">Dashboard</Link>
             ) : (
               <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-[#001733] hover:text-[#e5002b] transition-colors">Sign In</Link>
             )}
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-full max-w-sm bg-[#001733] text-white shadow-2xl transform transition-transform duration-500 ease-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex justify-between items-center border-b border-white/10">
            <img src="/logo.png" alt="The Bold East Africa" className="h-10 object-contain" />
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-6">
            <div className="mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e5002b] mb-6">Sections</h3>
              <ul className="space-y-4">
                {categories.map(cat => (
                  <li key={cat.slug}>
                    <Link
                      to={`/category/${cat.slug}`}
                      className="flex items-center justify-between group"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span className="text-lg font-bold text-gray-300 group-hover:text-white transition-colors">{cat.name}</span>
                      <span
                        className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: cat.color || '#e5002b' }}
                      ></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-white/10 pt-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e5002b] mb-6">Account & Network</h3>
               <ul className="space-y-4">
                  {isLoggedIn ? (
                    <li><Link to="/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-3" onClick={() => setIsSidebarOpen(false)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Dashboard
                    </Link></li>
                  ) : (
                    <li><Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-3" onClick={() => setIsSidebarOpen(false)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                      Sign In
                    </Link></li>
                  )}
                  <li><Link to="/subscribe" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-3" onClick={() => setIsSidebarOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    Subscribe
                  </Link></li>
                  <li><Link to="/newsletters" className="text-sm font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-3" onClick={() => setIsSidebarOpen(false)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    Newsletters
                  </Link></li>
               </ul>
            </div>
          </div>
          <div className="p-6 bg-[#001226] border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">© {new Date().getFullYear()} The Bold East Africa</p>
          </div>
        </div>
      </div>
    </header>
  );
};
