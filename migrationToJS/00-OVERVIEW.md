# Laravel to Node.js Express Migration Guide

## Overview
This folder contains comprehensive documentation for migrating your Laravel PHP backend to Node.js with Express.js. Each file covers specific aspects of the application.

## Document Structure

1. **00-OVERVIEW.md** (this file) - High-level migration overview
2. **01-SETUP-AND-GOTCHAS.md** - General setup, environment, and common pitfalls
3. **02-AUTHENTICATION.md** - Login, logout, user auth flows
4. **03-USER-MANAGEMENT.md** - User CRUD operations, invitations, password resets
5. **04-ARTICLES.md** - Article management endpoints
6. **05-CAMPAIGNS-ADS.md** - Campaign/ad management and tracking
7. **06-CATEGORIES.md** - Category CRUD operations
8. **07-ANALYTICS.md** - Page view tracking and analytics dashboard
9. **08-SETTINGS.md** - Settings management and profile endpoints
10. **09-DATABASE-SCHEMA.md** - Database migration information
11. **10-GOTCHAS-AND-TIPS.md** - Common migration issues and best practices

## Key Technology Mappings

| Laravel | Express.js |
|---------|-----------|
| Eloquent ORM | Prisma, TypeORM, or Sequelize |
| Validation Rules | Joi, Zod, or express-validator |
| Middleware | Express middleware |
| Collections | Native JS Arrays |
| Sessions (Sanctum) | JWT tokens + cookies |
| Mail (Mailable classes) | Nodemailer or similar |
| Storage facade | Multer or AWS SDK |
| Cache (Redis/File) | Node-cache or Redis client |
| Cron Jobs | node-cron or bull queues |
| Logging | Winston or Pino |

## Database Information

- **Default Connection**: SQLite (development) / MySQL (production)
- **ORM**: Eloquent
- **Migrations**: Laravel migration files (database/migrations/)
- **Seeders**: Database seeders available

## Important Notes Before Starting

1. **Environment Variables**: Update from `.env` format to `.env.local` or `config.js`
2. **File Structure**: Express doesn't enforce structure like Laravel does
3. **Type Safety**: Consider using TypeScript for better code quality
4. **Authentication**: Replace Laravel Sanctum with JWT or session-based auth
5. **Email**: Configure Nodemailer or similar service
6. **File Storage**: Replace Laravel Storage facade with Multer or cloud storage
7. **Validation**: Manual validation or use dedicated libraries
8. **Password Hashing**: Use bcrypt (same as Laravel) for compatibility
9. **Response Format**: Maintain consistency with current API response structure
10. **CORS**: Configure properly - different than Laravel

## Database Models Overview

### Core Models
- **User** - User accounts with roles (Admin, Editor, Contributor, Viewer)
- **Article** - News articles with metadata, SEO scores
- **Category** - Article categories
- **Campaign** - Ad campaigns with tracking
- **UserInvitation** - User invitation workflow with OTP
- **PageView** - Analytics tracking
- **ActivityLog** - Activity logging
- **Setting** - System settings key-value store

## API Response Format

All endpoints follow this JSON structure:

```json
{
  "data": {},
  "message": "Optional message",
  "status": 200,
  "errors": {}
}
```

Maintain this consistency in your Express implementation!

## Authentication Strategy

The current implementation uses:
- **Session-based login** with Laravel sessions
- **Sanctum tokens** for API authentication (`auth:sanctum` middleware)
- **Password hashing** with bcrypt

When migrating to Express, choose:
- **JWT Tokens** (recommended for API-first architecture)
- **Session Cookies** (if supporting legacy clients)
- **Hybrid approach** (JWT + cookie fallback)

## File Organization Recommendation for Express

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Database models/schemas
├── routes/          # Route definitions
├── services/        # Business logic
├── utils/           # Helper functions
├── validators/      # Input validation
└── emails/          # Email templates
```

## Next Steps

1. Read **01-SETUP-AND-GOTCHAS.md** for environment setup
2. Review **02-AUTHENTICATION.md** for auth implementation
3. Study each endpoint documentation
4. Pay special attention to **10-GOTCHAS-AND-TIPS.md**
5. Test endpoints against current frontend

## API Base URL

Current Laravel routes are under `/api/*`. Maintain this in Express for frontend compatibility.

---

**Last Updated**: January 2026
**Status**: Ready for migration planning
