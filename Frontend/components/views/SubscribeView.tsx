import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SubscribeView Component
 *
 * Displays subscription plans with pricing and features.
 * Handles navigation to checkout for selected plans.
 */
const SubscribeView: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: 'Digital Access',
      price: 'Free',
      period: 'Forever',
      features: ['Limited Monthly Articles', 'Standard Newsletters', 'Public Forums', 'Ads Included'],
      cta: 'Get Started',
      accent: '#94a3b8'
    },
    {
      id: 'premium',
      name: 'Premium Intelligence',
      price: '$19',
      period: 'per month',
      features: ['Unlimited Article Access', 'No Advertisements', 'Exclusive "Prime" Content', 'Daily Intelligence Brief', 'Weekly Market Deep-dives'],
      cta: 'Go Premium',
      accent: '#e5002b',
      featured: true
    },
    {
      id: 'corporate',
      name: 'Corporate Suite',
      price: '$99',
      period: 'per month',
      features: ['Up to 10 User Licenses', 'Full API Access', 'Deep Analytics Dashboard', 'Priority Editorial Support', 'Quarterly Strategy Reports'],
      cta: 'Contact Sales',
      accent: '#001733'
    }
  ];

  return (
    <div className="bg-white pb-20">
      <div className="bg-[#001733] text-white py-24 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-black logo-brand italic mb-8">Invest in Your Intelligence</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
          Join over 250,000 global leaders who rely on The Bold East Africa for high-fidelity business reporting and strategic analysis.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border-2 p-10 flex flex-col transition-all duration-300 transform hover:-translate-y-2 ${plan.featured ? 'border-[#e5002b] shadow-2xl relative z-10' : 'border-gray-100 shadow-xl'}`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e5002b] text-white text-xs font-black uppercase tracking-widest px-6 py-2">
                  Most Popular
                </div>
              )}
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-6xl font-bold text-[#001733]">{plan.price}</span>
                <span className="text-gray-400 text-lg font-medium">{plan.period}</span>
              </div>
              <ul className="space-y-5 mb-12 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-4 text-base text-gray-600 font-light">
                    <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate(`/checkout/${plan.id}`)}
                className="w-full py-5 text-sm font-black uppercase tracking-widest transition-colors"
                style={{ backgroundColor: plan.accent, color: 'white' }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscribeView;
