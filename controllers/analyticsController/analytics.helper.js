
const db= require('../../db/db');
const { users, articles, categories, campaigns, pageViews, activityLogs } = require('../../drizzle/schema');
const { eq, count, sql, desc, and, gte, lte } = require('drizzle-orm');

class AnalyticsService {
  static async getDashboardStats() {

    // Basic counts
    const [totalArticles] = await db.select({ count: count() }).from(articles);
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [totalCategories] = await db.select({ count: count() }).from(categories);
    const [activeCampaigns] = await db
      .select({ count: count() })
      .from(campaigns)
      .where(eq(campaigns.status, 'Active'));

    // Article stats
    const [primeArticles] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.is_prime, true));

    const [headlineArticles] = await db
      .select({ count: count() })
      .from(articles)
      .where(eq(articles.is_headline, true));

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      // articles count added in the last 7 days
    const [recentActivity] = await db
      .select({ count: count() })
      .from(articles)
      .where(gte(articles.created_at, sevenDaysAgo));

    // Page view stats
    const [totalPageViews] = await db.select({ count: count() }).from(pageViews);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayPageViews] = await db
      .select({ count: count() })
      .from(pageViews)
      .where(and(gte(pageViews.createdAt, today), lte(pageViews.createdAt, tomorrow)));

    // Unique visitors
    const [uniqueVisitors] = await db
      .select({ count: sql`COUNT(DISTINCT ${pageViews.sessionId})` })
      .from(pageViews);

    return {
      totalArticles: totalArticles.count,
      totalUsers: totalUsers.count,
      totalCategories: totalCategories.count,
      activeCampaigns: activeCampaigns.count,
      primeArticles: primeArticles.count,
      headlineArticles: headlineArticles.count,
      recentActivity: recentActivity.count,
      totalPageViews: totalPageViews.count,
      todayPageViews: todayPageViews.count,
      uniqueVisitors: uniqueVisitors.count,
    };
  }

  static async getAudienceGrowth() {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [visitors] = await db
        .select({ count: sql`COUNT(DISTINCT ${pageViews.sessionId})` })
        .from(pageViews)
        .where(and(gte(pageViews.createdAt, startOfMonth), lte(pageViews.createdAt, endOfMonth)));

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        visitors: visitors.count,
      });
    }
    return months;
  }

  static async getDailyPageViews() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [pageViewsCount] = await db
        .select({ count: count() })
        .from(pageViews)
        .where(and(gte(pageViews.createdAt, startOfDay), lte(pageViews.createdAt, endOfDay)));

      const [uniqueVisitors] = await db
        .select({ count: sql`COUNT(DISTINCT ${pageViews.sessionId})` })
        .from(pageViews)
        .where(and(gte(pageViews.createdAt, startOfDay), lte(pageViews.createdAt, endOfDay)));

      days.push({
        date: date.toLocaleString('default', { weekday: 'short' }),
        fullDate: date.toLocaleString('default', { month: 'short', day: 'numeric' }),
        pageViews: pageViewsCount.count,
        visitors: uniqueVisitors.count,
      });
    }
    return days;
  }

  static async getMonthlyPageViews() {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [pageViewsCount] = await db
        .select({ count: count() })
        .from(pageViews)
        .where(and(gte(pageViews.createdAt, startOfMonth), lte(pageViews.createdAt, endOfMonth)));

      const [uniqueVisitors] = await db
        .select({ count: sql`COUNT(DISTINCT ${pageViews.sessionId})` })
        .from(pageViews)
        .where(and(gte(pageViews.createdAt, startOfMonth), lte(pageViews.createdAt, endOfMonth)));

      months.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        shortMonth: date.toLocaleString('default', { month: 'short' }),
        pageViews: pageViewsCount.count,
        visitors: uniqueVisitors.count,
      });
    }
    return months;
  }

  static async getDeviceBreakdown() {
    const [total] = await db.select({ count: count() }).from(pageViews);

    if (total.count === 0) {
      return [
        { label: 'Desktop', val: 0, count: 0, color: '#001733' },
        { label: 'Mobile', val: 0, count: 0, color: '#e5002b' },
        { label: 'Tablet', val: 0, count: 0, color: '#94a3b8' },
      ];
    }

    const deviceStats = await db
      .select({
        deviceType: pageViews.deviceType,
        count: count(),
      })
      .from(pageViews)
      .groupBy(pageViews.deviceType);

    const deviceMap = new Map(deviceStats.map(d => [d.deviceType, d.count]));
    const colors = {
      desktop: '#001733',
      mobile: '#e5002b',
      tablet: '#94a3b8',
    };

    return ['desktop', 'mobile', 'tablet'].map(device => {
      const count = deviceMap.get(device) || 0;
      return {
        label: device.charAt(0).toUpperCase() + device.slice(1),
        val: Math.round((count / total.count) * 100 * 10) / 10,
        count,
        color: colors[device],
      };
    });
  }

  static async getTopLocations() {
    const [total] = await db
      .select({ count: count() })
      .from(pageViews)
      .where(sql`${pageViews.country} IS NOT NULL`);

    if (total.count === 0) return [];

    const locations = await db
      .select({
        country: pageViews.country,
        countryCode: pageViews.countryCode,
        count: count(),
      })
      .from(pageViews)
      .where(sql`${pageViews.country} IS NOT NULL`)
      .groupBy(pageViews.country, pageViews.countryCode)
      .orderBy(desc(count()))
      .limit(10);

    return locations.map(loc => ({
      country: loc.country,
      countryCode: loc.countryCode,
      count: loc.count,
      percentage: `${Math.round((loc.count / total.count) * 100 * 10) / 10}%`,
    }));
  }

  static async getKenyaCounties() {
    const [total] = await db
      .select({ count: count() })
      .from(pageViews)
      .where(eq(pageViews.countryCode, 'KE'));

    if (total.count === 0) return [];

    const counties = await db
      .select({
        county: pageViews.region,
        count: count(),
      })
      .from(pageViews)
      .where(and(eq(pageViews.countryCode, 'KE'), sql`${pageViews.region} IS NOT NULL`))
      .groupBy(pageViews.region)
      .orderBy(desc(count()))
      .limit(47);

    return counties.map(county => ({
      county: county.county,
      count: county.count,
      percentage: `${Math.round((county.count / total.count) * 100 * 10) / 10}%`,
    }));
  }

  static async getArticlesByCategory() {
    //from categories table, get category name and count of articles in each category
    const categoryStats = await db
  .select({
    name: categories.name,
    articleCount: categories.articleCount,
  })
  .from(categories)
  .orderBy(desc(categories.articleCount))
  .limit(10);

    const colors = ['#e5002b', '#001733', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

    return categoryStats.map((cat, index) => ({
      category: cat.name,
      count: cat.articleCount,
      color: colors[index % colors.length],
    }));
  }

  static async getUsersByRole() {
    const roleStats = await db
      .select({
        role: users.role,
        count: count(),
      })
      .from(users)
      .groupBy(users.role);

    return Object.fromEntries(roleStats.map(r => [r.role, r.count]));
  }

  static async getLiveTraffic() {
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

const recentViews = await db
  .select({
    country: pageViews.country,
    countryCode: pageViews.countryCode,
    latitude: pageViews.latitude,
    longitude: pageViews.longitude,
    count: count(),
  })
  .from(pageViews)
  .where(and(
    sql`${pageViews.latitude} IS NOT NULL`,
    sql`${pageViews.longitude} IS NOT NULL`,
    sql`${pageViews.createdAt} >= UTC_TIMESTAMP() - INTERVAL 15 MINUTE`
  ))
  .groupBy(
    pageViews.country,
    pageViews.countryCode,
    pageViews.latitude,
    pageViews.longitude
  )
  .orderBy(desc(count()))
  .limit(20);




    const liveTraffic= recentViews.map(view => {
      // Convert lat/lon to CSS position percentages
      const top = Math.max(5, Math.min(95, 50 - (Number(view.latitude) / 1.8)));
      const left = Math.max(5, Math.min(95, 50 + (Number(view.longitude) / 3.6)));

      return {
        country: view.country,
        countryCode: view.countryCode,
        count: view.count,
        lat: Number(view.latitude),
        lon: Number(view.longitude),
        top: `${top}%`,
        left: `${left}%`,
      };
    });

    return liveTraffic;

  }
}

module.exports = { AnalyticsService };