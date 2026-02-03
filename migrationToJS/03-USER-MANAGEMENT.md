# User Management Endpoints

## GET /api/users

List all users with optional filters and article statistics.

### Request Headers
```
Authorization: Bearer <token>     // Required
Accept: application/json
```

### Query Parameters

**Type Definition:**
```typescript

interface GetUsersQuery {
  search?: string;      // Optional: Search by name, email, or department
  role?: "Admin" | "Editor" | "Contributor" | "Viewer";
  status?: "Active" | "Inactive" | "Suspended";
}

```
**Example:**
```
GET /api/users?search=john&role=Admin&status=Active
```

### Response (200 OK)


**Type Definition:**
```typescript
interface UserWithStats {
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
  last_active: string | null;      
  login_count: number;
  last_login_at: string | null;         
  last_login_ip: string | null;
  article_count: number;
  published_count: number;
  draft_count: number;
  total_views: number;
  avg_seo_score: number;
  created_at: string;                  
  updated_at: string;            
}

interface GetUsersResponse {
  data: UserWithStats[];
  status: 200;
}

```

**JSON Example:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin",
      "status": "Active",
      "department": "Engineering",
      "phone": "+254712345678",
      "bio": "Lorem ipsum",
      "image": "https://cdn.example.com/storage/users/user_1674816600_abc12345.jpg",
      "linkedin": "linkedin.com/in/johndoe",
      "last_active": "2026-01-26T10:30:00Z",
      "login_count": 15,
      "last_login_at": "2026-01-26T09:00:00Z",
      "last_login_ip": "192.168.1.1",
      "article_count": 5,
      "published_count": 4,
      "draft_count": 1,
      "total_views": 1250,
      "avg_seo_score": 78,
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-26T10:30:00Z"
    }
  ],
  "status": 200
}
```

### Frontend Example

```typescript
// Using frontend API service
const getUsers = async (search?: string, role?: string, status?: string) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  if (status) params.append('status', status);
  
  const response = await fetch(`/api/users?${params.toString()}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  return response.json();
};
```

### Logic
1. Start with base query: `User.find()`
2. Apply filters:
   - If `search`: filter by name LIKE, email LIKE, or department LIKE
   - If `role`: filter by exact role
   - If `status`: filter by exact status

3. Order by created_at DESC
4. For each user:
   - Count articles where author = user.name
   - Count published articles (status = 'Published')
   - Count draft articles
   - Sum views from all articles
   - Average SEO score
5. Exclude password fields

---

## GET /api/users/{id}

Get single user with detailed statistics.

### Request Headers
```
Authorization: Bearer <token>
Cookie: XSRF-TOKEN=...; laravel_session=...  # Required for session auth
Accept: application/json
```

### Path Parameters
```typescript
interface PathParams {
  id: number | string;  // User ID
}
```

### Response Types

```typescript
// Article summary in user context
interface UserArticleSummary {
  id: number | string;
  title: string;
  slug: string;
  status: ArticleStatus;
  views: number;
  clicks: number;
  created_at: string;
}

// Inviter info (if user was invited)
interface UserInviterInfo {
  id: number | string;
  name: string;
  email: string;
}

// Single user with full details
interface UserDetailResponse {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  department?: string | null;
  phone?: string | null;
  bio?: string | null;
  image?: string | null;
  linkedin?: string | null;
  last_active?: string | null;
  login_count?: number;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  article_count: number;
  published_count: number;
  draft_count: number;
  total_views: number;
  total_clicks?: number;
  avg_seo_score: number;
  created_at: string;
  updated_at: string;
  articles?: UserArticleSummary[];
  inviter?: UserInviterInfo;
}

// Success response
interface GetUserResponse {
  data: UserDetailResponse;
  status: 200;
}

// Error response
interface UserNotFoundError {
  message: "User not found";
  status: 404;
}
```

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
    "bio": "Senior Engineer focused on backend systems",
    "image": "https://cdn.example.com/storage/users/user_1674816600_abc12345.jpg",
    "linkedin": "linkedin.com/in/johndoe",
    "last_active": "2026-01-26T10:30:00Z",
    "login_count": 45,
    "last_login_at": "2026-01-26T10:30:00Z",
    "last_login_ip": "192.168.1.100",
    "article_count": 12,
    "published_count": 10,
    "draft_count": 2,
    "total_views": 3250,
    "total_clicks": 180,
    "avg_seo_score": 82,
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-26T10:30:00Z",
    "articles": [
      {
        "id": 10,
        "title": "Building Scalable APIs",
        "slug": "building-scalable-apis",
        "status": "Published",
        "views": 350,
        "clicks": 45,
        "created_at": "2026-01-20T10:00:00Z"
      },
      {
        "id": 9,
        "title": "Database Optimization Tips",
        "slug": "database-optimization-tips",
        "status": "Published",
        "views": 280,
        "clicks": 35,
        "created_at": "2026-01-15T10:00:00Z"
      }
    ],
    "inviter": {
      "id": 2,
      "name": "Sarah Johnson",
      "email": "sarah@example.com"
    }
  },
  "status": 200
}
```

### Response (404 Not Found)
```json
{
  "message": "User not found",
  "status": 404
}
```

### Response (401 Unauthorized)
```json
{
  "message": "Unauthenticated",
  "status": 401
}
```

### Frontend Example

```typescript
import { UserDetailResponse, GetUserResponse } from './types';

