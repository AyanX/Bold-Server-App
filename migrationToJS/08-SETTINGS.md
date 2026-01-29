# Settings & Profile Endpoints

## GET /api/settings

Get all settings grouped by category.

### Response (200 OK)
```json
{
  "data": {
    "general": {
      "site_name": "The Bold East Africa",
      "site_description": "News platform",
      "site_url": "https://example.com",
      "support_email": "support@example.com"
    },
    "appearance": {
      "primary_color": "#FF6B6B",
      "secondary_color": "#4ECDC4",
      "logo_url": "https://cdn.example.com/logo.png"
    },
    "mail": {
      "mail_driver": "smtp",
      "mail_from": "noreply@example.com"
    }
  },
  "status": 200
}
```

### Logic
1. Get all settings
2. Group by `group` field
3. Cast values based on type (string, integer, boolean, json)
4. Return grouped object

---

## GET /api/settings/group/{group}

Get settings by group.

### Response (200 OK)
```json
{
  "data": {
    "site_name": "The Bold East Africa",
    "site_description": "News platform",
    "site_url": "https://example.com",
    "support_email": "support@example.com"
  },
  "status": 200
}
```

### Logic
1. Find all settings where group = {group}
2. Map to key-value object
3. Cast values based on type
4. Return object

---

## PUT /api/settings

Update multiple settings at once.

### Request Body
```json
{
  "site_name": "The Bold",
  "site_description": "Updated description",
  "primary_color": "#FF8C42"
}
```

### Response (200 OK)
```json
{
  "data": {
    "general": {
      "site_name": "The Bold",
      "site_description": "Updated description"
    },
    "appearance": {
      "primary_color": "#FF8C42"
    }
  },
  "message": "Settings updated successfully",
  "status": 200
}
```

### Logic
1. For each key-value pair in request:
   - Check if setting exists by key
   - If exists: update value
   - If not exists: create new setting with group='general' and auto-detect type
2. Type detection: boolean, integer, or string
3. If array: JSON encode
4. Clear cache (if using cache)
5. Return all updated settings grouped

---

## PUT /api/settings/{key}

Update single setting.

### Request Body
```json
{
  "value": "Updated Value"
}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "key": "site_name",
    "value": "Updated Value",
    "type": "string",
    "group": "general"
  },
  "message": "Setting updated successfully",
  "status": 200
}
```

### Validation
- `value`: required

### Logic
1. Find setting by key
2. If exists: update value
3. If not exists: create new setting
4. Auto-detect type
5. Return updated setting

---

## POST /api/settings/password

Update authenticated user's password.

### Request Body
```json
{
  "current_password": "OldPassword123",
  "password": "NewPassword456",
  "password_confirmation": "NewPassword456"
}
```

### Response (200 OK)
```json
{
  "message": "Password updated successfully",
  "status": 200
}
```

### Response (400 Bad Request)
```json
{
  "message": "Current password is incorrect",
  "status": 400
}
```

### Validation
- `current_password`: required
- `password`: required, min 8
- `password_confirmation`: required, same as password

### Logic
1. Get authenticated user
2. Verify current_password using bcrypt
3. If invalid: return 400
4. Hash new password
5. Update user.password
6. Return success

---

## GET /api/settings/profile

Get current authenticated user's profile.

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "status": "Active",
    "department": "Engineering",
    "phone": "+254712345678",
    "bio": "Software engineer",
    "image": "https://cdn.example.com/users/john.jpg",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "status": 200
}
```

### Logic
1. Get authenticated user
2. Exclude password and sensitive fields
3. Return user data

---

## PUT /api/settings/profile

Update authenticated user's profile.

### Request Body
```json
{
  "name": "John Smith",
  "phone": "+254712345679",
  "bio": "Updated bio",
  "department": "Management",
  "linkedin": "linkedin.com/in/johnsmith"
}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+254712345679",
    "bio": "Updated bio",
    "department": "Management",
    "linkedin": "linkedin.com/in/johnsmith",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Profile updated successfully",
  "status": 200
}
```

### Validation
- `name`: optional, string, max 255
- `phone`: optional, string, max 20
- `bio`: optional, string, max 1000
- `department`: optional, string, max 100
- `linkedin`: optional, string

### Logic
1. Get authenticated user
2. Update provided fields only
3. Save user
4. Return updated user

---

## POST /api/settings/profile/image

Upload profile image for authenticated user.

### Request
```
Method: POST
Content-Type: multipart/form-data
Body:
  image: <file>
