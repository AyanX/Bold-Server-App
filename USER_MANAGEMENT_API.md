# User Management & Invitation System

## Overview

This module handles secure user invitations, account creation, and user management with industry-standard security practices.

## Security Features

### 1. **Password Security**
- Uses **bcrypt** with 10 salt rounds for password hashing
- Passwords never stored in plain text
- Strong password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character

### 2. **OTP Security**
- 6-digit OTP generated using `Math.random()`
- OTP is hashed using bcrypt before storage
- OTP expires after 15 minutes
- OTP compared securely using bcrypt comparison (prevents timing attacks)

### 3. **Email Security**
- Uses Brevo SMTP for reliable email delivery
- Invitation links contain OTP code
- Sensitive data (passwords) never sent via email
- Email templates use HTML with proper escaping

### 4. **Data Validation**
- Email format validation (RFC 5322 regex)
- Role validation (Contributor, Editor, Admin, etc.)
- Request body validation for all endpoints
- Type-safe error handling

### 5. **Rate Limiting** (Recommended to add)
- Add rate limiting middleware to `/invite` endpoint
- Prevent OTP brute force attacks
- Limit resend requests per email

## API Endpoints

### 1. **Create Invitation** 
```
POST /api/users/invite
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Contributor",
  "department": "Editorial",
  "phone": "+1234567890",
  "bio": "Tech journalist"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Invitation sent successfully",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "Contributor",
    "status": "pending",
    "createdAt": "2026-01-29 10:30:45"
  }
}
```

**Flow:**
1. Validate input (name, email, role)
2. Check email uniqueness in invitations
3. Generate 6-digit OTP
4. Hash OTP using bcrypt
5. Store invitation in database with hashed OTP
6. Send invitation email with plain OTP
7. Return invitation details

---

### 2. **Upload Invite Image**
```
POST /api/users/invite/image
```

**Request:** `multipart/form-data` with `image` field

**Response:**
```json
{
  "status": 200,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/uploads/invites/1706519445000-profile.jpg",
    "path": "/uploads/invites/1706519445000-profile.jpg",
    "filename": "profile.jpg"
  }
}
```

---

