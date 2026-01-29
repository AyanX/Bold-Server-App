# Article Management Endpoints

## GET /api/articles

List all articles.

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "title": "Breaking: Tech Innovation Unveiled",
      "slug": "breaking-tech-innovation-unveiled",
      "excerpt": "A summary of the article content",
      "content": "<p>Full HTML content...</p>",
      "image": "https://cdn.example.com/articles/image.jpg",
      "category": "Technology",
      "categories": ["Technology", "Innovation"],
      "author": "John Doe",
      "read_time": "5 min",
      "is_prime": true,
      "is_headline": true,
      "status": "Published",
      "meta_tags": ["tech", "innovation", "news"],
      "meta_description": "SEO description",
      "seo_score": 85,
      "views": 1250,
      "clicks": 120,
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-26T10:30:00Z"
    }
  ],
  "status": 200
}
```

### Logic
1. Get all articles ordered by created_at DESC
2. Return with all fields

---

## POST /api/articles

Create new article.

### Request Body
```json
{
  "title": "New Article Title",
  "slug": "new-article-title",
  "excerpt": "Article summary",
  "category": "Technology",
  "categories": ["Technology", "Innovation"],
  "image": "https://cdn.example.com/image.jpg",
  "author": "John Doe",
  "read_time": "5 min",
  "is_prime": false,
  "is_headline": true,
  "status": "Published",
  "meta_tags": ["tech", "news"],
  "meta_description": "Description for search engines",
  "seo_score": 85,
  "content": "<p>Full HTML content...</p>"
}
```

### Response (201 Created)
```json
{
  "data": {
    "id": 10,
    "title": "New Article Title",
    "slug": "new-article-title",
    "excerpt": "Article summary",
    "category": "Technology",
    "categories": ["Technology", "Innovation"],
    "image": "https://cdn.example.com/image.jpg",
    "author": "John Doe",
    "read_time": "5 min",
    "is_prime": false,
    "is_headline": true,
    "status": "Published",
    "meta_tags": ["tech", "news"],
    "meta_description": "Description for search engines",
    "seo_score": 85,
    "views": 0,
    "clicks": 0,
    "created_at": "2026-01-26T10:30:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Article created successfully",
  "status": 201
}
```

### Response (422 Validation Failed)
```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required."],
    "excerpt": ["The excerpt field is required."],
    "category": ["The category field is required."]
  },
  "status": 422
}
```

### Validation
- `title`: required, string, max 500
- `slug`: optional, string, unique in articles table
- `excerpt`: required, string
- `category`: required, string
- `categories`: optional, can be array or JSON string
- `image`: optional, can be base64 string, URL, or file upload
- `author`: optional, string
- `read_time`: optional, string
- `is_prime`: optional, boolean (convert from string "true"/"false")
- `is_headline`: optional, boolean
- `status`: optional, string
- `meta_tags`: optional, array or CSV string
- `meta_description`: optional, string
- `seo_score`: optional, integer
- `content`: optional, string/HTML

### Pre-processing (CRITICAL)
```javascript
// 1. Clean input
const cleanInput = (data) => {
  const allowed = ['title', 'slug', 'excerpt', 'image', 'category', 'author', ...];
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (!allowed.includes(key)) continue;
    
    // tags -> meta_tags
    if (key === 'tags') {
      cleaned.meta_tags = Array.isArray(value) 
        ? value 
        : value.split(',').map(t => t.trim()).filter(t => t);
      continue;
    }
    
    // categories array -> categories and category
    if (key === 'categories') {
      cleaned.categories = value;
      if (Array.isArray(value) && value.length > 0) {
        cleaned.category = value[0];
      }
      continue;
    }
    
    // empty string -> null (except title, excerpt, category)
    if (value === '' && !['title', 'excerpt', 'category'].includes(key)) {
      cleaned[key] = null;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// 2. Normalize types
const normalize = (data) => {
  // Convert string booleans
  if (data.is_prime !== undefined) {
    data.is_prime = data.is_prime === 'true' || data.is_prime === true;
  }
  if (data.is_headline !== undefined) {
    data.is_headline = data.is_headline === 'true' || data.is_headline === true;
  }
  
  // JSON encode arrays (if DB column isn't JSON type)
  if (Array.isArray(data.meta_tags)) {
    data.meta_tags = JSON.stringify(data.meta_tags);
  }
  if (Array.isArray(data.categories)) {
    data.categories = JSON.stringify(data.categories);
  }
  
  return data;
};

// 3. Auto-generate slug if missing
if (!data.slug && data.title) {
  data.slug = data.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 4. Handle image uploads
if (request.hasFile('image')) {
  data.image = handleImageUpload(request.file('image'));
}
```

### Logic
1. Clean input (remove unknown fields, convert '' to null)
2. Validate
3. Handle image upload if present
4. Auto-generate slug if missing
5. Normalize payload (booleans, JSON encoding)
6. Create article
7. Return created article

---

## GET /api/articles/{id}

Get single article by ID.

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "title": "Article Title",
    "slug": "article-title",
    "excerpt": "Summary",
    "content": "<p>Full content...</p>",
    "image": "https://...",
    "category": "Tech",
    "categories": ["Tech", "News"],
    "author": "John Doe",
    "read_time": "5 min",
    "is_prime": true,
    "is_headline": true,
    "status": "Published",
    "meta_tags": ["tag1", "tag2"],
    "meta_description": "SEO description",
    "seo_score": 85,
    "views": 1250,
    "clicks": 120,
    "created_at": "2026-01-20T10:00:00Z"
  },
  "status": 200
}
```

### Response (404 Not Found)
```json
{
  "message": "Article not found",
  "status": 404
}
```

---

## PATCH /api/articles/{id}

Update article.

### Request Body
```json
{
  "title": "Updated Title",
  "status": "Draft",
  "seo_score": 90,
  "meta_tags": ["updated", "tags"]
}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "title": "Updated Title",
    "status": "Draft",
    "seo_score": 90,
    "meta_tags": ["updated", "tags"],
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Article updated successfully",
  "status": 200
}
```

### Validation
Same as POST, but all fields optional (nullable)

### Logic
1. Find article by ID (404 if not found)
2. Clean input
3. Validate (all fields optional)
4. Handle image upload if present
5. Auto-generate slug if title changed and slug empty
6. Normalize payload
7. Update article
8. Return updated article

---

## DELETE /api/articles/{id}

Delete article.

### Response (200 OK)
```json
{
  "message": "Article deleted successfully",
  "status": 200
}
```

---

## POST /api/articles/{id}/view

Track article view.

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
    "article_id": 1,
    "view_count": 1251,
    "session_id": "unique-session-identifier"
  },
  "message": "View tracked",
  "status": 201
}
```

### Logic
1. Find article by ID
2. Increment views counter
3. Store view record (optional, for analytics)
4. Return updated view count

### Implementation Note
```javascript
// In database, just increment:
await Article.update(
  { id: articleId },
  { views: sequelize.literal('views + 1') }
);

// Or in Prisma:
await prisma.article.update({
  where: { id: articleId },
  data: { views: { increment: 1 } }
});
```

---

## POST /api/articles/{id}/click

Track article click (link click, probably external).

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
    "article_id": 1,
    "click_count": 121,
    "session_id": "unique-session-identifier"
  },
  "message": "Click tracked",
  "status": 201
}
```

### Logic
Same as view tracking, but increment clicks column

---

## Image Upload Handling

The article controller handles multiple image formats:

### 1. Base64 String
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### 2. URL
```json
{
  "image": "https://cdn.example.com/image.jpg"
}
```

### 3. Multipart File Upload
```
Content-Type: multipart/form-data
image: <file>
```

### Processing Logic
```javascript
const handleImageUpload = (image) => {
  // If it's a file upload
  if (image instanceof File || Buffer.isBuffer(image)) {
    return saveFile(image);
  }
  
  // If it's base64
  if (typeof image === 'string' && image.startsWith('data:')) {
    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    return saveFile(buffer);
  }
  
  // If it's a URL, just store the URL
  if (typeof image === 'string' && image.startsWith('http')) {
    return image;
  }
  
  return null;
};

const saveFile = (buffer) => {
  const filename = `article_${Date.now()}_${Math.random().toString(36).substr(2, 8)}.jpg`;
  const path = `articles/${filename}`;
  // Save to storage
  fs.writeFileSync(`./public/storage/${path}`, buffer);
  return `storage/${path}`;
};
```

---

## Database Schema

```sql
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT,
  image LONGTEXT,
  category VARCHAR(255) NOT NULL,
  categories JSON,
  author VARCHAR(255),
  read_time VARCHAR(50),
  is_prime BOOLEAN DEFAULT false,
  is_headline BOOLEAN DEFAULT false,
  status VARCHAR(50),
  meta_tags JSON,
  meta_description TEXT,
  seo_score INT,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

**Next**: Review campaign/ad management in 05-CAMPAIGNS-ADS.md
