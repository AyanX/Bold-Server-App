# Quick Start: User Management Setup

## Installation & Setup

### 1. Verify Dependencies Installed

```bash
cd /home/ayan/Desktop/projects/Bold-Server
npm list bcrypt nodemailer express drizzle-orm
```

If any are missing:
```bash
npm install bcrypt nodemailer
```

### 2. Verify .env Configuration

Check your `.env` file has Brevo SMTP credentials:
```
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-brevo-account@example.com"
SMTP_PASSWORD="xsmtpsib-..."
SENDER_EMAIL="noreply@yoursite.com"
```

### 3. Connect Router to Main App

Update your main `app.js` or `server.js`:

```javascript
const userManagementRouter = require('./routers/userManagementRouter/userManagement.Router');

// Mount the router
app.use('/api/users', userManagementRouter);
```

### 4. Verify Database Schema

Make sure your database has `user_invitations` and `users` tables:

```bash
# Run drizzle migrations if not already done
npm run migrate
```

---

## Testing the API Endpoints

### Using Postman or cURL

#### 1. Create an Invitation

```bash
curl -X POST http://localhost:8000/api/users/invite \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "Editor",
    "department": "News",
    "phone": "+1-555-0123",
    "bio": "Senior news editor with 5 years experience"
  }'
```

**Expected Response (201):**
```json
{
  "status": 201,
  "message": "Invitation sent successfully",
  "data": {
    "id": 1,
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "role": "Editor",
    "status": "pending",
    "createdAt": "2026-01-29 10:30:45"
  }
}
```

**Email Sent:** Jane will receive an email with her OTP (e.g., "123456")

---

#### 2. List All Invitations

```bash
curl http://localhost:8000/api/users/invitations/list
```

**Expected Response:**
```json
{
  "status": 200,
  "message": "Invitations fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "Editor",
      "status": "pending",
      "createdAt": "2026-01-29 10:30:45"
    }
  ]
}
```

---

#### 3. Filter Invitations by Status

```bash
# Get only pending invitations
curl "http://localhost:8000/api/users/invitations/list?status=pending"

# Get only accepted invitations
curl "http://localhost:8000/api/users/invitations/list?status=accepted"

# Get invitations by role
curl "http://localhost:8000/api/users/invitations/list?role=Editor"
```

---

#### 4. Accept Invitation

Jane checks her email, gets OTP "123456", then:

```bash
curl -X POST http://localhost:8000/api/users/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "otp": "123456",
    "name": "Jane Smith",
    "password": "MySecurePass123!",
    "confirmPassword": "MySecurePass123!"
  }'
```

**Expected Response (201):**
```json
{
  "status": 201,
  "message": "Account created successfully",
  "data": {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "Editor",
    "status": "active"
  }
}
```

**Result:**
- ✅ User created in `users` table
- ✅ Invitation marked as "accepted"
- ✅ Password hashed with bcrypt
- ✅ User can now login

---

#### 5. Resend Invitation Email

If Jane missed her email or OTP expired:

```bash
# Get invitation ID (use list endpoint)
curl -X POST http://localhost:8000/api/users/invitations/1/resend
```

**Expected Response:**
```json
{
  "status": 200,
  "message": "Invitation resent successfully",
  "data": {
    "id": 1,
    "email": "jane.smith@example.com"
  }
}
```

**Result:**
- ✅ New OTP generated
- ✅ New email sent with fresh OTP
- ✅ OTP expires in 15 minutes

---

#### 6. Delete Invitation

If you need to cancel an invitation:

```bash
curl -X DELETE http://localhost:8000/api/users/invitations/1
```

**Expected Response:**
```json
{
  "status": 200,
  "message": "Invitation deleted successfully"
}
```

---

#### 7. Get User Statistics

```bash
curl http://localhost:8000/api/users/statistics/overview
```

**Expected Response:**
```json
{
  "status": 200,
  "message": "Statistics fetched successfully",
  "data": {
    "totalUsers": 1,
    "activeUsers": 1,
    "inactiveUsers": 0,
    "totalInvitations": 1,
    "pendingInvitations": 0,
    "acceptedInvitations": 1
  }
}
```

---

#### 8. Update User Status

```bash
# Make user inactive
curl -X PATCH http://localhost:8000/api/users/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'

# Suspend user
curl -X PATCH http://localhost:8000/api/users/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "suspended"}'

# Reactivate user
curl -X PATCH http://localhost:8000/api/users/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**Expected Response:**
```json
{
  "status": 200,
  "message": "User status updated successfully"
}
```

---

#### 9. Bulk Update User Status

```bash
curl -X POST http://localhost:8000/api/users/bulk-status \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": [1, 2, 3],
    "status": "active"
  }'
