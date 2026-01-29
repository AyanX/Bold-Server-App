# Category Management Endpoints

## GET /api/categories

List all categories.

### Query Parameters
```
?search=tech       - Optional search filter
```

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "technology",
      "article_count": 45,
      "color": "#FF6B6B",
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-26T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Business",
      "slug": "business",
      "article_count": 32,
      "color": "#4ECDC4",
      "created_at": "2026-01-01T10:05:00Z",
      "updated_at": "2026-01-26T10:30:00Z"
    }
  ],
  "status": 200
}
```

### Logic
1. Get all categories
2. Order by name ASC
3. Return all fields

---

## POST /api/categories

Create category.

### Request Body
```json
{
  "name": "Entertainment",
  "slug": "entertainment",
  "article_count": 0,
  "color": "#95E1D3"
}
```

### Response (201 Created)
```json
{
  "data": {
    "id": 5,
    "name": "Entertainment",
    "slug": "entertainment",
    "article_count": 0,
    "color": "#95E1D3",
    "created_at": "2026-01-26T10:30:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Category created successfully",
  "status": 201
}
```

### Response (422 Validation)
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "slug": ["The slug has already been taken."]
  },
  "status": 422
}
```

### Validation
- `name`: required, string, max 255
- `slug`: required, string, unique in categories table
- `article_count`: optional, integer, default: 0
- `color`: optional, string (hex color code)

### Logic
1. Validate input
2. Check slug is unique
3. Create category
4. Return created category

---

## GET /api/categories/{id}

Get single category.

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "article_count": 45,
    "color": "#FF6B6B",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "status": 200
}
```

### Response (404 Not Found)
```json
{
  "message": "Category not found",
  "status": 404
}
```

---

## PATCH /api/categories/{id}

Update category.

### Request Body
```json
{
  "name": "Tech News",
  "color": "#FF8C42",
  "article_count": 46
}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "name": "Tech News",
    "slug": "technology",
    "article_count": 46,
    "color": "#FF8C42",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Category updated successfully",
  "status": 200
}
```

### Validation
All fields optional

- `name`: optional, string, max 255
- `slug`: optional, string, unique in categories (except current record)
- `article_count`: optional, integer
- `color`: optional, string

### Logic
1. Find category by ID (404 if not found)
2. Validate input
3. Update provided fields only
4. Return updated category

---

## DELETE /api/categories/{id}

Delete category.

### Response (200 OK)
```json
{
  "message": "Category deleted successfully",
  "status": 200
}
```

### Response (404 Not Found)
```json
{
  "message": "Category not found",
  "status": 404
}
```

### Logic
1. Find category by ID (404 if not found)
2. Delete category
3. Return success
4. **Note**: Consider whether to:
   - Cascade delete articles in this category, OR
   - Prevent deletion if articles exist, OR
   - Set articles category to null

---

## Database Schema

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  article_count INT DEFAULT 0,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Frontend Integration

```javascript
// Fetch categories for dropdown
const getCategories = async () => {
  const res = await fetch('/api/categories');
  const { data } = await res.json();
  return data;
};

// Create category
const createCategory = async (name, slug, color) => {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug, color })
  });
  const { data } = await res.json();
  return data;
};
```

---

**Next**: Review analytics endpoints in 06-ANALYTICS.md
