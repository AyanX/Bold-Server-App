import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onTabChange?: (tab: any) => void;
  onMenuClick?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onTabChange,
  onMenuClick,
}) => {
  const navigate = useNavigate();

  const userEmail = JSON.parse(
    localStorage.getItem("user") ||
      '{"id":"1","name":"Admin","email":"admin@gmail.com","role":"Admin", "image":"https://i.pravatar.cc/150?u=admin"}',
  );

  const handleSignOut = async () => {
    try {
      await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (e: any) {
      console.error(e.message || "Could not logout");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-50 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-[#001733]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <Link to="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="The Bold East Africa"
            className="h-10 object-contain"
          />
        </Link>
        <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 px-4 py-2 rounded-sm w-96 group focus-within:border-[#001733] focus-within:ring-1 focus-within:ring-[#001733]/10 transition-all">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search articles, authors, or campaigns..."
            className="bg-transparent border-none text-xs ml-3 w-full focus:outline-none placeholder-gray-400 font-medium text-[#001733]"
          />
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[10px] font-bold text-gray-300 border border-gray-200 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-[#001733] relative transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e5002b] rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 group cursor-pointer relative">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#001733]">
              {userEmail.role}
            </span>
            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
              {userEmail.name}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#001733] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
            <img
              src={userEmail.image || "https://i.pravatar.cc/150?u=admin"}
              className="w-full h-full object-cover"
              alt="Profile"
            />
          </div>

          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl opacity-0 group-hover:opacity-100 transition-all invisible group-hover:visible z-50">
            <div className="p-4 border-b border-gray-50">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Signed in as
              </span>
              <span className="block text-xs font-bold text-gray-800 truncate">
                {userEmail.role}
              </span>
            </div>
            <ul className="py-2">
              <li>
                <button
                  onClick={() => onTabChange?.("settings")}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#001733]"
                >
                  Profile Settings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange?.("logs")}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#001733]"
                >
                  System Logs
                </button>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#e5002b] hover:bg-red-50"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};
