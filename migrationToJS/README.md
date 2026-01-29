# Quick Reference Guide

## File Structure Reference

```
backend/
├── migrationToJS/              ← Migration guides (YOU ARE HERE)
│   ├── 00-OVERVIEW.md          ← Start here! High-level overview
│   ├── 01-SETUP-AND-GOTCHAS.md ← Environment setup & critical gotchas
│   ├── 02-AUTHENTICATION.md    ← Login, logout, auth flows
│   ├── 03-USER-MANAGEMENT.md   ← Users, invitations, password reset
│   ├── 04-ARTICLES.md          ← Article CRUD operations
│   ├── 05-CAMPAIGNS-ADS.md     ← Ads and campaigns
│   ├── 06-CATEGORIES.md        ← Categories
│   ├── 07-ANALYTICS.md         ← Page tracking and dashboard
│   ├── 08-SETTINGS.md          ← Settings and profile
│   ├── 09-DATABASE-SCHEMA.md   ← Database structure
│   └── 10-GOTCHAS-AND-TIPS.md  ← Critical gotchas & best practices
└── ... (existing Laravel code)
```

## All Endpoints Quick List

### Authentication
```
POST   /api/login                          → Login user
POST   /api/logout                         → Logout user
GET    /api/user                           → Get current user (requires auth)
```

### Users
```
GET    /api/users                          → List all users (with filters)
GET    /api/users/{id}                     → Get user by ID
POST   /api/users                          → Create user directly
POST   /api/users/invite                   → Send invitation with OTP
POST   /api/users/invite/image             → Upload image during invite
POST   /api/users/accept-invitation        → Accept invitation
GET    /api/users/invitations/list         → List pending invitations
POST   /api/users/invitations/{id}/resend  → Resend OTP
DELETE /api/users/invitations/{id}         → Cancel invitation
POST   /api/users/{id}/image               → Upload user profile image
PATCH  /api/users/{id}/status              → Update user status
POST   /api/users/bulk-status              → Update multiple users status
GET    /api/users/statistics/overview      → User statistics
POST   /api/forgot-password                → Initiate password reset
POST   /api/reset-password                 → Complete password reset
```

### Articles
```
GET    /api/articles                       → List all articles
POST   /api/articles                       → Create article
GET    /api/articles/{id}                  → Get article by ID
PATCH  /api/articles/{id}                  → Update article
DELETE /api/articles/{id}                  → Delete article
POST   /api/articles/{id}/view             → Track article view
POST   /api/articles/{id}/click            → Track article click
```

### Categories
```
GET    /api/categories                     → List categories
POST   /api/categories                     → Create category
GET    /api/categories/{id}                → Get category by ID
PATCH  /api/categories/{id}                → Update category
DELETE /api/categories/{id}                → Delete category
```

### Campaigns/Ads
```
GET    /api/campaigns                      → List campaigns
POST   /api/campaigns                      → Create campaign
GET    /api/campaigns/{id}                 → Get campaign by ID
PATCH  /api/campaigns/{id}                 → Update campaign
DELETE /api/campaigns/{id}                 → Delete campaign
GET    /api/ads/active                     → Get active ads (public)
POST   /api/ads/{id}/impression            → Track impression
POST   /api/ads/{id}/click                 → Track click
```

### Analytics
```
POST   /api/analytics/track                → Track page view
GET    /api/analytics/dashboard            → Dashboard metrics
GET    /api/analytics/logs                 → Activity logs
GET    /api/analytics/active-visitors      → Current visitors
```

### Settings
```
GET    /api/settings                       → Get all settings
GET    /api/settings/group/{group}         → Get settings by group
PUT    /api/settings                       → Update multiple settings
PUT    /api/settings/{key}                 → Update single setting
POST   /api/settings/password              → Update password (auth required)
GET    /api/settings/profile               → Get profile (auth required)
PUT    /api/settings/profile               → Update profile (auth required)
POST   /api/settings/profile/image         → Upload profile image (auth required)
GET    /api/settings/performance           → Performance metrics
GET    /api/settings/system-stats          → System statistics
POST   /api/settings/clear-cache           → Clear cache
POST   /api/settings/reset/{group?}        → Reset settings
GET    /api/settings/export                → Export settings as JSON
```

## Response Format (CRITICAL - DO NOT CHANGE)

**All endpoints follow this format:**

