# Campaigns/Ads Management Endpoints

## GET /api/campaigns

List all campaigns (admin).

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Q1 Product Launch",
      "company": "TechCorp Inc",
      "type": "Banner",
      "status": "Active",
      "price": 5000.00,
      "invoice": "INV-2026-001",
      "image": "https://cdn.example.com/campaigns/banner.jpg",
      "target_url": "https://example.com/product",
      "start_date": "2026-01-01T00:00:00Z",
      "end_date": "2026-03-31T23:59:59Z",
      "impressions": 25000,
      "clicks": 1250,
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-26T10:30:00Z"
    }
  ],
  "status": 200
}
```

### Logic
1. Get all campaigns
2. Order by created_at DESC
3. Return all fields

---

## POST /api/campaigns

Create campaign.

### Request Body
```json
{
  "name": "New Campaign",
  "company": "CompanyName",
  "type": "Banner",
  "status": "Scheduled",
  "price": 5000,
  "invoice": "INV-2026-002",
  "image": "https://cdn.example.com/image.jpg",
  "targetUrl": "https://example.com/product",
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "impressions": 0,
  "clicks": 0
}
```

### Response (201 Created)
```json
{
  "data": {
    "id": 2,
    "name": "New Campaign",
    "company": "CompanyName",
    "type": "Banner",
    "status": "Scheduled",
    "price": 5000,
    "invoice": "INV-2026-002",
    "image": "https://cdn.example.com/image.jpg",
    "target_url": "https://example.com/product",
    "start_date": "2026-02-01T00:00:00Z",
    "end_date": "2026-02-28T23:59:59Z",
    "impressions": 0,
    "clicks": 0,
    "created_at": "2026-01-26T10:30:00Z"
  },
  "message": "Campaign created successfully",
  "status": 201
}
```

### Response (422 Validation)
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "type": ["The type field is required."]
  },
  "status": 422
}
```

### Validation
All fields except name and type are optional and nullable.

- `name`: required, string, max 255
- `company`: optional, string, max 255
- `type`: required, string
- `status`: optional, string (Active, Scheduled, Paused, Expired), default: Scheduled
- `price`: optional, numeric
- `invoice`: optional, string
- `image`: optional, string (URL or base64)
- `targetUrl`: optional, string (will be mapped to target_url)
- `startDate`: optional, date string (will be mapped to start_date)
- `endDate`: optional, date string (will be mapped to end_date)
- `impressions`: optional, numeric, default: 0
- `clicks`: optional, numeric, default: 0

### Pre-processing
```javascript
const cleanInput = (data) => {
  // Convert empty strings and arrays to null
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === []) {
      data[key] = null;
    }
  });
  return data;
};

// Then map camelCase to snake_case
const mapRequest = (data) => ({
  name: data.name,
  company: data.company || null,
  type: data.type,
  status: data.status || 'Scheduled',
  price: data.price ? parseFloat(data.price) : null,
  invoice: data.invoice || null,
  image: data.image || null,
  target_url: data.targetUrl || null,
  start_date: data.startDate || null,
  end_date: data.endDate || null,
  impressions: data.impressions || '0',
  clicks: data.clicks || '0'
});
```

### Logic
1. Clean input
2. Validate
3. Map camelCase to snake_case
4. Create campaign
5. Return created campaign

---

## GET /api/campaigns/{id}

