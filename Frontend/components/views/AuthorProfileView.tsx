import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { ArticleCard } from '../ArticleCard';

/**
 * AuthorProfileView Component
 *
 * Displays author profile with bio and list of their articles.
 * Fetches author articles from API and renders profile information.
 */
const AuthorProfileView: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(name || '');
  const [authorArticles, setAuthorArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.articles.getAll();
        setAuthorArticles(res.data.filter((a: any) => a.author === decodedName));
      } catch (error) {
        console.error('Failed to fetch articles', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [decodedName]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-[#001733] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-32 h-32 mx-auto bg-gray-700 rounded-full mb-6 overflow-hidden border-4 border-[#e5002b]">
            <img src={`https://i.pravatar.cc/150?u=${decodedName}`} alt={decodedName} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-widest mb-4">{decodedName}</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Senior Editor & Contributor at The Bold East Africa. Covering key developments in regional markets and policy.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black uppercase tracking-widest text-[#001733] border-b-2 border-gray-100 pb-4 mb-8">
          Articles by {decodedName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {authorArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {authorArticles.length === 0 && (
          <div className="text-center py-20 text-gray-400">No articles found for this author.</div>
        )}
      </div>
    </div>
  );
};

export default AuthorProfileView;
