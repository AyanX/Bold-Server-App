import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { AdSlot } from '../AdSlot';
import { ArticleCard } from '../ArticleCard';

/**
 * Helper to create SEO-friendly slugs from titles
 */
const createSlug = (title: string) => {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * ArticleDetailView Component
 *
 * Displays detailed view of a single article with related content.
 * Handles article fetching, view tracking, and related articles display.
 */
const ArticleDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all articles first to resolve slug if needed and get related content
        const articlesRes = await api.articles.getAll();
        const all = articlesRes.data;
        setAllArticles(all);

        let targetId = id;

        // If id is a slug (not a number), resolve it to an ID
        if (id && isNaN(Number(id))) {
          const foundArticle = all.find((a: any) => createSlug(a.slug) === id);
          if (foundArticle) {
            targetId = foundArticle.id
          } else {
            console.warn(`Article not found for slug: ${id}`);
            setIsLoading(false);
            return;
          }
        }

        if (targetId) {
          const articleRes = await api.articles.get(targetId);
          setArticle(articleRes.data);

          // Track article view when loaded
          api.articles.trackView(targetId).catch(() => {
            // Silently fail - don't break the page
          });
        }
      } catch (error) {
        console.error('Failed to fetch article', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-bold mb-6">Article Not Found</h2>
        <Link to="/" className="text-[#e5002b] font-bold uppercase tracking-widest hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const relatedFromCategory = allArticles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 4);
  const trendingArticles = allArticles.filter(a => a.id !== article.id).slice(0, 3);

  const processContent = (content: string) => {
    if (!content) return [];
    // Split by double newline for paragraphs
    const rawParagraphs = content.split(/\n\s*\n/);

    return rawParagraphs.map(p => {
      let processed = p.trim();

      // Images: ![alt](url)
      if (processed.startsWith('![') && processed.endsWith(')')) {
        const match = processed.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          return { type: 'image', src: match[2], alt: match[1] };
        }
      }

      // Bold: **text**
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Italic: _text_
      processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');

      // Links: [text](url)
      processed = processed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#e5002b] hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

      // Blockquotes: > text
      if (processed.startsWith('> ')) {
          return { type: 'quote', content: processed.slice(2) };
      }

      return { type: 'paragraph', content: processed };
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="hidden md:block mb-12">
          <AdSlot type="leaderboard" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <article>
              <div className="flex items-center gap-3 mb-6">
                <Link to="/" className="text-xs font-bold uppercase text-gray-400 hover:text-black transition-colors">
                  Home
                </Link>
                <span className="text-gray-300 text-xs">/</span>
                <Link to={`/category/${article.category.toLowerCase()}`} className="text-xs font-bold uppercase text-[#e5002b] tracking-widest hover:underline">
                  {article.category}
                </Link>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-12 text-[#001733]">
                {article.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-gray-100 py-8 mb-12 gap-8">
                <div className="flex items-center gap-5">
                  <img src={article.authorImage || `https://i.pravatar.cc/100?u=${article.author}`} className="w-16 h-16 rounded-full object-cover grayscale" alt={article.author} />
                  <div>
                    <Link to={`/author/${encodeURIComponent(article.author)}`} className="block text-sm font-black uppercase tracking-widest text-black hover:text-[#e5002b] transition-colors">
                      By {article.author}
                    </Link>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-tighter">{article.date} • {article.readTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mr-2">Share</span>
                  {['X', 'FB', 'LN', 'WA'].map(social => (
                    <button key={social} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-xs font-bold transition-all hover:bg-[#001733] hover:text-white hover:border-transparent">
                      {social}
                    </button>
                  ))}
                </div>
              </div>

              <figure className="mb-12">
                <div className="aspect-video w-full overflow-hidden bg-gray-100 rounded-sm shadow-xl">
                  <img src={article.image} className="w-full h-full object-cover" alt={article.title} />
                </div>
                <figcaption className="mt-4 text-xs text-gray-400 font-medium italic border-l-2 border-gray-200 pl-5">
                  Photo Credit: The Bold East Africa Intelligence / Reuters.
                </figcaption>
              </figure>

              <div className="prose prose-xl max-w-none text-gray-800 leading-relaxed space-y-10 font-light tracking-wide">
                <p className="text-2xl md:text-3xl font-serif italic text-gray-500 mb-12 leading-relaxed border-l-4 border-[#001733] pl-10">
                  {article.excerpt}
                </p>

                <div className="article-content text-xl leading-relaxed text-gray-800 font-light tracking-wide">
                  {article.content ? (
                    processContent(article.content).map((block: any, index: number) => {
                      // Inject "Also Read" after 2nd and 5th blocks
                      let injection = null;
                      if (index === 2 && relatedFromCategory.length > 0) {
                         injection = (
                           <div className="my-10 border-y border-gray-100 py-6 bg-gray-50 px-6">
                              <span className="text-xs font-black text-[#e5002b] uppercase tracking-widest block mb-2">Also Read</span>
                              <Link to={`/article/${createSlug(relatedFromCategory[0].title)}`} className="text-xl font-bold text-[#001733] hover:underline leading-tight block">
                                {relatedFromCategory[0].title}
                              </Link>
                           </div>
                         );
                      } else if (index === 5 && relatedFromCategory.length > 1) {
                         injection = (
                           <div className="my-10 border-y border-gray-100 py-6 bg-gray-50 px-6">
                              <span className="text-xs font-black text-[#e5002b] uppercase tracking-widest block mb-2">Related</span>
                              <Link to={`/article/${createSlug(relatedFromCategory[1].title)}`} className="text-xl font-bold text-[#001733] hover:underline leading-tight block">
                                {relatedFromCategory[1].title}
                              </Link>
                           </div>
                         );
                      }

                      let element;
                      if (block.type === 'image') {
                        element = (
                          <figure className="my-10">
                            <img src={block.src} alt={block.alt} className="w-full h-auto rounded-sm" />
                            {block.alt && <figcaption className="mt-2 text-sm text-gray-500 italic text-center">{block.alt}</figcaption>}
                          </figure>
                        );
                      } else if (block.type === 'quote') {
                         element = (
                           <blockquote className="my-10 pl-6 border-l-4 border-[#e5002b] italic text-2xl text-gray-700 font-serif">
                             <div dangerouslySetInnerHTML={{ __html: block.content }} />
                           </blockquote>
                         );
                      } else {
                        element = <p className="mb-8" dangerouslySetInnerHTML={{ __html: block.content }} />;
                      }

                      return (
                        <React.Fragment key={index}>
                          {element}
                          {injection}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <div className="text-xl space-y-8 text-gray-500 italic">
                      <p>Full article content is not available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </article>

            <section className="mt-24">
              <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-12">
                <h3 className="text-3xl font-bold uppercase tracking-widest">You May Also Like</h3>
                <Link to="/" className="text-xs font-bold uppercase text-gray-400 hover:text-black">More News &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {relatedFromCategory.map(a => (
                  <ArticleCard key={a.id} article={a} layout="grid" />
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 flex flex-col gap-16">
            <div className="sticky top-28 space-y-16">
              <div className="bg-gray-50 p-10 rounded-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#001733] border-b border-gray-200 pb-3 mb-8">More in {article.category}</h3>
                <div className="space-y-8">
                  {relatedFromCategory.slice(0, 3).map(a => (
                    <div key={a.id} className="group border-b border-gray-100 last:border-0 pb-8 last:pb-0">
                      <Link to={`/article/${createSlug(a.title)}`}>
                        <span className="text-[10px] font-bold text-[#e5002b] uppercase tracking-widest mb-2 block">{a.date}</span>
                        <h4 className="text-xl font-bold leading-snug group-hover:text-[#001733] transition-colors">{a.title}</h4>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              
              <AdSlot type="banner" />

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#001733] border-b border-black pb-3 mb-8">Trending Now</h3>
                <div className="space-y-8">
                  {trendingArticles.map((a, i) => (
                    <div key={a.id} className="flex gap-6 group cursor-pointer">
                      <div className="text-5xl font-extrabold text-gray-100 group-hover:text-gray-200 transition-colors">0{i + 1}</div>
                      <div>
                        <Link to={`/article/${createSlug(a.title)}`}>
                          <h4 className="font-bold text-lg leading-tight mb-3 group-hover:text-[#e5002b] transition-colors">{a.title}</h4>
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{a.category}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ArticleDetailView;
