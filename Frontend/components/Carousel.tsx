
import React, { useRef } from 'react';

interface CarouselProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Carousel: React.FC<CarouselProps> = ({ title, children, icon }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 bg-[#001c37] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-bold uppercase tracking-widest headline">{title}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 border border-white/20 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scroll('right')} className="p-2 border border-white/20 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef} 
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x"
        >
          {children}
        </div>
      </div>
    </section>
  );
};