const getUserDetails = async (userId: number | string, token: string): Promise<UserDetailResponse> => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('User not found');
    } else if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch user');
  }

  const result = await response.json() as GetUserResponse;
  return result.data;
};

// Usage
try {
  const user = await getUserDetails(1, 'your-token-here');
  console.log(`User: ${user.name}, Articles: ${user.article_count}`);
} catch (error) {
  console.error(error);
}
```

### Logic
1. Verify user is authenticated (check JWT token or session cookie)
2. Query user by ID
3. If user not found, return 404
4. Count articles where author = user.name
5. Count published articles (status = 'Published')
6. Count draft articles
7. Sum views from all articles
8. Calculate average SEO score
9. If user was invited, fetch inviter info
10. If requested, fetch user's articles (limit to 10 most recent)
11. Exclude password and sensitive fields
12. Return user with statistics

---

## POST /api/users

Create user directly (without invitation). Requires admin role.

### Request Headers
```
Authorization: Bearer <token>
Cookie: XSRF-TOKEN=...; laravel_session=...
Content-Type: application/json
Accept: application/json
```

### Request Body Type
```typescript
interface CreateUserRequest {
  name: string;                        // Required, max 255
  email: string;                       // Required, unique email
  password?: string;                   // Optional, min 8 chars
  role?: UserRole;                     // Optional, default: "Contributor"
  status?: UserStatus;                 // Optional, default: "Active"
  department?: string;                 // Optional, max 100
  phone?: string;                      // Optional, max 20
  bio?: string;                        // Optional, max 1000
}

interface CreateUserResponse {
  data: {
    id: number | string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    department?: string | null;
    phone?: string | null;
    bio?: string | null;
    image?: null;
    linkedin?: null;
    created_at: string;
  };
  message: string;
  status: 201;
}
```

### Request Body
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "role": "Editor",
  "status": "Active",
  "department": "Marketing",
  "phone": "+254712345679",
  "bio": "Marketing specialist"
}
```

### Response (201 Created)
```json
{
  "data": {
    "id": 5,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "Editor",
    "status": "Active",
    "department": "Marketing",
    "phone": "+254712345679",
    "bio": "Marketing specialist",
    "image": null,
    "linkedin": null,
    "created_at": "2026-01-26T10:30:00Z"
  },
  "message": "User created successfully. Welcome email sent.",
  "status": 201
}
```

### Response (422 Validation Failed)
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."],
    "role": ["The selected role is invalid."]
  },
  "status": 422
}
```

### Response (401 Unauthorized)
```json
{
  "message": "Unauthenticated",
  "status": 401
}
```

### Response (403 Forbidden)
```json
{
  "message": "Only admin users can create users directly",
  "status": 403
}
```

### Frontend Example

```typescript
import { CreateUserRequest, CreateUserResponse } from './types';

const createUser = async (userData: CreateUserRequest, token: string) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password || undefined,
      role: userData.role || 'Contributor',
      status: userData.status || 'Active',
      department: userData.department,
      phone: userData.phone,
      bio: userData.bio
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw {
      status: response.status,
      message: error.message,
      errors: error.errors
    };
  }

  const result = await response.json() as CreateUserResponse;
  return result.data;
};