```json
{
  "data": {},
  "message": "Optional message",
  "status": 200,
  "errors": {}
}
```

**Status codes:**
- 200: Success (GET, PUT, DELETE, no-return POST)
- 201: Created (POST that creates resource)
- 400: Bad request
- 401: Unauthorized/invalid credentials
- 404: Not found
- 422: Validation failed
- 500: Server error

## Validation Errors Format

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required.", "Invalid email format"],
    "password": ["The password must be at least 8 characters."]
  },
  "status": 422
}
```

## Key Implementation Rules

1. **Response Format**: Keep exact JSON structure
2. **Status Codes**: Use correct codes for each scenario
3. **Error Messages**: Match Laravel messages where possible
4. **Passwords**: Never return in responses
5. **Empty Strings**: Convert to null before saving
6. **Booleans**: Handle string "true"/"false" conversion
7. **Arrays/JSON**: Stringify when storing, parse when retrieving
8. **CamelCase/snake_case**: Map both directions
9. **Defaults**: Set all default values explicitly
10. **Async/Await**: Always await database calls

## Quick Migration Roadmap

### Phase 1: Infrastructure (Week 1)
- [ ] Set up Express project
- [ ] Configure database connection
- [ ] Set up ORM (Prisma/TypeORM/Sequelize)
- [ ] Create migrations from Laravel schema
- [ ] Set up basic middleware (CORS, logging)

### Phase 2: Authentication (Week 1-2)
- [ ] Implement login endpoint
- [ ] Implement logout endpoint
- [ ] Implement get current user endpoint
- [ ] Set up auth middleware
- [ ] Test with frontend

### Phase 3: User Management (Week 2-3)
- [ ] User CRUD endpoints
- [ ] User invitation flow
- [ ] Password reset flow
- [ ] Profile management
- [ ] Image uploads

### Phase 4: Content Management (Week 3-4)
- [ ] Articles CRUD
- [ ] Categories CRUD
- [ ] Campaigns/Ads CRUD
- [ ] Image handling

### Phase 5: Analytics & Settings (Week 4-5)
- [ ] Page tracking endpoint
- [ ] Dashboard metrics
- [ ] Settings management
- [ ] Activity logging

### Phase 6: Testing & Deployment (Week 5-6)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Staging deployment
- [ ] Production deployment

## Critical Files to Read First

1. **00-OVERVIEW.md** - Understand the big picture
2. **01-SETUP-AND-GOTCHAS.md** - Avoid common mistakes
3. **02-AUTHENTICATION.md** - Core functionality
4. **10-GOTCHAS-AND-TIPS.md** - Learn from experience

Then read specific endpoint documentation as needed.

## Required Dependencies

```bash
npm install express dotenv cors
npm install @prisma/client prisma  # or typeorm, sequelize
npm install bcrypt jsonwebtoken
npm install joi                    # or express-validator
npm install multer                 # for file uploads
npm install nodemailer             # for emails
npm install slugify                # for slug generation
npm install winston                # for logging
npm install uuid                   # for ID generation
```

## Environment Variables Template

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=sqlite:./database.sqlite
# Or for MySQL:
# DATABASE_URL=mysql://user:password@localhost:3306/dbname

# Authentication
JWT_SECRET=your-super-secret-key-change-this
SESSION_SECRET=your-session-secret-key

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-password

# File Storage
STORAGE_PATH=./public/storage

# CORS
FRONTEND_URL=http://localhost:5173
```

## Quick Testing

```bash
# Test login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test with token
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test creating user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass123"}'
```

## Common Express Patterns

### Error Handling Middleware
```javascript
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    status: error.status || 500
  });
});
```

### Validation Helper
```javascript
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { /* map errors */ },
        status: 422
      });
    }
    req.validated = value;
    next();
  };
};
```

### Authentication Middleware
```javascript
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token', status: 401 });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', status: 401 });
  }
};
```

---

## Support & Questions

If you encounter issues:

1. **Check 01-SETUP-AND-GOTCHAS.md** - Many common issues documented
2. **Check 10-GOTCHAS-AND-TIPS.md** - Learn from real scenarios
3. **Check specific endpoint documentation** - Details on request/response
4. **Check the checklist** - Ensure you've covered basics

---

**Good Luck with your migration! 🚀**

You have everything you need in these docs. Take it one endpoint at a time, test against the frontend after each implementation, and you'll be done before you know it!
