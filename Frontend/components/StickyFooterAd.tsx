import React, { useState, useEffect, memo } from 'react';
import { api } from '../services/api';

interface Ad {
  id: number;
  name: string;
  company: string;
  type: string;
  image: string;
  status: string;
  targetUrl?: string;
  target_url?: string;
}

export const StickyFooterAd: React.FC = memo(() => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user previously dismissed the ad this session
    const dismissed = sessionStorage.getItem('footerAdDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    let mounted = true;

    const fetchAds = async () => {
      try {
        const res = await api.campaigns.getActive('Banner');
        if (mounted && res.data && res.data.length > 0) {
          setAds(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch footer ad:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAds();

    return () => { mounted = false; };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('footerAdDismissed', 'true');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Don't render if dismissed or still loading with no ad
  if (isDismissed || (loading && ads.length === 0)) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'translate-y-[calc(100%-40px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse/Expand Tab */}
      <div className="flex justify-center">
        <button
          onClick={toggleCollapse}
          className="bg-[#001733] text-white px-6 py-2 rounded-t-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-[#002855] transition-colors shadow-lg"
        >
          <span>{isCollapsed ? 'Show' : 'Hide'} Ad</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Ad Container */}
      <div className="bg-gradient-to-r from-[#001733] via-[#002244] to-[#001733] border-t-2 border-[#e5002b] shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3 relative">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
            title="Dismiss ad"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar snap-x py-1">
            {/* Ad Label */}
            <div className="shrink-0 sticky left-0 z-10 flex items-center bg-[#001733]/80 backdrop-blur-sm h-full pr-2 rounded-r">
              <span className="text-[8px] text-white/50 uppercase tracking-widest font-bold hidden sm:block">
                Sponsored
              </span>
            </div>

            {ads.map((ad) => {
              const adUrl = ad.targetUrl || ad.target_url;
              return (
                <div key={ad.id} className="shrink-0 snap-center flex items-center gap-4 border-r border-white/10 pr-4 last:border-0 last:pr-0">
                  {/* Ad Content */}
                  <a
                    href={adUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:opacity-90 transition-opacity"
                    onClick={(e) => {
                      if (!adUrl) e.preventDefault();
                    }}
                  >
                    <img
                      src={ad.image}
                      alt={ad.name}
                      className="h-[60px] md:h-[70px] w-auto max-w-[300px] md:max-w-[468px] object-contain"
                      loading="lazy"
                    />
                  </a>

                  {/* CTA Button (optional) */}
                  {adUrl && (
                    <a
                      href={adUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:flex bg-[#e5002b] text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white hover:text-[#001733] transition-all whitespace-nowrap"
                    >
                      Learn More
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

StickyFooterAd.displayName = 'StickyFooterAd';