// Usage
try {
  const newUser = await createUser({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'Secure123!',
    role: 'Editor',
    department: 'Marketing'
  }, token);
  console.log('User created:', newUser.id);
} catch (error) {
  console.error('Failed to create user:', error);
}
```

### Validation
- `name`: required, string, max 255
- `email`: required, email format, unique in users table
- `password`: optional string, if provided must be min 8 chars
- `role`: optional, must be one of: Admin, Editor, Contributor, Viewer (default: Contributor)
- `status`: optional, must be one of: Active, Inactive, Suspended (default: Active)
- `department`: optional, string, max 100
- `phone`: optional, string, max 20
- `bio`: optional, string, max 1000

### Logic
1. Verify user is authenticated
2. Verify user has Admin role
3. Validate input fields
4. Check email uniqueness
5. Hash password using bcrypt (or generate random 8-char password if not provided)
6. Create user record
7. Send welcome email with credentials
8. Return created user (without password)
9. If email send fails, log error but still return 201
2. If no password provided: Generate random 6-digit number
3. Hash password with bcrypt
4. Set `invited_via` = 'direct'
5. Create user record
6. Send welcome email with user.email and temporaryPassword
7. **Important**: Email sending failure should NOT block user creation (catch, log, continue)
8. Return created user (exclude password, remember_token, 2FA fields)

### Key Points
- Welcome email should contain temporary password or login link
- Email sending is async but doesn't block the response
- Always exclude password from response

---

## POST /api/users/invite

Invite user with OTP (One-Time Password). Requires admin role.

### Request Headers
```
Authorization: Bearer <token>
Cookie: XSRF-TOKEN=...; laravel_session=...
Content-Type: application/json
Accept: application/json
```

### Request Body Type
```typescript
interface InviteUserRequest {
  name: string;                        // Required, max 255
  email: string;                       // Required, email, unique
  role?: UserRole;                     // Optional, default: "Contributor"
  department?: string;                 // Optional, max 100
  phone?: string;                      // Optional, max 20
  bio?: string;                        // Optional, max 1000
  image?: string;                      // Optional, URL
}

interface OtpInvitation {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  phone?: string | null;
  bio?: string | null;
  image?: string | null;
  status: "pending";
  otp_expires_at: string;              // ISO 8601 datetime
  created_at: string;
}

interface InviteUserResponse {
  data: {
    invitation: OtpInvitation;
    otp: string;                       // 6-digit OTP (dev only)
    expires_at: string;                // ISO 8601 datetime
    email_sent: boolean;
  };
  message: string;
  status: 201;
}
```

### Request Body
```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "role": "Contributor",
  "department": "Sales",
  "phone": "+254712345680",
  "bio": "Sales representative",
  "image": "https://cdn.example.com/users/bob.jpg"
}
```

### Response (201 Created)
```json
{
  "data": {
    "invitation": {
      "id": 1,
      "name": "Bob Wilson",
      "email": "bob@example.com",
      "role": "Contributor",
      "department": "Sales",
      "phone": "+254712345680",
      "bio": "Sales representative",
      "image": "https://cdn.example.com/users/bob.jpg",
      "status": "pending",
      "otp_expires_at": "2026-01-27T10:30:00Z",
      "created_at": "2026-01-26T10:30:00Z"
    },
    "otp": "123456",
    "expires_at": "2026-01-27T10:30:00Z",
    "email_sent": true
  },
  "message": "Invitation sent successfully. User will receive an email with temporary OTP.",
  "status": 201
}
```

### Response (422 Validation Failed)
```json
{
  "message": "Validation failed",
  "errors": {
    "email": [
      "The email has already been taken.",
      "This email has already been invited."
    ],
    "role": ["The selected role is invalid."]
  },
  "status": 422
}
```

### Response (401 Unauthorized)
```json
{
  "message": "Unauthenticated",
  "status": 401
}
```

### Response (403 Forbidden)
```json
{
  "message": "Only admin users can send invitations",
  "status": 403
}
```

### Frontend Example

```typescript
import { InviteUserRequest, InviteUserResponse } from './types';

