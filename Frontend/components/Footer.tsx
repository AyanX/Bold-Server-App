import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface CategoryItem {
  name: string;
  slug: string;
}

// Fallback categories in case API fails
const FALLBACK_CATEGORIES = [
  { name: 'Latest News', slug: 'latest' },
  { name: 'Politics', slug: 'politics' },
  { name: 'Corporate', slug: 'corporate' },
  { name: 'Health', slug: 'health' },
  { name: 'Startup & Tech', slug: 'startup-tech' },
];

export const Footer: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.categories.getAll();
        if (res.data && res.data.length > 0) {
          setCategories(res.data.map((cat: any) => ({
            name: cat.name,
            slug: cat.slug
          })));
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-[#001733] text-white pt-10 pb-6 border-t-4 border-[#e5002b]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Footer Top: Subscribe CTA */}
        <div className="mb-8 bg-white/5 p-5 rounded-sm border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold headline mb-1">Unlock Premium Intelligence</h3>
            <p className="text-gray-400 text-sm">Join the network of leaders shaping East Africa's future.</p>
          </div>
          <Link
            to="/subscribe"
            className="bg-[#e5002b] text-white px-8 py-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#001733] transition-all transform hover:-translate-y-1 shadow-lg"
          >
            Subscribe Now
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="text-2xl font-black logo-brand italic mb-4">The Bold East Africa</div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5 max-w-sm font-light">
              The premier destination for business and financial intelligence across East Africa. 
              Delivering data-driven insights for the modern decision-maker.
            </p>
            <div className="flex gap-4">
               {['fb', 'tw', 'ln', 'ig'].map(icon => (
                 <a key={icon} href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center rounded-full transition-colors">
                   <span className="text-[10px] uppercase font-bold">{icon}</span>
                 </a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#e5002b] mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.slug} className="text-sm text-gray-400 hover:text-white transition-colors">
                  <Link to={`/category/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#e5002b] mb-4">Membership</h4>
            <ul className="space-y-2">
              <li className="text-sm text-white font-bold hover:text-gray-200">
                <Link to="/subscribe">Subscribe</Link>
              </li>
              {['Help Center', 'Corporate Access', 'Partner Content', 'Work with us'].map(link => (
                <li key={link} className="text-sm text-gray-400 hover:text-white transition-colors">
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#e5002b] mb-4">Tools</h4>
            <ul className="space-y-2">
              {['ePaper', 'Newsletters', 'Events', 'Archive', 'The Bold TV'].map(link => (
                <li key={link} className="text-sm text-gray-400 hover:text-white transition-colors">
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] text-gray-500 font-medium uppercase tracking-widest">
          <div>© {new Date().getFullYear()} The Bold East Africa Media Group. All Rights Reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};