
import React from 'react';

export const DashboardFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <div className="flex items-center gap-4">
        <span>&copy; {new Date().getFullYear()} The Bold East Africa Intelligence System</span>
        <span className="h-3 w-px bg-gray-200"></span>
        <span className="text-gray-300 italic">v2.4.0 Stable Build</span>
      </div>
      <div className="flex items-center gap-6 mt-4 md:mt-0">
        <a href="#" className="hover:text-[#001733]">Documentation</a>
        <a href="#" className="hover:text-[#001733]">API Access</a>
        <a href="#" className="hover:text-[#001733]">Support Desk</a>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
           <span className="text-green-600">Cloud Nodes: 100%</span>
        </div>
      </div>
    </footer>
  );
};