```

**Expected Response:**
```json
{
  "status": 200,
  "message": "Status updated for 3 users"
}
```

---

## Error Testing

### Test Invalid Email Format

```bash
curl -X POST http://localhost:8000/api/users/invite \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "role": "Contributor"
  }'
```

**Response (400):**
```json
{
  "status": 400,
  "message": "Invalid email format"
}
```

---

### Test Duplicate Email

```bash
# Try inviting same person twice
curl -X POST http://localhost:8000/api/users/invite \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "Editor"
  }'
```

**Response (409):**
```json
{
  "status": 409,
  "message": "User with this email has already been invited"
}
```

---

### Test Weak Password

```bash
curl -X POST http://localhost:8000/api/users/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "name": "Test User",
    "password": "weak",
    "confirmPassword": "weak"
  }'
```

**Response (400):**
```json
{
  "status": 400,
  "message": "Password does not meet security requirements",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one digit",
    "Password must contain at least one special character"
  ]
}
```

---

### Test Wrong OTP

```bash
curl -X POST http://localhost:8000/api/users/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "otp": "999999",
    "name": "Jane Smith",
    "password": "MySecurePass123!",
    "confirmPassword": "MySecurePass123!"
  }'
```

**Response (401):**
```json
{
  "status": 401,
  "message": "Invalid OTP code"
}
```

---

### Test Expired Invitation

```bash
# Try to accept after 15 minutes
curl -X POST http://localhost:8000/api/users/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@example.com",
    "otp": "123456",
    "name": "Jane Smith",
    "password": "MySecurePass123!",
    "confirmPassword": "MySecurePass123!"
  }'
```

**Response (410):**
```json
{
  "status": 410,
  "message": "Invitation has expired. Please request a new invitation."
}
```

---

## Frontend Integration (React/TypeScript)

The frontend is already configured to use these endpoints in [Frontend/services/api.ts](Frontend/services/api.ts):

```typescript
// Create invitation
const res = await api.users.create({
  name: "Jane Smith",
  email: "jane@example.com",
  role: "Editor"
});

// Accept invitation
const res = await api.users.acceptInvitation({
  email: "jane@example.com",
  otp: "123456",
  password: "MySecurePass123!",
  confirmPassword: "MySecurePass123!"
});
```

---

## Debugging

### Enable SQL Logging

Add to your `db.js`:

```javascript
const db = drizzle(process.env.DATABASE_URL, {
  logger: true // Logs all SQL queries
});
```

### Check Brevo Email Logs

1. Login to [Brevo](https://www.brevo.com/)
2. Go to **Logs** → **Transactional Emails**
3. Search for your test emails

### Database Query

Check invitations directly:

```sql
SELECT * FROM user_invitations;
SELECT id, name, email, status FROM users;
```

---

## Checklist Before Production

- [ ] Update all `.env` variables with real Brevo credentials
- [ ] Add rate limiting middleware
- [ ] Set up CORS with frontend domain
- [ ] Enable HTTPS for all API calls
- [ ] Add authentication middleware to protect routes
- [ ] Set up proper error logging (Winston/Bunyan)
- [ ] Add database backups
- [ ] Set up email template versioning
- [ ] Monitor email delivery rates
- [ ] Test with real email addresses
- [ ] Add email unsubscribe support
- [ ] Add GDPR compliance (privacy policy, data handling)
- [ ] Set up CI/CD pipeline

---

## Support & Troubleshooting

### Email Not Sending?

1. Verify Brevo credentials in `.env`
2. Check Brevo SMTP logs
3. Verify sender email is whitelisted in Brevo
4. Check firewall/VPN doesn't block SMTP port 587

### OTP Not Working?

1. Check time is synced on server
2. Verify bcrypt is installed (`npm list bcrypt`)
3. Check OTP hasn't expired (15 min window)
4. Verify OTP hash in database

### Database Connection Issues?

1. Verify MySQL is running: `mysql -u ayan -p`
2. Check DATABASE_URL in `.env`
3. Verify drizzle migrations: `npm run migrate`

---

## Next Steps

1. ✅ Test all endpoints above
2. ✅ Integrate with frontend (DashboardUsers.tsx)
3. ✅ Add authentication middleware
4. ✅ Add rate limiting
5. ✅ Deploy and monitor
6. ✅ Collect user feedback
7. ✅ Iterate and improve
