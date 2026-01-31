# Authentication Endpoints

## POST /api/login

Login user with email and password, creates session/token.

### Request Headers
```
Content-Type: application/json
Accept: application/json
```

### Request Body

**TypeScript Type:**
```typescript
interface LoginRequest {
  email: string;         // Required: Valid email format
  password: string;      // Required: Min 1 character
}
```

**JSON Example:**
```json
{
  "email": "xhadyayan@gmail.com",
  "password": "robotic123"
}
```

### Response (200 OK)

**TypeScript Type:**
```typescript
interface User {
  id: number | string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Contributor" | "Viewer";
  status: "Active" | "Inactive" | "Suspended";
  department: string | null;
  phone: string | null;
  bio: string | null;
  image: string | null;
  linkedin: string | null;
  last_login_at: string | null;      // ISO 8601 datetime or null
  last_login_ip: string | null;
  login_count: number;
  created_at: string;                // ISO 8601 datetime
  updated_at: string;                // ISO 8601 datetime
}

interface LoginResponse {
  data: User;
  message: string;
  status: 200;
}
```

**JSON Example:**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Admin",
    "status": "Active",
    "department": "Engineering",
    "phone": "+254712345678",
    "bio": "Sample bio",
    "image": "https://cdn.example.com/storage/users/user_1674816600_abc12345.jpg",
    "linkedin": "linkedin.com/in/johndoe",
    "last_login_at": "2026-01-26T10:30:00Z",
    "last_login_ip": "192.168.1.1",
    "login_count": 5,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Login successful",
  "status": 200
}
```

### Cookies/Session Setup

**For Session-Based Auth:**
```
Set-Cookie: session_id=abc123def456; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
```

**Frontend must send with:**
```javascript
// Include credentials in all subsequent requests
fetch('/api/endpoint', {
  credentials: 'include',  // CRITICAL for cookies
  headers: { 'Content-Type': 'application/json' }
});
```

**For JWT Token-Based Auth:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
```

**Or return in response body:**
```json
{
  "data": { /* user data */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "status": 200
}
```

### Response (401 Unauthorized)

**TypeScript Type:**
```typescript
interface UnauthorizedError {
  message: string;
  status: 401;
}
```

**JSON Example:**
```json
{
  "message": "The provided credentials do not match our records.",
  "status": 401
}
```

### Response (422 Validation Failed)

**TypeScript Type:**
```typescript
interface ValidationError {
  message: "Validation failed";
  errors: {
    [field: string]: string[];  // Array of error messages per field
  };
  status: 422;
}
```

**JSON Example:**
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required.", "The email must be a valid email address."],
    "password": ["The password field is required."]
  },
  "status": 422
}
```

### Logic
1. Validate email and password are present
2. Find user by email
3. Compare provided password with hashed password using bcrypt
4. On success:
   - Update `last_login_at`, `last_login_ip`, increment `login_count`
   - Return user data (exclude password, remember_token, two_factor fields)
   - Create session or JWT token
5. On failure: Return 401

### Key Points
- Use **bcrypt** for password comparison: `await bcrypt.compare(password, hash)`
- **IMPORTANT**: Never return the `password` field in response
- Update login tracking fields
- Session should contain user ID for subsequent requests
- Frontend sends this token/cookie with subsequent requests

### Implementation Notes
```javascript
// Express example
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate
    if (!email || !password) {
      return res.status(422).json({
        message: 'Validation failed',
        errors: { /* ... */ },
        status: 422
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Credentials do not match',
        status: 401
      });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        message: 'Credentials do not match',
        status: 401
      });
    }
    
    // Update login info
    user.last_login_at = new Date();
    user.last_login_ip = req.ip;
    user.login_count = (user.login_count || 0) + 1;
    await user.save();
    
    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    
    // Remove sensitive fields
    const userData = user.toJSON();
    delete userData.password;
    delete userData.remember_token;
    
    res.json({
      data: userData,
      message: 'Login successful',
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      message: 'Login failed: ' + error.message,
      status: 500
    });
  }
});
```

---

## POST /api/logout

Logout user, invalidate session/token.

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>  // If using JWT
// OR Cookie with session (auto-sent if session-based)
```

### Request Body

**TypeScript Type:**
```typescript
// No body required, but can be empty object
interface LogoutRequest {}
```

**JSON Example:**
```json
{}
```

### Response (200 OK)

**TypeScript Type:**
```typescript
interface LogoutResponse {
  message: string;
  status: 200;
}
```

**JSON Example:**
```json
{
  "message": "Logged out successfully",
  "status": 200
}
```

### Cookies Handling

**Clear Session Cookie (Backend sends):**
```
Set-Cookie: session_id=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/
```

**Frontend must clear stored token:**
```javascript
// Clear localStorage
localStorage.removeItem('token');
localStorage.removeItem('user');

// Clear sessionStorage if used
sessionStorage.removeItem('token');

// Fetch call
fetch('/api/logout', {
  method: 'POST',
  credentials: 'include',  // Important for sessions
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // If JWT
  }
});
```

### Logic
1. Get authenticated user from session/token
2. Update user's `last_active` timestamp
3. Invalidate/clear session/token
4. Return success

