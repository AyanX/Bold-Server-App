import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from './ArticleCard';
import { Carousel } from './Carousel';
import { AdSlot } from './AdSlot';
import { Category as CategoryEnum, Article } from '../types/models';
import { api } from '../services/api';

// Category mapping - defined outside component to avoid recreation
const categoryMap: { [key: string]: CategoryEnum } = {
  'LATEST NEWS': CategoryEnum.LATEST,
  'LATEST': CategoryEnum.LATEST,
  'POLITICS': CategoryEnum.POLITICS,
  'CORPORATE': CategoryEnum.CORPORATE,
  'HEALTH': CategoryEnum.HEALTH,
  'LAW & ORDER': CategoryEnum.LAW_ORDER,
  'LAW-ORDER': CategoryEnum.LAW_ORDER,
  'STARTUP & TECH': CategoryEnum.STARTUP_TECH,
  'STARTUPS': CategoryEnum.STARTUP_TECH,
  'STARTUP-TECH': CategoryEnum.STARTUP_TECH,
  'CAREER': CategoryEnum.CAREER,
  'SPORTS': CategoryEnum.SPORTS,
  'OPINION & ANALYSIS': CategoryEnum.OPINION,
  'OPINIONS': CategoryEnum.OPINION,
  'OPINION': CategoryEnum.OPINION,
  'LIFESTYLE': CategoryEnum.LIFESTYLE,
};

const mapCategoryFromAPI = (category: string): CategoryEnum => {
  return categoryMap[category?.toUpperCase()] || CategoryEnum.LATEST;
};

interface SectionHeaderProps {
  title: string;
  accentColor?: string;
  alignment?: 'left' | 'center';
  link?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, accentColor = '#001733', alignment = 'left', link }) => (
  <div className={`flex justify-between items-end border-b pb-3 mb-6 ${alignment === 'center' ? 'flex-col items-center border-b-0' : ''}`} style={{ borderColor: accentColor }}>
    {alignment === 'center' && <div className="h-1 w-20 bg-[#e5002b] mb-3"></div>}
    <h2 className="text-2xl font-black uppercase tracking-tighter headline">{title}</h2>
    {alignment === 'left' && (link ? (
      <Link to={link} className="text-xs font-black uppercase text-gray-400 hover:text-black transition-colors tracking-widest flex items-center gap-2 group">View All <span className="group-hover:translate-x-1 transition-transform">→</span></Link>
    ) : (
      <button className="text-xs font-black uppercase text-gray-400 hover:text-black transition-colors tracking-widest flex items-center gap-2 group">View All <span className="group-hover:translate-x-1 transition-transform">→</span></button>
    ))}
  </div>
);

