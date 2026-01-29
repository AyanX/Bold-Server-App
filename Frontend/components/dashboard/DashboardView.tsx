import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardHeader } from '../DashboardHeader';
import { DashboardFooter } from '../DashboardFooter';
import { api } from '../../services/api';
import { Pagination } from '../Pagination';
import DashboardOverview from './DashboardOverview';
import DashboardArticles from './DashboardArticles';
import DashboardCategories from './DashboardCategories';
import DashboardUsers from './DashboardUsers';
import DashboardSettings from './DashboardSettings';
import DashboardAds from './DashboardAds';
import DashboardAnalytics from './DashboardAnalytics';

/**
 * DashboardView Component
 *
 * Main dashboard container that manages all dashboard functionality.
 * Handles state management, API calls, and renders appropriate dashboard sections.
 */
const DashboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'ads' | 'analytics' | 'categories' | 'users' | 'settings' | 'logs'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [overviewPage, setOverviewPage] = useState(1);
  const [adsPage, setAdsPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const ADS_PER_PAGE = 4;
  const [ads, setAds] = useState<any[]>([]);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isArticlePreviewModalOpen, setIsArticlePreviewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isCategoryPreviewModalOpen, setIsCategoryPreviewModalOpen] = useState(false);
  const [isCampaignPreviewModalOpen, setIsCampaignPreviewModalOpen] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({
    name: '',
    company: '',
    type: 'Leaderboard',
    price: '',
    invoice: '',
    image: '',
    targetUrl: '',
    status: 'Scheduled',
    startDate: '',
    endDate: ''
  });
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [seoScore, setSeoScore] = useState(0);
  const [plagiarismStatus, setPlagiarismStatus] = useState<'idle' | 'checking' | 'clean' | 'detected'>('idle');
  const [profileData, setProfileData] = useState({
    name: 'Admin Root',
    email: 'info@belfortech.dev',
    bio: 'System administrator with full access rights.',
    notifications: {
      email: true,
      push: false,
      weeklyReport: true
    },
    password: 'Test#123',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedArticles, fetchedUsers, fetchedCategories, fetchedAds, fetchedLogs, fetchedAnalytics, fetchedSystemStats] = await Promise.all([
          api.articles.getAll(),
          api.users.getAll(),
          api.categories.getAll(),
          api.campaigns.getAll(),
          api.analytics.getLogs(),
          api.analytics.getDashboardMetrics(),
          api.settings.getSystemStats()
        ]);

        setArticles(fetchedArticles.data);
        setUsers(fetchedUsers.data);
        setCategories(fetchedCategories.data);
        setAds(fetchedAds.data);
        setLogs(fetchedLogs.data);
        setAnalyticsData(fetchedAnalytics.data);
        setSystemStats(fetchedSystemStats.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Handler functions (simplified for brevity - would include full implementations)
  const handleViewArticle = async (article: any) => {
    setSelectedArticle(article);
    setIsArticlePreviewModalOpen(true);
    try {
      await api.articles.trackView(article.id);
      setArticles(prev => prev.map(a =>
        a.id === article.id ? { ...a, views: (a.views || 0) + 1 } : a
      ));
    } catch (error) {
      console.debug('Failed to track article view:', error);
    }
  };

  const handleViewCategory = (category: any) => {
    setSelectedCategory(category);
    setIsCategoryPreviewModalOpen(true);
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview
            articles={articles}
            analyticsData={analyticsData}
            systemStats={systemStats}
            overviewPage={overviewPage}
            setOverviewPage={setOverviewPage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          />
        );
      case 'articles':
        return (
          <DashboardArticles
            articles={articles}
            setArticles={setArticles}
            categories={categories}
            onView={handleViewArticle}
          />
        );
      case 'categories':
        return (
          <DashboardCategories
            categories={categories}
            setCategories={setCategories}
          />
        );
      case 'users':
        return (
          <DashboardUsers
            users={users}
            setUsers={setUsers}
            articles={articles}
          />
        );
      case 'settings':
        return (
          <DashboardSettings
            profileData={profileData}
            setProfileData={setProfileData}
          />
        );
      case 'ads':
        return (
          <DashboardAds
            ads={ads}
            setAds={setAds}
          />
        );
      case 'analytics':
        return (
          <DashboardAnalytics
            data={analyticsData || {}}
            logs={logs || []}
          />
        );
      default:
        return <div>Tab not implemented yet</div>;
    }
  };

  const processPreviewContent = (content: string) => {
    if (!content) return [];
    const rawParagraphs = content.split(/\n\s*\n/);
    return rawParagraphs.map((p, idx) => {
      let processed = p.trim();

      // Images
      if (processed.startsWith('![') && processed.endsWith(')')) {
        const match = processed.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) return <figure key={idx} className="my-8"><img src={match[2]} alt={match[1]} className="w-full rounded-sm" /><figcaption className="text-center text-xs text-gray-500 mt-2 italic">{match[1]}</figcaption></figure>;
      }

      // Headers
      if (processed.startsWith('## ')) return <h2 key={idx} className="text-2xl font-bold text-[#001733] mt-8 mb-4">{processed.slice(3)}</h2>;
      if (processed.startsWith('### ')) return <h3 key={idx} className="text-xl font-bold text-[#001733] mt-6 mb-3">{processed.slice(4)}</h3>;

      // Quotes
      if (processed.startsWith('> ')) return <blockquote key={idx} className="border-l-4 border-[#e5002b] pl-4 italic text-xl text-gray-700 my-8 font-serif">{processed.slice(2)}</blockquote>;

      // Inline formatting (Bold, Italic, Link) - Simple replacement for preview
      // Note: For a real app, use a proper markdown parser library. This is a basic visual preview.
      let htmlContent = processed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="#" class="text-[#e5002b] hover:underline">$1</a>');

      return <p key={idx} className="mb-6 text-lg leading-relaxed text-gray-800 font-light" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <DashboardHeader onTabChange={setActiveTab} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-grow relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          w-72 bg-[#001c37] text-white flex flex-col
          fixed inset-y-0 left-0 z-40 lg:static lg:h-[calc(100vh-64px)] lg:translate-x-0
          transition-transform duration-300 ease-in-out overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-6 lg:hidden border-b border-white/10">
             <span className="text-lg font-black italic">Menu</span>
             <button onClick={() => setIsSidebarOpen(false)} className="text-white/60 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <nav className="flex-grow py-4 lg:py-10 px-6 space-y-3">
            {[
              { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { id: 'articles', label: 'Articles', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
              { id: 'categories', label: 'Categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { id: 'users', label: 'User Mgmt', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { id: 'ads', label: 'Sponsorships', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
              { id: 'analytics', label: 'Intelligence', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 text-sm font-bold uppercase tracking-widest rounded-sm transition-all ${activeTab === tab.id ? 'bg-[#e5002b] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col h-[calc(100vh-64px)] overflow-y-auto w-full">
          <main className="p-8 lg:p-16 flex-grow">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h2 className="text-3xl font-black capitalize text-[#001733]">{activeTab}</h2>
                <p className="text-gray-400 text-sm mt-1">Manage your {activeTab} and view performance metrics.</p>
              </div>
            </header>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001733]"></div>
              </div>
            ) : (
              renderContent()
            )}
          </main>
          <DashboardFooter />
        </div>
      </div>

      {/* Article Preview Modal */}
      {isArticlePreviewModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#001733]">Article Preview</h3>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-sm">Read Mode</span>
                    </div>
                    <button onClick={() => setIsArticlePreviewModalOpen(false)} className="text-gray-400 hover:text-black">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 md:p-16 bg-white">
                    <article className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-xs font-bold uppercase text-gray-400">Home</span>
                            <span className="text-gray-300 text-xs">/</span>
                            <span className="text-xs font-bold uppercase text-[#e5002b] tracking-widest">{selectedArticle.category}</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#001733] mb-8 leading-[1.1]">{selectedArticle.title}</h1>

                        <div className="flex items-center justify-between border-y border-gray-100 py-6 mb-10">
                            <div className="text-sm font-black uppercase tracking-widest text-black">By {selectedArticle.author}</div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-tighter">{selectedArticle.date || 'Just now'} • {selectedArticle.readTime || '5 min read'}</div>
                        </div>

                        {selectedArticle.image && (
                            <figure className="mb-10">
                                <div className="aspect-video w-full overflow-hidden bg-gray-100 rounded-sm shadow-lg">
                                    <img src={selectedArticle.image} className="w-full h-full object-cover" alt={selectedArticle.title} />
                                </div>
                                <figcaption className="mt-3 text-xs text-gray-400 font-medium italic border-l-2 border-gray-200 pl-4">Featured Image</figcaption>
                            </figure>
                        )}

                        <div className="prose prose-xl max-w-none">
                            <p className="text-2xl font-serif italic text-gray-500 mb-10 leading-relaxed border-l-4 border-[#001733] pl-8">
                                {selectedArticle.excerpt}
                            </p>
                            <div className="article-content">
                                {processPreviewContent(selectedArticle.content)}
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
