import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types/models';
import { api } from '../services/api';

interface ArticleCardProps {
  article: Article;
  layout?: 'headline' | 'grid' | 'list' | 'mini' | 'compact';
}

const LikeIcon = memo(() => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
));
LikeIcon.displayName = 'LikeIcon';

export const ArticleCard: React.FC<ArticleCardProps> = memo(({ article, layout = 'grid' }) => {
  const handleArticleClick = () => {
    try {
      // Track click if API supports it
      if (api.articles && 'trackClick' in api.articles && typeof (api.articles as any).trackClick === 'function') {
        (api.articles as any).trackClick(article.id);
      }
    } catch (error) {
      // Ignore tracking errors
    }
  };

  if (layout === 'headline') {
    return (
      <div className="group cursor-pointer">
        <Link to={`/article/${article.id}`} onClick={handleArticleClick}>
          <div className="relative overflow-hidden aspect-[16/9] md:aspect-[16/8] mb-4 bg-gray-100 rounded-sm">
            <img
              src={article.image}
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {article.isPrime && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-[#e5002b] text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-[0.2em] shadow-2xl">
                  Prime
                </span>
              </div>
            )}
          </div>
          <div>
            <span className="text-xs font-black text-[#e5002b] uppercase tracking-[0.2em] mb-2 block">{article.category}</span>
            <h2 className="text-3xl md:text-4xl font-bold headline leading-tight mb-3 group-hover:text-[#001733] transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-700 text-base leading-relaxed line-clamp-3 mb-4 font-light max-w-4xl">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Link to={`/author/${encodeURIComponent(article.author)}`} className="font-bold text-black hover:text-[#e5002b] transition-colors">
                  {article.author}
                </Link>
                <span>•</span>
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
              <button className="flex items-center gap-1 text-gray-400 hover:text-[#e5002b] transition-colors">
                <LikeIcon />
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="group border-b border-gray-100 py-5 last:border-0 cursor-pointer">
        <Link to={`/article/${article.id}`} className="flex gap-5 items-start" onClick={handleArticleClick}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black text-[#e5002b] uppercase tracking-widest">{article.category}</span>
              {article.isPrime && <span className="text-[10px] bg-[#001733] text-white px-2 py-0.5 font-black uppercase">PRIME</span>}
            </div>
            <h3 className="text-xl font-bold headline leading-tight group-hover:text-[#001733] transition-colors mb-2">
              {article.title}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-2 font-light mb-3 leading-relaxed">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <Link to={`/author/${encodeURIComponent(article.author)}`} className="hover:text-[#e5002b] transition-colors">
                  {article.author}
                </Link>
                <span>•</span>
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
              <button className="flex items-center gap-1 text-gray-400 hover:text-[#e5002b] transition-colors">
                <LikeIcon />
              </button>
            </div>
          </div>
          <div className="w-24 h-24 sm:w-48 sm:h-48 flex-shrink-0 overflow-hidden bg-gray-50 rounded-sm">
            <img src={article.image} alt={article.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        </Link>
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className="group py-3 border-b border-gray-100 last:border-0">
        <Link to={`/article/${article.id}`} className="flex gap-4 items-center" onClick={handleArticleClick}>
          <div className="w-16 h-16 bg-gray-100 shrink-0 overflow-hidden">
            <img src={article.image} alt={article.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-bold headline leading-tight group-hover:text-[#001733] transition-colors line-clamp-2 mb-1">{article.title}</h4>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{article.date}</span>
              <button className="flex items-center text-gray-400 hover:text-[#e5002b] transition-colors">
                <LikeIcon />
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (layout === 'mini') {
    return (
      <div className="group py-3 border-b border-gray-100 last:border-0">
        <Link to={`/article/${article.id}`} onClick={handleArticleClick}>
          <div className="flex gap-2 items-center mb-1">
            <span className="text-[10px] font-black text-[#e5002b] uppercase tracking-widest">{article.category}</span>
            {article.isPrime && <span className="text-[9px] bg-[#001733] text-white px-1 font-black">P</span>}
          </div>
          <h4 className="text-base font-bold headline leading-snug group-hover:text-[#001733] transition-colors mb-1">
            {article.title}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">{article.date}</span>
            <button className="flex items-center text-gray-400 hover:text-[#e5002b] transition-colors">
              <LikeIcon />
            </button>
          </div>
        </Link>
      </div>
    );
  }

  // Default grid layout
  return (
    <div className="group cursor-pointer">
      <Link to={`/article/${article.id}`} onClick={handleArticleClick}>
        <div className="overflow-hidden aspect-[4/3] mb-3 relative bg-gray-50 rounded-sm">
          <img src={article.image} alt={article.title} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          {article.isPrime && (
            <span className="absolute top-3 left-3 bg-[#e5002b] text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest shadow-lg">Prime</span>
          )}
        </div>
        <span className="text-xs font-black text-[#e5002b] uppercase tracking-[0.2em] mb-1 block">{article.category}</span>
        <h3 className="text-lg md:text-xl font-bold headline leading-tight group-hover:text-[#001733] transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 font-light leading-relaxed mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <Link to={`/author/${encodeURIComponent(article.author)}`} className="font-bold text-black hover:text-[#e5002b] transition-colors">
              {article.author}
            </Link>
            <span>•</span>
            <span>{article.date}</span>
          </div>
          <button className="flex items-center hover:text-[#e5002b] transition-colors">
            <LikeIcon />
          </button>
        </div>
      </Link>
    </div>
  );
});

ArticleCard.displayName = 'ArticleCard';
