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

interface AdSlotProps {
  type: 'banner' | 'leaderboard' | 'mrec';
  scrollable?: boolean;
}

// Map frontend type to backend type
const typeMap: Record<string, string> = {
  'leaderboard': 'Leaderboard',
  'banner': 'Banner',
  'mrec': 'MREC',
};

// Memoized to prevent unnecessary re-renders
export const AdSlot: React.FC<AdSlotProps> = memo(({ type, scrollable = false }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAds = async () => {
      try {
        const backendType = typeMap[type] || type;
        const res = await api.campaigns.getActive(backendType);
        if (mounted && res.data && res.data.length > 0) {
          if (scrollable) {
            // Use all ads if scrollable
            setAds(res.data);
          } else {
            // Get random ad from active ads of this type
            const randomAd = res.data[Math.floor(Math.random() * res.data.length)];
            setAds([randomAd]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ad:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAds();

    return () => { mounted = false; };
  }, [type, scrollable]);

  useEffect(() => {
    if (!scrollable || ads.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [scrollable, ads.length]);

  // Size classes based on ad type
  const sizeClasses = {
    leaderboard: 'h-[90px] w-full max-w-[728px]',
    banner: 'h-[50px] w-full max-w-[320px]',
    mrec: 'h-[250px] w-full max-w-[300px]',
  };

  const currentAd = ads[currentIndex];

  // Show placeholder if no active ad
  if (!currentAd || !currentAd.image) {
    return (
      <div className={`mx-auto bg-gray-50 flex flex-col items-center justify-center border border-gray-100 overflow-hidden relative ${sizeClasses[type]}`}>
        <span className="absolute top-0 left-0 bg-gray-200 text-[8px] px-1 text-gray-500 uppercase">Advertisement</span>
        <div className="text-gray-300 text-xs font-medium tracking-widest text-center px-4">
          PREMIUM PARTNER CONTENT<br/>
          <span className="text-[10px]">Your Ad Could Be Here</span>
        </div>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none"></div>
        )}
      </div>
    );
  }

  // Display actual ad
  return (
    <div className={`mx-auto overflow-hidden relative ${sizeClasses[type]}`}>
      {ads.map((ad, index) => {
        const adUrl = ad.targetUrl || ad.target_url;
        const isVisible = index === currentIndex;

        return (
          <a
            key={ad.id}
            href={adUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full h-full cursor-pointer absolute inset-0 transition-opacity duration-1000 ${isVisible ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            title={ad.name}
            onClick={(e) => {
              if (!adUrl) {
                e.preventDefault();
              }
            }}
          >
            <img
              src={ad.image}
              alt={ad.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </a>
        );
      })}
      <span className="absolute top-0 left-0 bg-black/50 text-[8px] px-1 text-white/70 uppercase z-20">Ad</span>
      {scrollable && ads.length > 1 && (
        <div className="absolute bottom-1 right-1 flex gap-1 z-20">
          {ads.map((_, idx) => (
            <span key={idx} className={`w-1 h-1 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40'}`}></span>
          ))}
        </div>
      )}
    </div>
  );
});

AdSlot.displayName = 'AdSlot';