const inviteUser = async (invitationData: InviteUserRequest, token: string) => {
  const response = await fetch('/api/users/invite', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      name: invitationData.name,
      email: invitationData.email,
      role: invitationData.role || 'Contributor',
      department: invitationData.department,
      phone: invitationData.phone,
      bio: invitationData.bio,
      image: invitationData.image
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw {
      status: response.status,
      message: error.message,
      errors: error.errors
    };
  }

  const result = await response.json() as InviteUserResponse;
  return result.data;
};

// Usage
try {
  const invitation = await inviteUser({
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Editor',
    department: 'Sales'
  }, token);
  
  console.log(`Invitation sent to ${invitation.invitation.email}`);
  console.log(`OTP expires at: ${invitation.expires_at}`);
} catch (error) {
  console.error('Failed to send invitation:', error);
}
```

### Validation
- `name`: required, string, max 255
- `email`: required, email format, unique in both users and user_invitations tables
- `role`: optional, must be one of: Admin, Editor, Contributor, Viewer (default: Contributor)
- `department`: optional, string, max 100
- `phone`: optional, string, max 20
- `bio`: optional, string, max 1000
- `image`: optional, string (valid URL)

### Logic
1. Verify user is authenticated
2. Verify user has Admin role
3. Validate input fields
4. Check email is unique in users table
5. Check email is unique in user_invitations table (no pending/active invitations)
6. Generate 6-digit random OTP (000000-999999)
7. Hash OTP using bcrypt with 10 rounds
8. Set OTP expiry to 24 hours from current time
9. Find inviter (current authenticated user or first admin)
10. Create UserInvitation record in database:
    - All user data fields
    - otp_code (plaintext, only for dev/testing)
    - otp_hash (bcrypt hashed)
    - otp_expires_at (24 hours from now)
    - invited_by (inviter ID)
    - status: 'pending'
11. Send invitation email (InvitationMail) with:
    - User name
    - OTP (6 digits)
    - Invitation link with encoded email
    - Expiry time
12. Return invitation data with OTP (OTP included only in dev environments)
13. Always return 201 even if email sending fails (log error separately)

### Database Schema (user_invitations)
```sql
CREATE TABLE user_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'Contributor',
  department VARCHAR(100),
  phone VARCHAR(20),
  bio VARCHAR(1000),
  image VARCHAR(255),
  otp_code VARCHAR(6),
  otp_hash VARCHAR(255) NOT NULL,
  otp_expires_at TIMESTAMP NOT NULL,
  invited_by INT REFERENCES users(id),
  status ENUM('pending', 'accepted', 'expired', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Important Notes
- OTP must be 6 digits (000000-999999 inclusive)
- OTP hashing: Use bcrypt with 10 rounds, same as Laravel's password hashing
- OTP is stored both in plaintext (otp_code for dev/testing) and hashed (otp_hash for validation)
- OTP must be verified before user can accept invitation (see POST /api/users/accept-invitation)
- Multiple invitations to same email: Cancel previous pending invitations or reject new attempt
- Email sending is async and must not block the 201 response

## POST /api/users/accept-invitation

Accept invitation and create user account. OTP must be valid and not expired.

### Request Headers
```
Content-Type: application/json
Accept: application/json
```

### Request Body Type
```typescript
interface AcceptInvitationRequest {
  email: string;                       // Required, valid email
  otp: string;                         // Required, 6-digit code
  password: string;                    // Required, min 8 chars
  password_confirmation: string;       // Required, must match password
}

interface AcceptInvitationResponse {
  data: {
    id: number | string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    department?: string | null;
    phone?: string | null;
    bio?: string | null;
    image?: string | null;
    created_at: string;
  };
  message: string;
  status: 201;
}
```

### Request Body
```json
{
  "email": "bob@example.com",
  "otp": "123456",
  "password": "NewPassword123",
  "password_confirmation": "NewPassword123"
}
```

### Response (201 Created)
```json
{
  "data": {
    "id": 6,
    "name": "Bob Wilson",
    "email": "bob@example.com",
    "role": "Contributor",
    "status": "Active",
    "department": "Sales",
    "phone": "+254712345680",
    "bio": "Sales representative",
    "image": "https://cdn.example.com/users/bob.jpg",
    "created_at": "2026-01-26T10:30:00Z",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "message": "Invitation accepted. Account created successfully.",
  "status": 201
}
```

### Response (400 Bad Request - Invalid OTP)
```json
{
  "message": "Invalid OTP code",
  "status": 400
}
```

### Response (400 Bad Request - Expired OTP)
```json
{
  "message": "OTP has expired",
  "status": 400
}
```

### Response (400 Bad Request - No Invitation)
```json
{
  "message": "No pending invitation found for this email",
  "status": 400
}
```

### Response (422 Validation Failed)
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "otp": ["The otp must be 6 characters."],
    "password": ["The password must be at least 8 characters."],
    "password_confirmation": ["The password confirmation does not match."]
  },
  "status": 422
}
```

### Frontend Example

```typescript
import { AcceptInvitationRequest, AcceptInvitationResponse } from './types';

