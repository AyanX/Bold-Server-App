import { useEffect, useState } from 'react';
import { api } from '../../services/api';

/**
 * Custom hook for managing dashboard data fetching and state.
 * Handles loading states and error handling for dashboard components.
 */
export const useDashboardData = (isLoggedIn: boolean) => {
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedArticles, fetchedUsers, fetchedCategories, fetchedAds, fetchedLogs, fetchedAnalytics] = await Promise.all([
          api.articles.getAll(),
          api.users.getAll(),
          api.categories.getAll(),
          api.campaigns.getAll(),
          api.analytics.getLogs(),
          api.analytics.getDashboardMetrics()
        ]);

        setArticles(fetchedArticles.data);
        setUsers(fetchedUsers.data);
        setCategories(fetchedCategories.data);
        setAds(fetchedAds.data);
        setLogs(fetchedLogs.data);
        setAnalyticsData(fetchedAnalytics.data);
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

  return {
    isLoading,
    articles,
    users,
    categories,
    ads,
    logs,
    analyticsData,
    setArticles,
    setUsers,
    setCategories,
    setAds,
    setLogs,
    setAnalyticsData
  };
};