### Implementation Notes
```javascript
app.post('/api/logout', authMiddleware, async (req, res) => {
  try {
    // Update last_active
    const user = req.user; // From middleware
    user.last_active = new Date();
    await user.save();
    
    // Session-based
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', status: 500 });
      }
      res.clearCookie('session_id');
      res.json({ message: 'Logged out successfully', status: 200 });
    });
    
    // OR JWT-based: Add to blacklist or let frontend handle
    // Backend just confirms logout, frontend clears token
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', status: 500 });
  }
});
```

---

## GET /api/user

Get currently authenticated user profile.

### Request Headers
```
Authorization: Bearer <token>        // Required if using JWT
Accept: application/json
// OR Cookie with session (auto-sent if session-based)
```

### Query Parameters
```
// No query parameters for this endpoint
```

### Request Body
```
// No request body for GET request
```

### Response (200 OK)

**TypeScript Type:**
```typescript
interface AuthenticatedUserResponse {
  data: User;  // See User type from login response
  status: 200;
}

interface User {
  id: number | string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Contributor" | "Viewer";
  status: "Active" | "Inactive" | "Suspended";
  department: string | null;
  phone: string | null;
  bio: string | null;
  image: string | null;
  linkedin: string | null;
  last_active: string | null;        // ISO 8601 datetime
  created_at: string;                // ISO 8601 datetime
  updated_at: string;                // ISO 8601 datetime
}
```

**JSON Example:**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Admin",
    "status": "Active",
    "department": "Engineering",
    "phone": "+254712345678",
    "bio": "Sample bio",
    "image": "https://cdn.example.com/storage/users/user_1674816600_abc12345.jpg",
    "linkedin": "linkedin.com/in/johndoe",
    "last_active": "2026-01-26T14:30:00Z",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "status": 200
}
```

### Response (401 Unauthorized)

**TypeScript Type:**
```typescript
interface UnauthorizedError {
  message: "Unauthorized" | "Invalid token" | "Token expired";
  status: 401;
}
```

**JSON Example:**
```json
{
  "message": "Unauthorized",
  "status": 401
}
```

### Cookies/Authentication

**Must Include One Of:**

1. **JWT Token in Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Session Cookie (auto-sent by browser):**
```
Cookie: session_id=abc123def456; Path=/; HttpOnly
```

### Frontend Example

```typescript
// TypeScript example from frontend useAuth hook
const getAuthenticatedUser = async (): Promise<User> => {
  const response = await fetch('http://localhost:8000/api/user', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,  // If JWT
    },
    credentials: 'include',  // For cookies
  });
  
  if (!response.ok) {
    throw new Error('Unauthorized');
  }
  
  const result = await response.json();
  return result.data;
};
```

### Logic
1. Check if user is authenticated via token/session
2. If not: return 401
3. Fetch user data from database
4. Return current user data (exclude password, sensitive fields)

### Implementation Notes
```javascript
app.get('/api/user', authMiddleware, (req, res) => {
  // authMiddleware ensures req.user is set
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Unauthorized', 
      status: 401 
    });
  }
  
  // Exclude sensitive fields
  const userData = req.user.toJSON();
  delete userData.password;
  delete userData.remember_token;
  
  res.json({
    data: userData,
    status: 200
  });
});
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Admin",
    "status": "Active",
    "department": "Engineering",
    "phone": "+254712345678",
    "bio": "Sample bio",
    "image": "https://...",
    "last_active": "2026-01-26T14:30:00Z",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "status": 200
}
```

### Response (401 Unauthorized)
```json
{
  "message": "Unauthorized",
  "status": 401
}
```

### Logic
1. Check if user is authenticated via token/session
2. Return current user data
3. If not authenticated, return 401

### Implementation Notes
```javascript
app.get('/api/user', authMiddleware, (req, res) => {
  // req.user is set by authMiddleware
  res.json({
    data: req.user,
    status: 200
  });
});
```

---

## Authentication Strategy Decision

You need to choose ONE of:

### Option 1: JWT Tokens (Recommended for API)
```javascript
// Pros: Stateless, scalable, works with multiple servers
// Cons: Can't revoke immediately (use blacklist)

const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Frontend stores in localStorage/sessionStorage
// Sends with every request: Authorization: Bearer <token>
```

### Option 2: Session Cookies
```javascript
// Pros: More secure (httpOnly), backend controls expiry
// Cons: Stateful, harder to scale

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
}));

req.session.userId = user.id;
```

### Option 3: Hybrid (JWT + Refresh Token)
```javascript
// Access token (short-lived): 15 minutes
// Refresh token (long-lived): 7 days
// Most secure option

const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

// Store refresh token in database or cookie
res.cookie('refreshToken', refreshToken, { httpOnly: true });
res.json({ accessToken });
```

---

## Middleware Example

```javascript
// authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'No token provided', 
        status: 401 
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from database
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not found', 
        status: 401 
      });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token', 
      status: 401 
    });
  }
}

module.exports = authMiddleware;
```

---

## Frontend Integration

```javascript
// Frontend (React/Vue)
const login = async (email, password) => {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // For cookies
  });
  
  const { data, status } = await res.json();
  
  if (status === 200) {
    // Store token
    localStorage.setItem('token', data.token);
    // Store user info
    localStorage.setItem('user', JSON.stringify(data));
    return true;
  }
  return false;
};

// Subsequent requests
const api = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
};
```

---

**Next**: Review user management and invitation flows in 03-USER-MANAGEMENT.md
