import React, { useState } from "react";

interface DashboardAnalyticsProps {
  data: any;
  logs: any[];
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  data,
  logs,
}) => {
  const [timeRange, setTimeRange] = useState<"daily" | "monthly">("daily");
  const [locationView, setLocationView] = useState<"global" | "kenya">(
    "global",
  );

  const stats = data?.stats || {};
  const deviceBreakdown = data?.deviceBreakdown || [];
  const topLocations = data?.topLocations || [];
  const kenyaCounties = data?.kenyaCounties || [];
  const articlesByCategory = data?.articlesByCategory || [];
  const dailyPageViews = data?.dailyPageViews || [];
  const monthlyPageViews = data?.monthlyPageViews || [];
  const liveTraffic = data?.liveTraffic || [];

  // Determine which data to show for growth
  const growthData = timeRange === "daily" ? dailyPageViews : monthlyPageViews;
  const maxViews = Math.max(...growthData.map((d: any) => d.pageViews || 0), 1);


  // Helper to get top countries for live traffic graph

  function getTopCountries(data : any[], limit = 4) {
  return Object.values(
    data.reduce((acc, item) => {
      const country = item.country ?? "Unknown";

      if (!acc[country]) {
        acc[country] = {
          country,
          count: 0,
        };
      }

      acc[country].count += item.count;

      return acc;
    }, {})
  )
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, limit);
}




  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Page Views",
            value: stats.totalPageViews || 0,
            change: "+12%",
            trend: "up",
            color: "text-[#001733]",
          },
          {
            label: "Unique Visitors",
            value: stats.uniqueVisitors || 0,
            change: "+5%",
            trend: "up",
            color: "text-[#001733]",
          },
          {
            label: "Today's Views",
            value: stats.todayPageViews || 0,
            change: "Live",
            trend: "neutral",
            color: "text-[#e5002b]",
          },
          {
            label: "Total Articles",
            value: stats.totalArticles || 0,
            change: `+${stats.recentActivity || 0} this week`,
            trend: "up",
            color: "text-[#001733]",
          },
        ].map((metric, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              {metric.label}
            </p>
            <div className="flex items-end justify-between">
              <h3 className={`text-3xl font-black ${metric.color}`}>
                {metric.value.toLocaleString()}
              </h3>
              <span
                className={`text-xs font-bold ${metric.trend === "up" ? "text-green-500" : metric.trend === "down" ? "text-red-500" : "text-blue-500"}`}
              >
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audience Growth Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-sm shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#001733]">
              Audience Growth
            </h3>
            <div className="flex bg-gray-100 rounded-sm p-1">
              <button
                onClick={() => setTimeRange("daily")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${timeRange === "daily" ? "bg-white shadow-sm text-[#001733]" : "text-gray-400 hover:text-gray-600"}`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange("monthly")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${timeRange === "monthly" ? "bg-white shadow-sm text-[#001733]" : "text-gray-400 hover:text-gray-600"}`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="h-64 flex items-end gap-2 sm:gap-4">
            {growthData.map((item: any, i: number) => {
              const height =
                maxViews > 0 ? (item.pageViews / maxViews) * 100 : 0;

              return (
                <div
                  key={i}
                  className="flex-1 h-full flex flex-col justify-end group relative"
                >
                  {/* BAR */}
                  <div
                    className="w-full bg-[#501733] rounded-t-sm transition-all duration-500 group-hover:bg-[#e5002b] relative"
                    style={{ height: `${height}%` }}
                  >
                    {/* TOOLTIP */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                      {item.pageViews} Views
                      <br />
                      {item.visitors.toLocaleString()} Visitors
                    </div>
                  </div>

                  {/* LABEL */}
                  <span className="text-[9px] font-bold text-gray-400 text-center mt-2 uppercase tracking-tighter truncate">
                    {timeRange === "daily" ? item.date : item.shortMonth}
                  </span>
                </div>
              );
            })}

            {growthData.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs italic">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#001733] mb-6">
            Device Breakdown
          </h3>
          <div className="space-y-6">
            {deviceBreakdown.map((device: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-600 flex items-center gap-2">
                    {device.label === "Desktop" && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {device.label === "Mobile" && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {device.label === "Tablet" && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {device.label}
                  </span>
                  <span className="text-xs font-black text-[#001733]">
                    {device.val}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${device.val}%`,
                      backgroundColor: device.color,
                    }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">
                  {device.count.toLocaleString()} sessions
                </p>
              </div>
            ))}
            {deviceBreakdown.length === 0 && (
              <p className="text-center text-gray-400 text-xs italic py-4">
                No device data.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Global Traffic */}
        <div className="bg-[#001733] text-white rounded-sm shadow-lg p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-sm font-black uppercase tracking-widest">
              Live Global Traffic
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                Live
              </span>
            </div>
          </div>

          {/* Simplified World Map Representation */}
          <div className="relative h-64 w-full bg-[#002244] rounded border border-white/10 mb-4">
            {/* Grid lines for map effect */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* World Map SVG Silhouette (Simplified) */}
            <svg
              className="absolute inset-0 w-full h-full text-white/5 pointer-events-none"
              fill="currentColor"
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
            >
              <path d="M20,15 Q25,10 30,15 T40,15 T50,20 T60,15 T70,10 T80,15 T90,20 V40 H10 V20 Z" />
              {/* This is just a placeholder shape, a real map SVG path would be complex */}
            </svg>

            {liveTraffic.map((visit: any, i: number) => (
              <div
                key={i}
                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 group cursor-pointer"
                style={{ top: visit.top, left: visit.left }}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e5002b] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e5002b]"></span>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-[#001733] text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                  {visit.country} ({visit.count})
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {getTopCountries(liveTraffic).slice(0, 4).map((visit: any, i: number) => (
              <div
                key={i}
                className="flex justify-between border-b border-white/10 pb-1"
              >
                <span className="text-gray-400">{visit.country}</span>
                <span className="font-bold">{visit.count} active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations Table */}
        <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#001733]">
              Top Locations
            </h3>
            <div className="flex bg-gray-100 rounded-sm p-1">
              <button
                onClick={() => setLocationView("global")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${locationView === "global" ? "bg-white shadow-sm text-[#001733]" : "text-gray-400 hover:text-gray-600"}`}
              >
                Global
              </button>
              <button
                onClick={() => setLocationView("kenya")}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${locationView === "kenya" ? "bg-white shadow-sm text-[#001733]" : "text-gray-400 hover:text-gray-600"}`}
              >
                Kenya (47)
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-64">
            <table className="w-full text-left">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Region
                  </th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                    Users
                  </th>
                  <th className="p-3 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(locationView === "global" ? topLocations : kenyaCounties).map(
                  (loc: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-xs font-bold text-[#001733]">
                        {locationView === "global" ? (
                          <span className="flex items-center gap-2">
                            <span className="text-gray-400 font-normal">
                              {i + 1}.
                            </span>{" "}
                            {loc.country}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span className="text-gray-400 font-normal">
                              {i + 1}.
                            </span>{" "}
                            {loc.county}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs font-medium text-gray-600 text-right">
                        {loc.count.toLocaleString()}
                      </td>
                      <td className="p-3 text-xs font-medium text-gray-600 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>{loc.percentage}</span>
                          <div className="w-12 bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-[#001733] h-full"
                              style={{ width: loc.percentage }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
                {(locationView === "global" ? topLocations : kenyaCounties)
                  .length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-4 text-center text-xs text-gray-400 italic"
                    >
                      No location data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Articles by Category */}
      <div className="bg-white border border-gray-100 rounded-sm shadow-sm p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#001733] mb-6">
          Content Performance by Category
        </h3>
        <div className="space-y-4">
          {articlesByCategory.map((cat: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-gray-700">{cat.category}</span>
                <span className="font-bold text-[#001733]">
                  {cat.count} articles
                </span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-1000"
                  style={{
                    width: `${(cat.count / (stats.totalArticles || 1)) * 100}%`,
                    backgroundColor: cat.color || "#001733",
                  }}
                ></div>
              </div>
            </div>
          ))}
          {articlesByCategory.length === 0 && (
            <p className="text-center text-gray-400 text-xs italic py-4">
              No category data available.
            </p>
          )}
        </div>
      </div>

      {/* System Logs */}
      <div className="bg-white border border-gray-100 rounded-sm shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#001733]">
            System Activity
          </h3>
        </div>
        <div className="flex-grow overflow-y-auto max-h-[300px] p-4 space-y-4">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <div
                className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${log.level === "error" ? "bg-red-500" : "bg-blue-500"}`}
              ></div>
              <div>
                <p className="font-bold text-gray-700">{log.action}</p>
                <p className="text-gray-400">
                  {log.user} • {log.timestamp || log.time}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-gray-400 text-sm italic py-10">
              No recent activity.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
