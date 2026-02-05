# Permissions Documentation

This document outlines the role-based permissions and access controls for the application. It specifies which routes and actions require certain roles or permissions.

## User Roles

The application has four user roles with different levels of access:

- **Admin**: Full system access, can manage users, settings, and all content
- **Editor**: Can manage content (articles, categories, ads) and view analytics
- **Contributor**: Can create and edit their own articles
- **Viewer**: Read-only access to content and basic analytics

## Route Permissions

### Public Routes (No Authentication Required)

These routes are accessible to anyone without logging in:

#### Articles
- `GET /api/articles` - View all published articles
- `GET /api/articles/{id}` - View specific article
- `POST /api/articles/{id}/view` - Track article views
- `POST /api/articles/{id}/click` - Track article clicks

#### Categories
- `GET /api/categories` - View all categories
- `GET /api/categories/{id}` - View specific category

#### Campaigns/Ads
- `GET /api/campaigns` - View all campaigns
- `GET /api/ads/active` - Get active ads for display
- `POST /api/ads/{id}/impression` - Track ad impressions
- `POST /api/ads/{id}/click` - Track ad clicks

#### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### Authenticated Routes (Login Required)

These routes require the user to be logged in, but may have additional role restrictions:

#### User Profile
- `GET /api/user` - Get current user information (any authenticated user)

#### Articles Management
- `POST /api/articles` - Create new article
  - **Required Role**: Contributor, Editor, or Admin
- `PUT /api/articles/{id}` - Update article
  - **Required Role**: Contributor (own articles only), Editor, or Admin
- `DELETE /api/articles/{id}` - Delete article
  - **Required Role**: Contributor (own articles only), Editor, or Admin

#### Categories Management
- `POST /api/categories` - Create category
  - **Required Role**: Editor or Admin
- `PUT /api/categories/{id}` - Update category
  - **Required Role**: Editor or Admin
- `DELETE /api/categories/{id}` - Delete category
  - **Required Role**: Editor or Admin

#### Campaigns/Ads Management
- `POST /api/campaigns` - Create campaign
  - **Required Role**: Editor or Admin
- `PUT /api/campaigns/{id}` - Update campaign
  - **Required Role**: Editor or Admin
- `DELETE /api/campaigns/{id}` - Delete campaign
  - **Required Role**: Editor or Admin

#### User Management
- `GET /api/users` - List all users
  - **Required Role**: Admin
- `GET /api/users/{id}` - Get user details
  - **Required Role**: Admin
- `POST /api/users` - Create user directly
  - **Required Role**: Admin
- `PUT /api/users/{id}` - Update user
  - **Required Role**: Admin
- `DELETE /api/users/{id}` - Delete user
  - **Required Role**: Admin
- `PATCH /api/users/{id}/status` - Update user status
  - **Required Role**: Admin
- `POST /api/users/bulk-status` - Bulk update user status
  - **Required Role**: Admin

#### User Invitations
- `POST /api/users/invite` - Send user invitation
  - **Required Role**: Admin
- `POST /api/users/invite/image` - Upload invitation image
  - **Required Role**: Admin
- `POST /api/users/accept-invitation` - Accept invitation
  - **Required Role**: None (public, but requires valid token)
- `GET /api/users/invitations/list` - List invitations
  - **Required Role**: Admin
- `POST /api/users/invitations/{id}/resend` - Resend invitation
  - **Required Role**: Admin
- `DELETE /api/users/invitations/{id}` - Cancel invitation
  - **Required Role**: Admin
- `POST /api/users/{id}/image` - Upload user image
  - **Required Role**: Admin (for other users), or user themselves

#### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics
  - **Required Role**: Viewer, Contributor, Editor, or Admin
- `GET /api/analytics/logs` - Get system logs
  - **Required Role**: Editor or Admin
- `GET /api/analytics/active-visitors` - Get active visitors
  - **Required Role**: Editor or Admin
- `POST /api/analytics/track` - Track page views
  - **Required Role**: Any authenticated user

#### Settings
- `GET /api/settings` - Get all settings
  - **Required Role**: Admin
- `GET /api/settings/group/{group}` - Get settings by group
  - **Required Role**: Admin
- `PUT /api/settings` - Update settings
  - **Required Role**: Admin
- `PUT /api/settings/{key}` - Update single setting
  - **Required Role**: Admin
- `POST /api/settings/password` - Update password
  - **Required Role**: Any authenticated user (for themselves)
- `GET /api/settings/export` - Export user data
  - **Required Role**: Any authenticated user (for themselves)
- `GET /api/settings/system-stats` - Get system statistics
  - **Required Role**: Admin
- `POST /api/settings/clear-cache` - Clear system cache
  - **Required Role**: Admin
- `POST /api/settings/reset/{group}` - Reset settings to defaults
  - **Required Role**: Admin

#### Profile Management
- `GET /api/settings/profile` - Get user profile
  - **Required Role**: Any authenticated user (for themselves)
- `PUT /api/settings/profile` - Update user profile
  - **Required Role**: Any authenticated user (for themselves)
- `POST /api/settings/profile/image` - Upload profile image
  - **Required Role**: Any authenticated user (for themselves)

#### Performance Metrics
- `GET /api/settings/performance` - Get performance metrics
  - **Required Role**: Admin

## Frontend Access Controls

### Dashboard Tabs

Based on user roles, the following dashboard tabs should be accessible:

- **Overview**: All authenticated users
- **Articles**: Contributor, Editor, Admin
- **Categories**: Editor, Admin
- **User Management**: Admin only
- **Sponsorships (Ads)**: Editor, Admin
- **Intelligence (Analytics)**: Viewer, Contributor, Editor, Admin
- **Settings**: Admin only

### Actions Within Components

#### Article Management
- **Create Article**: Contributor, Editor, Admin
- **Edit Article**: Contributor (own articles), Editor, Admin
- **Delete Article**: Contributor (own articles), Editor, Admin
- **Publish Article**: Editor, Admin

#### User Management
- **View Users**: Admin
- **Invite Users**: Admin
- **Edit Users**: Admin
- **Delete Users**: Admin
- **Change User Status**: Admin

#### Settings
- **View Settings**: Admin
- **Modify Settings**: Admin
- **System Maintenance**: Admin

## Implementation Notes

Currently, the backend routes do not have explicit authorization middleware implemented. The frontend has role-checking capabilities (`hasRole` function) but these are not actively used to restrict UI elements.

To implement proper permissions:

1. **Backend**: Add authorization middleware or policy checks in controllers
2. **Frontend**: Use `hasRole` checks to conditionally render UI elements and disable actions
3. **API Responses**: Return appropriate HTTP status codes (403 Forbidden) for unauthorized actions

## Security Considerations

- All sensitive operations should validate user permissions on both frontend and backend
- User role should be verified from the server-side session/token, not just client-side claims
- Admin operations should require additional confirmation and logging
- File uploads should validate user permissions before processing</content>
<parameter name="filePath">/home/ayan/Desktop/projects/the-bold-east-africa-1/permissions.md