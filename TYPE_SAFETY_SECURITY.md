# Type Safety & Security Implementation Guide

## Overview

This document explains the type safety and security practices implemented in the user management system.

---

## Type Safety Measures

### 1. **Database Type Safety**

Using **Drizzle ORM** for type-safe database operations:

```javascript
// Type-safe query
const invitation = await db
  .select()
  .from(userInvitations)
  .where(eq(userInvitations.email, email.toLowerCase().trim()))
  .limit(1);

// Prevents SQL injection
// Enforces column existence at compile time
// Type inference available with TypeScript
```

### 2. **Input Validation**

All endpoints validate and sanitize input:

```javascript
// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
const validatePassword = (password) => {
  const errors = [];
  if (!password || password.length < 8) errors.push("...");
  // ... more checks
  return { isValid: errors.length === 0, errors };
};

// String sanitization
const sanitized = email.toLowerCase().trim();
const name = name.trim();
```

### 3. **Request Parameter Validation**

```javascript
// Check required fields
if (!name || !email || !role) {
  return res.status(400).json({
    status: 400,
    message: "Missing required fields: name, email, role"
  });
}

// Check array types
if (!user_ids || !Array.isArray(user_ids) || !status) {
  return res.status(400).json({
    status: 400,
    message: "Missing required fields: user_ids (array), status"
  });
}

// Validate enum values
const validStatuses = ["active", "inactive", "suspended"];
if (!validStatuses.includes(status)) {
  return res.status(400).json({
    status: 400,
    message: `Invalid status. Allowed: ${validStatuses.join(", ")}`
  });
}
```

### 4. **Error Response Type Safety**

Consistent error response format:

```javascript
{
  status: number,      // HTTP status code
  message: string,     // Human-readable message
  errors?: string[]    // Optional: Detailed error array
}
```

---

## Security Measures

### 1. **Password Hashing**

Using **bcrypt** with 10 salt rounds:

```javascript
// Hashing (one-way encryption)
const hashedPassword = await hashPassword(password);
// Stored: $2b$10$abcdefghijklmnopqrstuvwxyz...

// Verification (secure comparison)
const isMatch = await comparePassword(password, hashedPassword);
// Prevents timing attacks
```

### 2. **OTP Hashing**

OTP is hashed before storage, never stored in plain text:

```javascript
// Generate OTP
const otp = generateOTP(); // "123456" sent to email
const otpHash = await hashOTP(otp); // Hashed for storage

// Store in DB
await db.insert(userInvitations).values({
  otpCode: otp,      // For email only (remove in prod)
  otpHash: otpHash,  // For verification
  otpExpiresAt: getOTPExpirationTime() // 15 min
});

// Verification (secure comparison)
const isValid = await comparePassword(otp, invitationRecord.otpHash);
```

### 3. **Sensitive Data Removal**

Never return passwords in API responses:

```javascript
// Before returning user data
const safeUsers = allUsers.map((user) => {
  const { password, ...safeUser } = user; // Exclude password
  return safeUser;
});
```

### 4. **Email Format Validation**

Prevents invalid or malicious email addresses:

```javascript
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Usage
if (!isValidEmail(email)) {
  return res.status(400).json({
    status: 400,
    message: "Invalid email format"
  });
}
```

### 5. **Role & Status Validation**

Whitelist approach for enums:

```javascript
// Validate role
const validRoles = ["Contributor", "Editor", "Admin"];
if (!validRoles.includes(role)) {
  return res.status(400).json({
    status: 400,
    message: "Invalid role"
  });
}

// Validate status
const validStatuses = ["active", "inactive", "suspended"];
if (!validStatuses.includes(status)) {
  return res.status(400).json({
    status: 400,
    message: `Invalid status. Allowed: ${validStatuses.join(", ")}`
  });
}
```

### 6. **Duplicate Email Prevention**

Check for existing invitations:

```javascript
const existingInvite = await db
  .select()
  .from(userInvitations)
  .where(eq(userInvitations.email, email))
  .limit(1);

if (existingInvite.length > 0) {
  return res.status(409).json({
    status: 409,
    message: "User with this email has already been invited"
  });
}
```

### 7. **Expiration Checks**

Prevent expired invitations from being accepted:

```javascript
// Check OTP expiration
if (new Date(invitationRecord.otpExpiresAt) < new Date()) {
  return res.status(410).json({
    status: 410,
    message: "Invitation has expired. Please request a new invitation."
  });
}

// Check acceptance status
if (invitationRecord.status === "accepted") {
  return res.status(409).json({
    status: 409,
    message: "Invitation has already been accepted"
  });
}
```