### 3. **Accept Invitation & Create Account**
```
POST /api/users/accept-invitation
```

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "name": "John Doe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Account created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Contributor",
    "status": "active"
  }
}
```

**Flow:**
1. Validate input (email, OTP, password)
2. Check password strength
3. Verify passwords match
4. Find invitation by email
5. Check invitation status (not already accepted)
6. Check OTP expiration (15 minutes)
7. Verify OTP using bcrypt compare
8. Hash user password using bcrypt
9. Create user in database
10. Update invitation status to "accepted"
11. Return user details

---

### 4. **List Invitations**
```
GET /api/users/invitations/list?status=pending&role=Contributor
```

**Query Parameters:**
- `status`: Filter by status (pending, accepted)
- `role`: Filter by role
- `search`: Search by name or email (optional)

**Response:**
```json
{
  "status": 200,
  "message": "Invitations fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Contributor",
      "status": "pending",
      "otpExpiresAt": "2026-01-29 10:45:45",
      "createdAt": "2026-01-29 10:30:45"
    }
  ]
}
```

---

### 5. **Resend Invitation**
```
POST /api/users/invitations/:id/resend
```

**Response:**
```json
{
  "status": 200,
  "message": "Invitation resent successfully",
  "data": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

**Flow:**
1. Find invitation by ID
2. Check if not already accepted
3. Generate new OTP
4. Hash new OTP
5. Update OTP and expiration in database
6. Send new invitation email
7. Return success

---

### 6. **Delete Invitation**
```
DELETE /api/users/invitations/:id
```

**Response:**
```json
{
  "status": 200,
  "message": "Invitation deleted successfully"
}
```

---

### 7. **Upload User Profile Image**
```
POST /api/users/:id/image
```

**Request:** `multipart/form-data` with `image` field

**Response:**
```json
{
  "status": 200,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/uploads/users/1/1706519445000-avatar.jpg",
    "path": "/uploads/users/1/1706519445000-avatar.jpg"
  }
}
```

---

### 8. **Update User Status**
```
PATCH /api/users/:id/status
```

**Request:**
```json
{
  "status": "active" // or "inactive", "suspended"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "User status updated successfully"
}
```

---

### 9. **Bulk Update User Status**
```
POST /api/users/bulk-status
```

**Request:**
```json
{
  "user_ids": [1, 2, 3, 4],
  "status": "active"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Status updated for 4 users"
}
```

---

### 10. **Get User Statistics**
```
GET /api/users/statistics/overview
```

**Response:**
```json
{
  "status": 200,
  "message": "Statistics fetched successfully",
  "data": {
    "totalUsers": 25,
    "activeUsers": 22,
    "inactiveUsers": 3,
    "totalInvitations": 30,
    "pendingInvitations": 5,
    "acceptedInvitations": 25
  }
}
```

---

## Error Handling

### Common Error Responses

**400 - Bad Request**
```json
{
  "status": 400,
  "message": "Missing required fields: name, email, role"
}
```

**404 - Not Found**
```json
{
  "status": 404,
  "message": "Invitation not found"
}
```

**409 - Conflict**
```json
{
  "status": 409,
  "message": "User with this email has already been invited"
}
```

**410 - Gone**
```json
{
  "status": 410,
  "message": "Invitation has expired. Please request a new invitation."
}
```

**500 - Internal Server Error**
```json
{
  "status": 500,
  "message": "Internal server error"
}
```

---

## Configuration

### Environment Variables (.env)

```
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-brevo-email@example.com"
SMTP_PASSWORD="your-brevo-smtp-password"
SENDER_EMAIL="noreply@yoursite.com"
```

---

## Complete Invite Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD                         │
│                  (DashboardUsers.tsx)                        │
│                                                               │
│  - Admin fills invitation form                               │
│  - Clicks "Invite User" button                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ POST /api/users/invite
                 │ { name, email, role, dept, phone, bio }
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND CONTROLLER                            │
│        (users.management.controller.js)                      │
│                                                               │
│  1. Validate input (email format, required fields)           │
│  2. Check email uniqueness                                   │
│  3. Generate 6-digit OTP (Math.random)                       │
│  4. Hash OTP using bcrypt                                    │
│  5. Store in user_invitations table                          │
│  6. Send invitation email with plain OTP                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Sends Email via Brevo SMTP
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER'S EMAIL                              │
│                                                               │
│  Subject: "You're Invited to Join Bold"                      │
│  Contains: OTP Code (e.g., 123456)                           │
│  Expires in: 15 minutes                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ User clicks invitation link / opens email
                 │ Enters OTP and creates password
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (BROWSER)                        │
│                                                               │
│  - Displays invitation accept form                           │
│  - User enters: OTP, Password, Confirm Password              │
│  - Frontend validates password strength                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ POST /api/users/accept-invitation
                 │ { email, otp, password, confirmPassword }
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND CONTROLLER                            │
│        (users.management.controller.js)                      │
│                                                               │
│  1. Validate input                                           │
│  2. Verify password strength                                 │
│  3. Find invitation by email                                 │
│  4. Check: not already accepted                              │
│  5. Check: OTP not expired (15 min)                          │
│  6. Compare OTP with bcrypt hash (secure comparison)         │
│  7. Hash password using bcrypt (10 rounds)                   │
│  8. Create user in users table                               │
│  9. Update invitation status to "accepted"                   │
│  10. Return user details                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Response with user data & auth token
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (APP LOGGED IN)                     │
│                                                               │
│  - Store auth token in context/localStorage                  │
│  - Redirect to dashboard                                     │
│  - User now has access to app                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Utility Functions Reference

### `generateOTP()`
Generates a secure 6-digit OTP using `Math.random()`
```javascript
const otp = generateOTP(); // Returns: "123456"
```

### `hashOTP(otp)`
Hashes OTP for secure storage
```javascript
const hashedOTP = await hashOTP("123456");
```

### `validatePassword(password)`
Validates password strength
```javascript
const result = validatePassword("MyPass123!");
// Returns: { isValid: true, errors: [] }
```

### `sendInvitationEmail(params)`
Sends invitation email via Brevo SMTP
```javascript
await sendInvitationEmail({
  email: "user@example.com",
  name: "John",
  otp: "123456",
  role: "Contributor",
  inviterName: "Admin"
});
```

---

## Testing the API

### Using cURL

**1. Create Invitation**
```bash
curl -X POST http://localhost:8000/api/users/invite \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Contributor"
  }'
```

**2. Accept Invitation**
```bash
curl -X POST http://localhost:8000/api/users/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456",
    "name": "John Doe",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'
```

**3. Get Invitations List**
```bash
curl http://localhost:8000/api/users/invitations/list
```

**4. Get Statistics**
```bash
curl http://localhost:8000/api/users/statistics/overview
```

---

## Future Enhancements

1. **Rate Limiting**: Add rate limiting on `/invite` and OTP verification
2. **Cloud Storage**: Upload images to AWS S3 instead of local storage
3. **Email Templates**: Use templating engine (Handlebars, EJS)
4. **Token-based Invites**: Use JWT tokens instead of OTP for invite links
5. **Audit Logging**: Log all invite/accept actions
6. **Webhook Support**: Notify external systems when users are invited/accepted
7. **2FA**: Add two-factor authentication option
8. **Invitation Expiry**: Set configurable invitation expiry (not just OTP)
9. **Bulk Invites**: Support CSV upload for bulk invitations
10. **Email Verification**: Add email verification before account activation

---

## Database Schema

See `drizzle/schema.js` for:
- `user_invitations` table
- `users` table
- Relations and indexes

Key fields in `user_invitations`:
- `id` - Primary key
- `email` - Unique email (invitation target)
- `otpHash` - Hashed OTP for security
- `otpExpiresAt` - 15-minute expiration
- `status` - "pending" or "accepted"
- `createdAt` / `updatedAt` - Timestamps

---

## License

Bold Server - 2026