export const HomeView: React.FC = () => {
  const [currentPrimeIndex, setCurrentPrimeIndex] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.articles.getAll();
        // Map API response to match frontend Article type
        const mappedArticles = (res.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          excerpt: a.excerpt,
          image: a.image,
          category: mapCategoryFromAPI(a.category),
          author: a.author,
          date: new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          readTime: a.read_time,
          isPrime: a.is_prime,
          isHeadline: a.is_headline,
        }));
        setArticles(mappedArticles);
      } catch (error) {
        console.error('Failed to fetch articles', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Memoize all category filtering to avoid recalculation on every render
  const primeArticles = useMemo(() => articles.filter(a => a.isPrime), [articles]);
  const currentPrimeArticle = primeArticles[currentPrimeIndex];

  const latestNews = useMemo(() => articles.filter(a => a.category === CategoryEnum.LATEST), [articles]);
  const trendingArticles = useMemo(() =>
    articles.filter(a => !a.isHeadline && a.category !== CategoryEnum.LATEST && a.category !== CategoryEnum.OPINION).slice(0, 5),
    [articles]
  );

  const politicsArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.POLITICS), [articles]);
  const corporateArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.CORPORATE), [articles]);
  const startupTechArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.STARTUP_TECH), [articles]);
  const lifestyleCategories = useMemo(() => [CategoryEnum.LIFESTYLE, CategoryEnum.SPORTS, CategoryEnum.HEALTH, CategoryEnum.CAREER, CategoryEnum.STARTUP_TECH], []);
  const lifestyleArticles = useMemo(() => articles.filter(a => lifestyleCategories.includes(a.category as any as CategoryEnum)), [articles, lifestyleCategories]);
  const opinionArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.OPINION), [articles]);
  const lawArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.LAW_ORDER), [articles]);
  const sportsArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.SPORTS), [articles]);
  const healthArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.HEALTH), [articles]);
  const careerArticles = useMemo(() => articles.filter(a => a.category === CategoryEnum.CAREER), [articles]);

  const handleArticleClick = (id: string) => {
    try {
      if (api.articles && 'trackClick' in api.articles && typeof (api.articles as any).trackClick === 'function') {
        (api.articles as any).trackClick(id);
      }
    } catch (error) {
      // Ignore tracking errors
    }
  };

  useEffect(() => {
    if (primeArticles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPrimeIndex((prev) => (prev + 1) % primeArticles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [primeArticles.length]);

  if (loading) {
    return (
      <main className="pb-12">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Hero skeleton */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
            <div className="lg:col-span-6">
              <div className="aspect-[16/9] bg-gray-200 rounded-sm mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="border-b border-gray-100 pb-3">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-3 border-b border-gray-100 pb-3">
                  <div className="w-16 h-16 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Section skeleton */}
          <section className="mt-12 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div className="aspect-[16/10] bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-8">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 relative">
            <div className="transition-all duration-700 ease-in-out">
              {currentPrimeArticle && <ArticleCard key={currentPrimeArticle.id} article={currentPrimeArticle} layout="headline" />}
            </div>
          </div>
          <div className="lg:col-span-3 border-t md:border-t-0 border-gray-100/50 md:pl-6" style={{ borderLeftWidth: '0.5px', borderLeftColor: 'rgba(175, 176, 171, 0.3)' }}>
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#e5002b] mb-4 border-b border-gray-100/50 pb-2">Latest News</h3>
             <div className="flex flex-col gap-4">
                {latestNews.slice(0, 5).map(article => (
                  <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="group block border-b border-gray-100/50 pb-3 last:border-0">
                    <h4 className="text-base font-bold headline leading-snug group-hover:text-[#e5002b] transition-colors cursor-pointer line-clamp-2 mb-2">{article.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>{article.date}</span>
                      <span className="hover:text-[#e5002b] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      </span>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
          <div className="lg:col-span-3 border-t lg:border-t-0 border-gray-100/50 lg:pl-6" style={{ borderLeftWidth: '0.5px', borderLeftColor: 'rgba(175, 176, 171, 0.3)' }}>
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#001733] mb-4 border-b border-gray-100/50 pb-2">Trending</h3>
             <div className="flex flex-col gap-4">
                {trendingArticles.map(article => (
                  <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="flex gap-3 group cursor-pointer border-b border-gray-100/30 pb-3 last:border-0">
                    <div className="w-16 h-16 shrink-0 bg-gray-100 overflow-hidden rounded-sm relative">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-bold headline leading-tight line-clamp-2 mb-1 group-hover:text-[#e5002b] transition-colors">{article.title}</h4>
                       <div className="flex items-center justify-between text-[10px] text-gray-400">
                         <span>{article.date}</span>
                         <span className="hover:text-[#e5002b] transition-colors">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                         </span>
                       </div>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </section>

        {/* 1. POLITICS */}
        <section className="mt-10 pt-3">
          <SectionHeader title="Politics" accentColor="rgba(175, 176, 171, 0.3)" link="/category/politics" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Grid */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Two Articles */}
                {politicsArticles.slice(0, 2).map(article => (
                  <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="group cursor-pointer block">
                    <div className="aspect-[16/10] overflow-hidden mb-2">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{article.category}</span>
                    <h3 className="text-xl font-bold headline leading-snug mt-1 group-hover:text-[#001733] transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                {/* Bottom Four Articles */}
                {politicsArticles.slice(2, 6).map(article => (
                  <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="group cursor-pointer block">
                    <div className="aspect-[16/10] overflow-hidden mb-2">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h4 className="text-sm font-bold headline leading-snug mt-1 group-hover:text-[#001733] transition-colors">
                      {article.title}
                    </h4>
                    <span className="text-xs text-gray-400 mt-1">{article.date}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Ad Sidebar */}
            <div className="lg:col-span-3 border-t lg:border-t-0 border-gray-100/50 lg:pl-6 space-y-4" style={{ borderLeftWidth: '0.5px', borderLeftColor: 'rgba(175, 176, 171, 0.3)' }}>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100/50 pb-2">Advertisement</h3>
              <div className="bg-gray-50 h-64 flex items-center justify-center">
                <AdSlot type="mrec" />
              </div>
              <div className="bg-gray-50 h-64 flex items-center justify-center">
                 <AdSlot type="mrec" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. CORPORATE - REDESIGNED EXECUTIVE GRID */}
        <section className="mt-10 pt-2">
          <SectionHeader title="Corporate" accentColor="rgba(175, 176, 171, 0.3)" link="/category/corporate" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-100/50">
            {corporateArticles.slice(0, 4).map((article, idx) => (
              <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className={`group p-5 flex flex-col bg-white border-gray-100/50 transition-colors hover:bg-gray-50 ${idx < 3 ? 'lg:border-r' : ''}`}>
                 <div className="aspect-square w-full mb-4 overflow-hidden bg-gray-100">
                    <img src={article.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                 </div>
                 <div className="flex-grow">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2 block">Focus: Boardroom</span>
                    <h4 className="text-lg font-bold headline leading-tight group-hover:text-[#001733] mb-2">{article.title}</h4>
                 </div>
                 <div className="pt-4 border-t border-gray-100/50 mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <Link to={`/author/${encodeURIComponent(article.author)}`} className="text-gray-400 hover:text-[#e5002b] transition-colors">
                      {article.author}
                    </Link>
                    <span className="text-[#e5002b]">{article.readTime}</span>
                 </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. STARTUP & TECH */}
        <section className="mt-10 bg-[#eeeeee] py-10 px-4">
              <div className="flex justify-between items-center mb-8 border-b border-white/50 pb-4">
                <h2 className="text-2xl font-black text-[#001733] tracking-tight uppercase">STARTUP & TECH</h2>
                <Link to="/category/startup-tech" className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#001733] flex items-center gap-2 group transition-colors">
                  VIEW ALL <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {startupTechArticles.slice(0, 4).map((article) => (
                  <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="group block">
                    <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-200">
                      <img src={article.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={article.title} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <Link to={`/author/${encodeURIComponent(article.author)}`} className="hover:text-[#e5002b] transition-colors">
                          {article.author}
                        </Link>
                        <div className="flex items-center gap-3">
                          <span>{article.date}</span>
                          <button className="flex items-center gap-1 hover:text-[#e5002b] transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="text-base font-bold leading-snug text-[#001733] group-hover:text-[#001733]/70 transition-colors">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
        </section>

        {/* 4. ENTERTAINMENT & LIFESTYLE */}
        <section className="mt-10 pt-2">
          <SectionHeader title="Entertainment & Lifestyle" accentColor="rgba(175, 176, 171, 0.3)" link="/category/lifestyle" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Grid */}
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Large Article (Left) */}
                {lifestyleArticles[0] && (
                  <Link to={`/article/${lifestyleArticles[0].id}`} onClick={() => handleArticleClick(lifestyleArticles[0].id)} className="md:col-span-2 row-span-2 group cursor-pointer block">
                    <div className="aspect-[16/10] overflow-hidden mb-2 relative">
                      <img src={lifestyleArticles[0].image} alt={lifestyleArticles[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{lifestyleArticles[0].category}</span>
                    <h3 className="text-2xl font-bold headline leading-snug mt-1 group-hover:text-red-600 transition-colors">
                      {lifestyleArticles[0].title}
                    </h3>
                     <p className="text-gray-500 text-sm mt-2 line-clamp-2">{lifestyleArticles[0].excerpt}</p>
                  </Link>
                )}

                {/* Top Right Article */}
                {lifestyleArticles[1] && (
                  <Link to={`/article/${lifestyleArticles[1].id}`} onClick={() => handleArticleClick(lifestyleArticles[1].id)} className="group cursor-pointer block">
                    <div className="aspect-[16/10] overflow-hidden mb-2 relative">
                      <img src={lifestyleArticles[1].image} alt={lifestyleArticles[1].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{lifestyleArticles[1].category}</span>
                    <h4 className="text-base font-bold headline leading-snug mt-1 group-hover:text-red-600 transition-colors">
                      {lifestyleArticles[1].title}
                    </h4>
                  </Link>
                )}

                {/* Bottom three articles */}
                {lifestyleArticles.slice(2, 5).map(article => (
                   <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="group cursor-pointer block">
                    <div className="aspect-[16/10] overflow-hidden mb-2 relative">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider">{article.category}</span>
                    <h4 className="text-base font-bold headline leading-snug mt-1 group-hover:text-red-600 transition-colors">
                      {article.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Sidebar */}
            <div className="lg:col-span-3 border-t lg:border-t-0 border-gray-100/50 lg:pl-6" style={{ borderLeftWidth: '0.5px', borderLeftColor: 'rgba(175, 176, 171, 0.3)' }}>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#001733] mb-4 border-b border-gray-200/50 pb-2">Trending</h3>
              <div className="flex flex-col gap-4">
                {trendingArticles.slice(0, 5).map((article, index) => (
                  <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="flex gap-4 items-start group cursor-pointer border-b border-gray-100/50 pb-3 last:border-0">
                    <span className="text-2xl font-bold text-gray-300 group-hover:text-red-600 transition-colors">0{index + 1}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold headline leading-tight line-clamp-3 group-hover:text-red-600 transition-colors">{article.title}</h4>
                      <div className="flex items-center text-[10px] text-gray-400 mt-1">
                        <span>{article.date}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. OPINIONS & ANALYSIS */}
        <section className="mt-10 bg-[#fafafa] -mx-4 px-4 py-10 border-y border-gray-100/50">
          <div className="max-w-7xl mx-auto">
             <SectionHeader title="Opinions & Analysis" accentColor="rgba(175, 176, 171, 0.3)" link="/category/opinion" />
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
               <div className="lg:col-span-7 bg-white p-8 shadow-sm border border-gray-100/50 relative group cursor-pointer overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017V14C19.017 11.2386 16.7784 9 14.017 9V7C17.8829 7 21.017 10.134 21.017 14V21H14.017ZM3.01697 21L3.01697 18C3.01697 16.8954 3.9124 16 5.01697 16H8.01697V14C8.01697 11.2386 5.77839 9 3.01697 9V7C6.88294 7 10.017 10.134 10.017 14V21H3.01697Z"/></svg>
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <img src={opinionArticles[0]?.image} className="w-20 h-20 rounded-full border-4 border-[#e5002b]/10 object-cover" alt="" />
                      <div>
                        <Link to={`/author/${encodeURIComponent(opinionArticles[0]?.author)}`} className="block text-base font-black text-[#001733] uppercase tracking-widest hover:text-[#e5002b] transition-colors">
                          {opinionArticles[0]?.author}
                        </Link>
                        <span className="text-sm text-gray-400 font-medium">Contributing Editor</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold headline mb-4 italic leading-tight group-hover:text-[#e5002b] transition-colors tracking-tight">
                      "{opinionArticles[0]?.title}"
                    </h3>
                    <p className="text-base text-gray-500 font-light leading-relaxed mb-6 line-clamp-3 italic">
                      {opinionArticles[0]?.excerpt}
                    </p>
                    <Link to={`/article/${opinionArticles[0]?.id}`} onClick={() => handleArticleClick(opinionArticles[0]?.id)} className="text-sm font-black uppercase tracking-[0.2em] text-[#001733] border-b-2 border-[#001733] pb-1 hover:text-[#e5002b] hover:border-[#e5002b] transition-all">Read Full Column</Link>
                  </div>
               </div>
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderLeftWidth: '0.5px', borderLeftColor: 'rgba(175, 176, 171, 0.3)' }}>
                  {opinionArticles.slice(1, 5).map(article => (
                    <div key={article.id} className="bg-white p-4 border border-gray-100/50 group cursor-pointer flex flex-col">
                       <div className="flex items-center gap-2 mb-3">
                          <img src={article.image} className="w-8 h-8 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                          <Link to={`/author/${encodeURIComponent(article.author)}`} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#e5002b] transition-colors">
                            {article.author}
                          </Link>
                       </div>
                       <Link to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="text-base font-bold headline group-hover:text-[#001733] transition-colors mb-3 line-clamp-3 block">
                         {article.title}
                       </Link>
                       <span className="mt-auto text-[9px] font-bold text-[#e5002b] uppercase tracking-widest">{article.date}</span>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        </section>

        {/* 6. LAW & ORDER */}
        <section className="mt-10 pt-2">
          <SectionHeader title="Law & Order" accentColor="rgba(175, 176, 171, 0.3)" link="/category/law-order" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lawArticles.slice(0, 4).map(article => (
              <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className="group cursor-pointer block">
                <div className="aspect-[16/10] overflow-hidden mb-2">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{article.category}</span>
                <h3 className="text-xl font-bold headline leading-snug mt-1 group-hover:text-[#001733] transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{article.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. SPORTS - Redesigned */}
        <section className="mt-10 pt-2 text-left">
          <SectionHeader title="Sports" accentColor="rgba(175, 176, 171, 0.3)" link="/category/sports" />

          {sportsArticles.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Featured Article */}
              <div className="lg:col-span-8">
                <Link to={`/article/${sportsArticles[0]?.id}`} onClick={() => handleArticleClick(sportsArticles[0]?.id)} className="block relative group overflow-hidden h-[400px] lg:h-[500px]">
                  <img
                    src={sportsArticles[0]?.image}
                    alt={sportsArticles[0]?.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[#e5002b] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                        Sports
                      </span>
                      <span className="text-white/60 text-xs">{sportsArticles[0]?.date}</span>
                    </div>
                    <h3 className="text-2xl lg:text-4xl font-black text-white headline leading-tight mb-3 group-hover:text-[#e5002b] transition-colors">
                      {sportsArticles[0]?.title}
                    </h3>
                    <p className="text-white/70 text-sm lg:text-base line-clamp-2 max-w-2xl">
                      {sportsArticles[0]?.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
                      <span className="font-bold">{sportsArticles[0]?.author}</span>
                      <span>{sportsArticles[0]?.readTime}</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Sidebar with More Sports */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Secondary Articles Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 flex-1">
                  {sportsArticles.slice(1, 4).map((article, index) => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      onClick={() => handleArticleClick(article.id)}
                      className={`group relative overflow-hidden ${index === 0 ? 'col-span-2 lg:col-span-1 h-[180px]' : 'h-[140px] lg:h-[150px]'}`}
                    >
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-sm lg:text-base font-bold text-white headline leading-tight line-clamp-2 group-hover:text-[#e5002b] transition-colors">
                          {article.title}
                        </h4>
                        <span className="text-[10px] text-white/50 mt-1 block">{article.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* More Sports Headlines */}
                <div className="bg-[#001733] p-5">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">More Headlines</h3>
                    <span className="w-2 h-2 rounded-full bg-[#e5002b]"></span>
                  </div>
                  <div className="space-y-3">
                    {sportsArticles.slice(4, 7).map((article, index) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.id}`}
                        onClick={() => handleArticleClick(article.id)}
                        className="flex items-start gap-3 group cursor-pointer border-b border-white/5 pb-3 last:border-0"
                      >
                        <span className="text-2xl font-black text-[#e5002b]/30 group-hover:text-[#e5002b] transition-colors">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white/90 leading-tight line-clamp-2 group-hover:text-[#e5002b] transition-colors">
                            {article.title}
                          </h4>
                          <span className="text-[10px] text-white/40 mt-1 block">{article.readTime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/category/sports"
                    className="mt-4 w-full py-3 bg-white/5 hover:bg-[#e5002b] text-xs font-black uppercase tracking-widest text-center transition-colors border border-white/10 block text-white"
                  >
                    View All Sports
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-gradient-to-br from-[#001733] to-[#002244] rounded-lg p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#e5002b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Sports Coverage Coming Soon</h3>
              <p className="text-white/60 max-w-md mx-auto mb-6">
                Stay tuned for the latest sports news, match updates, and exclusive coverage from East Africa and beyond.
              </p>
              <Link
                to="/category/sports"
                className="inline-block px-8 py-3 bg-[#e5002b] hover:bg-[#c70024] text-white text-sm font-black uppercase tracking-widest transition-colors"
              >
                Explore Sports
              </Link>
            </div>
          )}
        </section>

        {/* 8. HEALTH */}
        <section className="mt-10 pt-2 text-left">
          <SectionHeader title="Health Intelligence" accentColor="rgba(175, 176, 171, 0.3)" link="/category/health" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-100/50">
            {healthArticles.slice(0, 3).map((article, i) => (
              <Link key={article.id} to={`/article/${article.id}`} onClick={() => handleArticleClick(article.id)} className={`group cursor-pointer p-5 flex flex-col border-gray-100/50 ${i !== 2 ? 'md:border-r' : ''} hover:bg-white hover:shadow-2xl transition-all relative z-10`}>
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-1 w-full bg-[#001733]/20 group-hover:bg-[#001733] transition-colors"></div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-[#001733] ml-4 whitespace-nowrap">Report 00{i+1}</span>
                </div>
                <div className="aspect-[16/10] bg-gray-50 mb-4 overflow-hidden rounded-sm">
                   <img src={article.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                </div>
                <Link to={`/author/${encodeURIComponent(article.author)}`} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 hover:text-[#e5002b] transition-colors">
                  {article.author}
                </Link>
                <h4 className="text-xl font-bold headline leading-snug group-hover:text-[#001733] transition-colors mb-3">{article.title}</h4>
                <p className="text-gray-500 text-sm font-light leading-relaxed mb-4 line-clamp-3 italic">
                  "{article.excerpt}"
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100/30">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Case Study</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#001733] group-hover:underline">View Abstract &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 10. MARKET & FINANCE */}
        <section className="mt-10 pt-2 text-left">
          <SectionHeader title="Market & Finance" accentColor="rgba(175, 176, 171, 0.3)" link="/category/corporate" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {corporateArticles.map(article => <ArticleCard key={article.id} article={article} layout="compact" />)}
          </div>
        </section>

        <div className="my-10 flex justify-center">
          <AdSlot type="leaderboard" />
        </div>
      </div>

    </main>
  );
};
