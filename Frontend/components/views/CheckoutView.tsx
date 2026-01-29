import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * CheckoutView Component
 *
 * Handles subscription checkout process with payment form.
 * Simulates payment processing and redirects on success.
 */
const CheckoutView: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.setItem('isSubscribed', 'true');
      localStorage.setItem('subscriptionPlan', planId || 'free');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-5xl font-bold mb-6 text-[#001733]">Welcome to the Inner Circle</h1>
        <p className="text-gray-500 text-xl max-w-lg mx-auto mb-12 font-light leading-relaxed">
          Your {planId} subscription is now active. You have full access to our premium intelligence and data insights on The Bold East Africa.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#001733] text-white px-12 py-5 text-sm font-black uppercase tracking-widest hover:bg-black transition-colors"
        >
          Explore Your Intelligence
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-10">
          <h2 className="text-4xl font-bold text-[#001733]">Complete Your Subscription</h2>
          <div className="bg-white p-10 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Order Summary</h3>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold capitalize">{planId} Plan Access</span>
              <span className="text-lg font-bold">{planId === 'premium' ? '$19.00' : planId === 'corporate' ? '$99.00' : '$0.00'}</span>
            </div>
            <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-widest">Total Due Today</span>
              <span className="text-3xl font-bold text-[#e5002b]">{planId === 'premium' ? '$19.00' : planId === 'corporate' ? '$99.00' : '$0.00'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 border border-gray-100 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Full Name</label>
              <input required className="w-full border border-gray-200 py-4 px-5 text-base focus:outline-none focus:border-[#001733]" placeholder="Johnathan Doe" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Card Number</label>
              <div className="relative">
                <input required className="w-full border border-gray-200 py-4 px-5 text-base focus:outline-none focus:border-[#001733]" placeholder="4242 4242 4242 4242" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Expiry Date</label>
                <input required className="w-full border border-gray-200 py-4 px-5 text-base focus:outline-none focus:border-[#001733]" placeholder="MM / YY" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">CVC</label>
                <input required className="w-full border border-gray-200 py-4 px-5 text-base focus:outline-none focus:border-[#001733]" placeholder="123" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#001733] text-white py-5 text-sm font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-4"
            >
              {isProcessing ? 'Authorizing...' : 'Confirm & Pay'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