### 8. **Timestamp Security**

Proper datetime handling:

```javascript
// Current time in MySQL format
const getMySQLDateTime = () => {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
};

// OTP expiration (15 minutes)
const getOTPExpirationTime = () => {
  const expirationDate = new Date(Date.now() + 15 * 60 * 1000);
  return expirationDate.toISOString().replace("T", " ").slice(0, 19);
};
```

### 9. **Secure Password Requirements**

Password must contain:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one digit (0-9)
- ✅ At least one special character (!@#$%^&*)

```javascript
const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one digit");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

---

## OTP Security Best Practices

### Why 6-Digit OTP?

1. **Balance**: Not too long (user-friendly), not too short (secure enough)
2. **Math.random() Generation**:
   ```javascript
   const generateOTP = () => {
     return String(Math.floor(Math.random() * 900000) + 100000);
   };
   // Generates: 100000 to 999999
   ```

3. **Hashing**: OTP is hashed before storage
4. **Expiration**: 15-minute window prevents long-term attacks
5. **Single Use**: Marked as accepted after use

### Why Hash OTP?

- ✅ Prevents database leaks from exposing OTP codes
- ✅ Even admin cannot see user's OTP
- ✅ Secure comparison prevents timing attacks
- ✅ Industry standard practice

---

## CSRF & CORS Protection

### Recommended Middleware

```javascript
// In app.js or server.js
const cors = require('cors');
const helmet = require('helmet');

app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Limit payload size
```

---

## Rate Limiting (Recommended)

### Prevent Brute Force Attacks

```javascript
// Using express-rate-limit
const rateLimit = require('express-rate-limit');

// Limit invitation creation: 5 per hour per IP
const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many invitations created, please try again later"
});

// Limit OTP verification: 5 attempts per 15 minutes
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many OTP attempts, please try again later"
});

// Apply to routes
userManagementRouter.post("/invite", inviteLimiter, inviteUser);
userManagementRouter.post("/accept-invitation", otpLimiter, acceptInvitation);
```

---

## Frontend Type Safety (TypeScript)

### Expected Request/Response Types

```typescript
// Request
interface InviteRequest {
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  bio?: string;
}

// Response
interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  errors?: string[];
}

interface InviteResponse {
  id: number;
  email: string;
  name: string;
  role: string;
  status: "pending" | "accepted";
  createdAt: string;
}

// Accept Invitation Request
interface AcceptInviteRequest {
  email: string;
  otp: string;
  name: string;
  password: string;
  confirmPassword: string;
}

// User Status
type UserStatus = "active" | "inactive" | "suspended";
type InviteStatus = "pending" | "accepted";
```

---

## Logging & Monitoring

### Console Logs for Debugging

```javascript
// Success logs
console.log(`✅ Invitation email sent to ${email}`);
console.log(`👤 User invitation created for ${email}`);
console.log(`📋 Fetched ${invitations.length} invitations`);

// Error logs
console.error("❌ Error creating invitation:", error);
console.error("❌ Error sending email:", error);
```

### Recommended Production Monitoring

- Use Winston or Bunyan for structured logging
- Log all invitation/accept actions
- Monitor failed OTP attempts
- Alert on rate limit violations

---

## Environment Variables Security

### Keep Sensitive Data in .env

Never commit `.env` to version control:

```
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT=587
SMTP_USER="your-brevo-account@example.com"
SMTP_PASSWORD="xsmtpsib-..." // Never share
SENDER_EMAIL="noreply@example.com"
DATABASE_URL="mysql://user:pass@host/db"
```

### .gitignore

```
.env
.env.local
.env.*.local
node_modules/
```

---

## Testing Checklist

- [ ] Valid email invitation
- [ ] Duplicate email rejection
- [ ] Password strength validation
- [ ] OTP expiration (after 15 min)
- [ ] Invalid OTP rejection
- [ ] Valid OTP acceptance
- [ ] User creation on acceptance
- [ ] Password hashing verification
- [ ] Resend invitation with new OTP
- [ ] Delete invitation
- [ ] Bulk status update
- [ ] Statistics endpoint

---

## Security Headers

### Recommended Helmet.js Configuration

```javascript
app.use(helmet({
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

---

## Conclusion

This implementation prioritizes:
1. ✅ **Type Safety**: Validates all inputs
2. ✅ **Security**: Hashes passwords & OTPs
3. ✅ **Error Handling**: Consistent response formats
4. ✅ **User Experience**: Clear error messages
5. ✅ **Best Practices**: Industry-standard patterns