const acceptInvitation = async (invitationData: AcceptInvitationRequest) => {
  const response = await fetch('/api/users/accept-invitation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      email: invitationData.email,
      otp: invitationData.otp,
      password: invitationData.password,
      password_confirmation: invitationData.password_confirmation
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw {
      status: response.status,
      message: error.message,
      errors: error.errors
    };
  }

  const result = await response.json() as AcceptInvitationResponse;
  return result.data;
};

// Usage
try {
  const newUser = await acceptInvitation({
    email: 'bob@example.com',
    otp: '123456',
    password: 'NewPassword123',
    password_confirmation: 'NewPassword123'
  });
  
  console.log(`Account created for ${newUser.email}`);
  // Redirect to login page
} catch (error) {
  console.error('Failed to accept invitation:', error.message);
}
```

### Validation
- `email`: required, email format, must match existing pending invitation
- `otp`: required, string, exactly 6 characters, digits only
- `password`: required, string, min 8 characters
- `password_confirmation`: required, must match password field exactly

### Logic
1. Validate all input fields
2. Find UserInvitation where:
   - email matches (case-insensitive)
   - status = 'pending'
3. If not found:
   - If invitation exists but status != 'pending': return 400 with appropriate message
   - If no invitation found: return 400 "No pending invitation found"
4. Check if OTP is expired:
   - If `otp_expires_at < now()`:
     - Update invitation.status = 'expired'
     - Return 400 "OTP has expired"
5. Verify OTP using bcrypt:
   - Compare OTP with otp_hash using bcrypt.compare()
   - If mismatch: return 400 "Invalid OTP code"
6. Increment failed attempt counter (optional, for brute force protection)
7. Hash new password using bcrypt (10 rounds)
8. Create new User record with:
   - All data from invitation (name, email, role, department, phone, bio, image)
   - password_hash (hashed password)
   - status: 'Active'
   - role: from invitation
   - invited_via: 'invitation'
   - invited_by: from invitation
   - invitation_accepted_at: current timestamp
9. Update UserInvitation:
   - status: 'accepted'
   - accepted_at: current timestamp
10. Send welcome email to user
11. Return created user (exclude password, 2FA fields)

### Important Notes
- OTP verification: Always use bcrypt.compare() for secure comparison
- OTP is case-sensitive, exactly 6 digits
- After OTP validation failure: Log attempt (for security audit)
- Password must be hashed using bcrypt (10 rounds) before storage
- Must NOT return password or hashed password in response
- Invitation cannot be accepted twice (status prevents this)
- The created user is immediately active and can log in

---

## POST /api/users/invite/image

Upload image during invitation process (separate endpoint for multipart).

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
    "url": "https://yourcdn.com/storage/users/user_1674816600_abc12345.jpg"
  },
  "message": "Image uploaded successfully",
  "status": 200
}
```

### Response (422 Validation Failed)
```json
{
  "message": "Validation failed",
  "errors": {
    "image": ["The image must be a file of type: jpeg, png, jpg, gif, webp.", "The image may not be greater than 5048 kilobytes."]
  },
  "status": 422
}
```

### Validation
- `image`: required, file, mimes: jpeg,png,jpg,gif,webp, max: 5048 KB

### Logic
1. Validate file
2. Generate filename: `user_<timestamp>_<randomString>.<ext>`
3. Store in `public/storage/users/` directory
4. Return path and public URL