```

### Response (200 OK)
```json
{
  "data": {
    "path": "users/user_1674816600_abc12345.jpg",
    "url": "https://cdn.example.com/storage/users/user_1674816600_abc12345.jpg"
  },
  "message": "Profile image updated successfully",
  "status": 200
}
```

### Validation
- `image`: required, file, mimes: jpeg,png,jpg,gif,webp, max: 5048 KB

### Logic
1. Validate file
2. Generate filename
3. Save to public/storage/users/
4. Update user.image with new path
5. Return path and URL

---

## GET /api/settings/performance

Get system performance metrics.

### Response (200 OK)
```json
{
  "data": {
    "database_size": "15.5 MB",
    "cache_hits": 4500,
    "cache_misses": 1200,
    "cache_hit_rate": 78.95,
    "memory_usage": "256 MB",
    "disk_usage": "2.5 GB",
    "uptime": "7 days",
    "average_response_time": "125ms",
    "error_rate": 0.5
  },
  "status": 200
}
```

### Logic
1. Get database size
2. Get cache stats (if using cache)
3. Get memory usage
4. Get disk usage
5. Calculate uptime (from last restart)
6. Calculate average response time
7. Calculate error rate
8. Return metrics

---

## GET /api/settings/system-stats

Get system statistics.

### Response (200 OK)
```json
{
  "data": {
    "total_articles": 156,
    "total_users": 25,
    "total_page_views": 45230,
    "total_campaigns": 8,
    "database_records": {
      "articles": 156,
      "users": 25,
      "page_views": 45230,
      "campaigns": 8,
      "categories": 8
    },
    "last_backup": "2026-01-26T06:00:00Z"
  },
  "status": 200
}
```

---

## POST /api/settings/clear-cache

Clear application cache.

### Request Body
```json
{}
```

### Response (200 OK)
```json
{
  "message": "Cache cleared successfully",
  "status": 200
}
```

### Logic
1. Clear all cache (Redis or file-based)
2. Return success

---

## POST /api/settings/reset/{group?}

Reset settings to defaults.

### Request Body
```json
{}
```

### Response (200 OK)
```json
{
  "message": "Settings reset successfully",
  "data": {
    "general": {
      "site_name": "The Bold East Africa",
      "site_description": "News platform"
    }
  },
  "status": 200
}
```

### Logic
1. If group provided: reset only that group's settings
2. If no group: reset all settings
3. Restore from default config
4. Return reset settings

---

## GET /api/settings/export

Export all settings as JSON.

### Response (200 OK - Content-Type: application/json)
```json
{
  "data": {
    "general": { ... },
    "appearance": { ... },
    "mail": { ... }
  },
  "exported_at": "2026-01-26T10:30:00Z",
  "status": 200
}
```

### Logic
1. Get all settings
2. Group by category
3. Return as JSON
4. Client can save as file

---

## Database Schema

```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  value LONGTEXT,
  type VARCHAR(50),
  group VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (group)
);
```

### Default Settings
```javascript
const defaultSettings = {
  general: {
    site_name: 'The Bold East Africa',
    site_description: 'News and updates from East Africa',
    site_url: 'https://example.com',
    support_email: 'support@example.com'
  },
  appearance: {
    primary_color: '#FF6B6B',
    secondary_color: '#4ECDC4',
    accent_color: '#95E1D3',
    logo_url: null
  },
  mail: {
    mail_driver: 'smtp',
    mail_from: 'noreply@example.com',
    mail_host: process.env.MAIL_HOST,
    mail_port: process.env.MAIL_PORT
  }
};
```

---

**Next**: Review database schema details in 08-DATABASE-SCHEMA.md
