# Analytics Endpoints

## POST /api/analytics/track

Track page view with detailed device and location info.

### Request Body
```json
{
  "session_id": "unique-session-id-12345",
  "page_url": "https://example.com/articles/my-article",
  "page_title": "My Article Title",
  "referrer": "https://google.com/search?q=...",
  "device_type": "mobile",
  "browser": "Chrome",
  "os": "iOS",
  "screen_width": 375
}
```

### Response (201 Created)
```json
{
  "message": "Page view tracked",
  "id": 1,
  "status": 201
}
```

### Response (500 Server Error)
```json
{
  "message": "Failed to track page view: error details",
  "status": 500
}
```

### Fields
- `session_id`: required, string (unique identifier for user session)
- `page_url`: optional, string (full URL of page)
- `page_title`: optional, string (page title)
- `referrer`: optional, string (referrer URL)
- `device_type`: optional, string (mobile, tablet, desktop)
- `browser`: optional, string (Chrome, Firefox, Safari, etc.)
- `os`: optional, string (iOS, Android, Windows, macOS, Linux)
- `screen_width`: optional, integer (screen width in pixels)

### Processing Logic
```javascript
// 1. Extract IP address (handle proxies)
const ip = req.headers['x-forwarded-for']?.split(',')[0] 
  || req.socket.remoteAddress;

// 2. Auto-detect if not provided
const userAgent = req.get('user-agent');
if (!device_type) device_type = detectDevice(userAgent);
if (!browser) browser = detectBrowser(userAgent);
if (!os) os = detectOS(userAgent);

// 3. Get geolocation from IP (use free service like ip-api.com)
const location = await getLocationFromIP(ip); 
// Returns: { country, countryCode, region, city, lat, lon }

// 4. Store in database
const pageView = await PageView.create({
  session_id: session_id,
  ip_address: ip,
  country: location.country,
  country_code: location.countryCode,
  region: location.region,
  city: location.city,
  latitude: location.lat,
  longitude: location.lon,
  device_type: device_type,
  browser: browser,
  os: os,
  page_url: page_url,
  page_title: page_title,
  referrer: referrer,
  created_at: now()
});
```

### Device Detection
```javascript
const detectDevice = (userAgent) => {
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad|kindle/i.test(userAgent)) return 'tablet';
  return 'desktop';
};

const detectBrowser = (userAgent) => {
  if (/Chrome/i.test(userAgent) && !/Chromium/i.test(userAgent)) return 'Chrome';
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari';
  if (/Firefox/i.test(userAgent)) return 'Firefox';
  if (/Edge/i.test(userAgent)) return 'Edge';
  return 'Other';
};

const detectOS = (userAgent) => {
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';
  if (/iPhone|iPad/i.test(userAgent)) return 'iOS';
  if (/Android/i.test(userAgent)) return 'Android';
  return 'Other';
};
```

---

## GET /api/analytics/dashboard

Get comprehensive dashboard metrics.

### Response (200 OK)
```json
{
  "data": {
    "stats": {
      "totalArticles": 156,
      "totalUsers": 25,
      "totalCategories": 8,
      "activeCampaigns": 3,
      "primeArticles": 12,
      "headlineArticles": 5,
      "recentActivity": 45,
      "totalPageViews": 45230,
      "todayPageViews": 1250,
      "uniqueVisitors": 8923
    },
    "audienceGrowth": [
      { "date": "2026-01-20", "visitors": 150 },
      { "date": "2026-01-21", "visitors": 175 }
    ],
    "dailyPageViews": [
      { "date": "2026-01-20", "views": 1050 },
      { "date": "2026-01-21", "views": 1200 }
    ],
    "monthlyPageViews": [
      { "month": "2026-01", "views": 35000 }
    ],
    "deviceBreakdown": {
      "mobile": 45,
      "tablet": 15,
      "desktop": 40
    },
    "topLocations": [
      { "country": "Kenya", "code": "KE", "visitors": 5000 },
      { "country": "Uganda", "code": "UG", "visitors": 1500 }
    ],
    "kenyaCounties": [
      { "county": "Nairobi", "visitors": 3000 },
      { "county": "Mombasa", "visitors": 800 }
    ],
    "articlesByCategory": [
      { "category": "Technology", "count": 45, "color": "#FF6B6B" }
    ],
    "usersByRole": {
      "Admin": 2,
      "Editor": 5,
      "Contributor": 12,
      "Viewer": 6
    },
    "liveTraffic": [
      { "page_title": "Home", "visitors": 15 },
      { "page_title": "Article 1", "visitors": 8 }
    ]
  },
  "status": 200
}
```