### Implementation Notes
```javascript
// Express with multer
const multer = require('multer');
const storage = multer.diskStorage({
  destination: './public/storage/users/',
  filename: (req, file, cb) => {
    const name = `user_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    cb(null, name + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5048 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

---

## GET /api/users/invitations/list

List all pending/active invitations.

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Bob Wilson",
      "email": "bob@example.com",
      "role": "Contributor",
      "status": "pending",
      "otp_expires_at": "2026-01-27T10:30:00Z",
      "invited_by": 1,
      "created_at": "2026-01-26T10:30:00Z"
    }
  ],
  "status": 200
}
```

---

## POST /api/users/invitations/{id}/resend

Resend OTP to invited user.

### Request Body
```json
{}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "email": "bob@example.com",
    "otp_expires_at": "2026-01-27T14:30:00Z"
  },
  "message": "Invitation resent successfully",
  "status": 200
}
```

### Logic
1. Find UserInvitation by ID
2. Generate new OTP and hash
3. Update: otp_code, otp_hash, otp_expires_at (24 hours from now)
4. Send InvitationMail with new OTP
5. Return updated invitation

---

## DELETE /api/users/invitations/{id}

Cancel/delete an invitation.

### Response (200 OK)
```json
{
  "message": "Invitation cancelled successfully",
  "status": 200
}
```

### Logic
1. Find invitation by ID
2. Delete the record
3. Return success

---

## POST /api/users/{id}/image

Upload user profile image.

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
    "url": "https://yourcdn.com/storage/users/user_1674816600_abc12345.jpg"
  },
  "message": "Image uploaded successfully",
  "status": 200
}
```

### Logic
Same as invite image upload

---

## PATCH /api/users/{id}/status

Update user status (Active, Inactive, Suspended).

### Request Body
```json
{
  "status": "Suspended"
}
```

### Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "status": "Suspended",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "status": 200
}
```

### Validation
- `status`: required, in [Active, Inactive, Suspended]

---

## POST /api/users/bulk-status

Update status for multiple users.

### Request Body
```json
{
  "user_ids": [1, 2, 3],
  "status": "Inactive"
}
```

### Response (200 OK)
```json
{
  "message": "3 users updated successfully",
  "status": 200
}
```

### Logic
1. Update all users where ID in user_ids
2. Set status to provided value
3. Return count of updated records

---

## GET /api/users/statistics/overview

Get user statistics for dashboard.

### Response (200 OK)
```json
{
  "data": {
    "total_users": 25,
    "active_users": 20,
    "inactive_users": 3,
    "suspended_users": 2,
    "users_by_role": {
      "Admin": 2,
      "Editor": 5,
      "Contributor": 12,
      "Viewer": 6
    },
    "new_users_this_week": 3,
    "new_users_this_month": 8
  },
  "status": 200
}
```

### Logic
1. Count total users
2. Count by status
3. Count by role
4. Count where created_at >= 7 days ago
5. Count where created_at >= 30 days ago

---

## POST /api/forgot-password

Initiate password reset flow.

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Response (200 OK)
```json
{
  "message": "If an account exists for this email, you will receive an OTP shortly.",
  "status": 200
}
```

### Response (422 Validation)
```json
{
  "message": "Validation failed",
  "errors": { "email": ["The email field is required."] },
  "status": 422
}
```

### Logic
1. Validate email format
2. Find user by email
3. If not found: Still return 200 (don't leak info)
4. If found:
   - Generate 6-digit OTP
   - Hash with bcrypt
   - Store in password_reset_token with expiry 1 hour
   - Send PasswordResetOtpMail
5. Return generic success message

### Database Schema
```
Create password_reset_tokens table (optional, or use temporary field):
id, email, otp_hash, otp_code, expires_at
```

---

## POST /api/reset-password

Complete password reset.

### Request Body
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "password": "NewPassword123",
  "password_confirmation": "NewPassword123"
}
```

### Response (200 OK)
```json
{
  "message": "Password reset successfully",
  "status": 200
}
```

### Response (400 Bad Request)
```json
{
  "message": "Invalid or expired OTP",
  "status": 400
}
```

### Validation
- `email`: required, email
- `otp`: required, string, min 6
- `password`: required, string, min 8
- `password_confirmation`: required, same as password

### Logic
1. Find password reset token by email
2. Check if expired: expires_at < now()
3. Verify OTP: bcrypt.compare(otp, otp_hash)
4. If valid:
   - Update user password
   - Delete password reset token
   - Return success
5. If invalid: Return 400

---

**Next**: Review article management in 04-ARTICLES.md