Get single campaign.

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "name": "Q1 Product Launch",
    "company": "TechCorp Inc",
    "type": "Banner",
    "status": "Active",
    "price": 5000.00,
    "invoice": "INV-2026-001",
    "image": "https://cdn.example.com/campaigns/banner.jpg",
    "target_url": "https://example.com/product",
    "start_date": "2026-01-01T00:00:00Z",
    "end_date": "2026-03-31T23:59:59Z",
    "impressions": 25000,
    "clicks": 1250,
    "created_at": "2026-01-20T10:00:00Z"
  },
  "status": 200
}
```

---

## PATCH /api/campaigns/{id}

Update campaign.

### Request Body
```json
{
  "status": "Active",
  "impressions": 26000,
  "clicks": 1300
}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "status": "Active",
    "impressions": 26000,
    "clicks": 1300,
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Campaign updated successfully",
  "status": 200
}
```

### Validation
All fields optional

### Pre-processing
Same as POST, map camelCase to snake_case

### Logic
1. Find campaign by ID (404 if not found)
2. Clean and validate input
3. Map camelCase to snake_case
4. Update only provided fields
5. Return updated campaign

---

## DELETE /api/campaigns/{id}

Delete campaign.

### Response (200 OK)
```json
{
  "message": "Campaign deleted successfully",
  "status": 200
}
```

---

## GET /api/ads/active

Get active ads for public display (frontend).

### Query Parameters
```
?type=Banner        - Filter by campaign type (optional)
```

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Q1 Campaign",
      "company": "TechCorp",
      "type": "Banner",
      "status": "Active",
      "price": 5000,
      "image": "https://cdn.example.com/ad.jpg",
      "target_url": "https://example.com/product",
      "impressions": 25000,
      "clicks": 1250
    }
  ],
  "status": 200
}
```

### Logic
1. Filter campaigns where:
   - status = 'Active'
   - start_date IS NULL OR start_date <= NOW()
   - end_date IS NULL OR end_date >= NOW()
2. If type provided: add filter type = ?
3. Order by random
4. Return campaigns

### Implementation (Prisma example)
```javascript
const activeAds = await prisma.campaign.findMany({
  where: {
    status: 'Active',
    OR: [
      { start_date: null },
      { start_date: { lte: new Date() } }
    ],
    AND: [
      {
        OR: [
          { end_date: null },
          { end_date: { gte: new Date() } }
        ]
      }
    ],
    ...(type && { type })
  }
});

// Shuffle result
return activeAds.sort(() => Math.random() - 0.5);
```

---

## POST /api/ads/{id}/impression

Track ad impression (view).

### Request Body
```json
{
  "session_id": "unique-session-identifier"
}
```

### Response (201 Created)
```json
{
  "data": {
    "campaign_id": 1,
    "impressions": 25001,
    "session_id": "unique-session-identifier"
  },
  "message": "Impression tracked",
  "status": 201
}
```

### Logic
1. Find campaign by ID
2. Increment impressions counter
3. Store impression record (optional, for detailed analytics)
4. Return updated campaign

### Implementation
```javascript
// Just increment:
await Campaign.update(
  { id: campaignId },
  { impressions: sequelize.literal('impressions + 1') }
);

// Or Prisma:
await prisma.campaign.update({
  where: { id: campaignId },
  data: { impressions: { increment: 1 } }
});
```

---

## POST /api/ads/{id}/click

Track ad click.

### Request Body
```json
{
  "session_id": "unique-session-identifier"
}
```

### Response (201 Created)
```json
{
  "data": {
    "campaign_id": 1,
    "clicks": 1251,
    "session_id": "unique-session-identifier"
  },
  "message": "Click tracked",
  "status": 201
}
```

### Logic
Same as impression, but increment clicks

---

## Database Schema

```sql
CREATE TABLE campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  type VARCHAR(100),
  status VARCHAR(50),
  price DECIMAL(10, 2),
  invoice VARCHAR(255),
  image LONGTEXT,
  target_url TEXT,
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional: Detailed impression/click tracking
CREATE TABLE ad_impressions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT,
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE TABLE ad_clicks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT,
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
```

---

## Frontend Integration Example

```javascript
// Display ad
const showAd = async (type) => {
  const res = await fetch(`/api/ads/active?type=${type}`);
  const { data } = await res.json();
  
  if (data.length > 0) {
    const ad = data[0]; // Get first (already randomized)
    
    // Track impression
    fetch(`/api/ads/${ad.id}/impression`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Display ad with click handler
    document.querySelector('.ad-slot').innerHTML = `
      <a href="${ad.target_url}" 
         onclick="trackClick(${ad.id})"
         target="_blank">
        <img src="${ad.image}" alt="${ad.name}">
      </a>
    `;
  }
};

const trackClick = (adId) => {
  fetch(`/api/ads/${adId}/click`, {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
    headers: { 'Content-Type': 'application/json' }
  });
};
```

---

**Next**: Review category management in 05-CATEGORIES.md