### Logic
1. Count totals:
   - Total articles
   - Total users
   - Total categories
   - Active campaigns (status = 'Active')
   - Prime articles (is_prime = true)
   - Headline articles (is_headline = true)
   - Recent activity (last 7 days)
   - Total page views
   - Today page views (today's date)
   - Unique visitors (distinct session_id count)

2. Calculate growth metrics:
   - Audience growth (past 30 days)
   - Daily page views (past 30 days)
   - Monthly page views

3. Device breakdown:
   - Count by device_type from page_views

4. Top locations:
   - Group by country, order by count DESC

5. Kenya counties:
   - Filter country_code = 'KE'
   - Group by city/county

6. Articles by category:
   - Group by category, count articles

7. Users by role:
   - Group by role, count users

8. Live traffic:
   - Last 1 hour page views
   - Group by page_title
   - Order by count DESC, limit 10

---

## GET /api/analytics/logs

Get activity logs (paginated).

### Query Parameters
```
?page=1           - Page number (default: 1)
?limit=50         - Records per page (default: 50)
?type=login       - Filter by action type
?days=7           - Filter by days (default: 30)
```

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "action": "login",
      "resource": "User",
      "resource_id": 1,
      "description": "User logged in",
      "changes": null,
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-01-26T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "per_page": 50,
    "last_page": 25
  },
  "status": 200
}
```

### Logic
1. Filter activity logs:
   - By type if provided
   - By date range (default: last 30 days)
2. Order by created_at DESC
3. Paginate with limit and offset
4. Return logs with pagination info

### Database Schema (activity_logs)
```
id, user_id, user_name, action, resource, resource_id,
description, changes, ip_address, user_agent, created_at
```

---

## GET /api/analytics/active-visitors

Get current active visitors.

### Response (200 OK)
```json
{
  "data": {
    "active_now": 42,
    "visitors": [
      {
        "session_id": "unique-id-123",
        "page_title": "Article Title",
        "device_type": "mobile",
        "country": "Kenya",
        "entered_at": "2026-01-26T10:25:00Z"
      }
    ]
  },
  "status": 200
}
```

### Logic
1. Find page views with created_at >= last 5 minutes
2. Group by session_id (unique visitors)
3. Get most recent page for each session
4. Return count and visitor details

---

## Database Schema

```sql
CREATE TABLE page_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  country VARCHAR(100),
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  page_url VARCHAR(2048),
  page_title VARCHAR(500),
  referrer VARCHAR(2048),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (session_id),
  INDEX (created_at),
  INDEX (country_code)
);

CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  user_name VARCHAR(255),
  action VARCHAR(100),
  resource VARCHAR(100),
  resource_id INT,
  description TEXT,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (created_at),
  INDEX (action)
);
```

---

## Frontend Integration Example

```javascript
// Track page view on page load
const trackPageView = () => {
  const sessionId = getOrCreateSessionId();
  
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer,
      screen_width: window.innerWidth
    })
  }).catch(err => console.error('Analytics error:', err));
};

// Call on page load
document.addEventListener('DOMContentLoaded', trackPageView);

// Get or create session ID
const getOrCreateSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Display dashboard
const loadDashboard = async () => {
  const res = await fetch('/api/analytics/dashboard');
  const { data } = await res.json();
  
  // Update UI with data
  document.querySelector('#total-articles').textContent = data.stats.totalArticles;
  document.querySelector('#total-views').textContent = data.stats.totalPageViews;
  
  // Render charts (use Chart.js or similar)
  renderLineChart('#daily-views', data.dailyPageViews);
  renderPieChart('#device-breakdown', data.deviceBreakdown);
};
```

---

**Next**: Review settings endpoints in 07-SETTINGS.md
