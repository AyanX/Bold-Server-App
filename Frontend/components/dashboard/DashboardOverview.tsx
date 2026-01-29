import React from 'react';

/**
 * DashboardOverview Component
 *
 * Displays the executive overview dashboard with KPIs, top stories, and system health.
 * Shows real-time metrics and editorial workflow status.
 */
interface DashboardOverviewProps {
  articles: any[];
  analyticsData: any;
  systemStats: any;
  overviewPage: number;
  setOverviewPage: (page: number) => void;
  ITEMS_PER_PAGE: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  articles,
  analyticsData,
  systemStats,
  overviewPage,
  setOverviewPage,
  ITEMS_PER_PAGE
}) => {
  // Sort articles by views for "Top Performing" section
  const sortedArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
  const paginatedOverviewArticles = sortedArticles.slice((overviewPage - 1) * ITEMS_PER_PAGE, overviewPage * ITEMS_PER_PAGE);

  const stats = analyticsData?.stats || {};

  // Use real data or fallbacks
  const liveVisitors = stats.activeVisitors || 0;

  const editorialStats = {
    drafts: articles.filter(a => a.status === 'Draft').length,
    review: articles.filter(a => a.status === 'Scheduled').length,
    published: articles.filter(a => a.status === 'Published').length,
    total: articles.length || 1
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Bar: Welcome & Live Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-[#001733] tracking-tight">Executive Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time insights and editorial performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-sm shadow-sm flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <div>
              <span className="block text-lg font-black text-[#001733] leading-none">{liveVisitors}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Readers</span>
            </div>
          </div>
          <button onClick={() => window.print()} className="bg-[#001733] text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#002855] transition-colors shadow-lg">
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Pageviews', value: (stats.totalPageViews || 0).toLocaleString(), change: '+12.5%', trend: 'up', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
          { label: 'Unique Visitors', value: (stats.uniqueVisitors || 0).toLocaleString(), change: '+5.2%', trend: 'up', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { label: "Today's Views", value: (stats.todayPageViews || 0).toLocaleString(), change: 'Live', trend: 'neutral', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' },
          { label: 'Total Articles', value: (stats.totalArticles || 0).toLocaleString(), change: '+4 this week', trend: 'up', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-gray-50 rounded-md text-[#001733] group-hover:bg-[#001733] group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-black text-[#001733] mb-1">{stat.value}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Top Stories */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-[#001733]">Top Performing Stories</h3>
            <div className="flex gap-2">
              <button className="text-xs font-bold text-gray-400 hover:text-[#001733]">24h</button>
              <button className="text-xs font-bold text-[#001733] underline">7d</button>
              <button className="text-xs font-bold text-gray-400 hover:text-[#001733]">30d</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-black uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4 text-center">Views</th>
                  <th className="px-6 py-4 text-center">Engagement</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOverviewArticles.map((article, idx) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-black text-gray-200 group-hover:text-[#e5002b] transition-colors w-6">0{idx + 1}</span>
                        <div>
                          <div className="font-bold text-[#001733] line-clamp-1 max-w-xs group-hover:text-[#e5002b] transition-colors">{article.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{article.category} • By {article.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-[#001733]">{(article.views || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-24 bg-gray-100 h-1.5 rounded-full mx-auto overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm ${article.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {article.status || 'Published'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Editorial & System */}
        <div className="space-y-8">
          {/* Editorial Board */}
          <div className="bg-[#001733] text-white p-6 rounded-sm shadow-lg">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Editorial Board</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Drafts in Progress</span>
                <span className="text-lg font-bold">{editorialStats.drafts}</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full" style={{ width: `${(editorialStats.drafts / editorialStats.total) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-gray-300">Pending Review</span>
                <span className="text-lg font-bold">{editorialStats.review}</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${(editorialStats.review / editorialStats.total) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-gray-300">Published</span>
                <span className="text-lg font-bold">{editorialStats.published}</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${(editorialStats.published / editorialStats.total) * 100}%` }}></div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-[#e5002b] hover:bg-white hover:text-[#001733] text-xs font-black uppercase tracking-widest transition-colors">
              Manage Workflow
            </button>
          </div>

          {/* System Health */}
          <div className="bg-white p-6 border border-gray-100 shadow-sm rounded-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#001733] mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">PHP Version</span>
                <span className="font-bold text-[#001733]">{systemStats?.system?.php_version?.split('-')[0] || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Database</span>
                <span className={`font-bold ${systemStats?.database ? 'text-green-600' : 'text-red-600'}`}>{systemStats?.database ? 'Connected' : 'Error'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Framework</span>
                <span className="font-bold text-[#001733]">Laravel {systemStats?.system?.laravel_version || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">DB Size</span>
                <span className="font-bold text-gray-700">{systemStats?.storage?.database_size || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
