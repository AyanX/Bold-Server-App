# Setup, Environment & Common Gotchas

## Environment Setup

### Laravel (.env)
```
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite
MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

### Express (.env.local or config.js)
```
DATABASE_URL="sqlite:./database.sqlite"
# OR for MySQL
DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# Email Configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=...
SMTP_PASS=...

# JWT/Auth
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# File Storage
STORAGE_PATH=./public/storage
# OR AWS S3
AWS_BUCKET=...
AWS_REGION=...
AWS_KEY=...
AWS_SECRET=...

# Server
NODE_ENV=development
PORT=3000
```

## Critical Environment Differences

### 1. **Database Connection**
- Laravel uses Eloquent ORM built in
- Express requires explicit ORM setup:
  - **Prisma** (recommended): Modern, type-safe
  - **TypeORM**: Full-featured ORM
  - **Sequelize**: SQL focused
  - **Knex.js**: Query builder

### 2. **File Permissions**
- Laravel: Auto-creates `storage/`, `bootstrap/cache/` directories
- Express: Need to manually ensure `./uploads/`, `./public/` exist
- File permissions might differ on Linux vs Windows

### 3. **Timezone Handling**
```php
// Laravel
'timezone' => 'Africa/Nairobi',
now()->toISOString();
```

```javascript
// Express - Store as UTC always, convert on frontend
const now = new Date();
// Use ISO strings: 2026-01-26T10:30:00Z
```

### 4. **String Manipulation**
- PHP: `Str::random(8)`, `str_pad()`, `json_encode()`
- JavaScript: `crypto.randomBytes()`, `String.padStart()`, `JSON.stringify()`

## Critical Gotchas - MUST READ

### ❌ GOTCHA #1: Async/Await Errors
**Problem**: Forgetting `await` on database calls
```javascript
// WRONG - Returns Promise, not data
const user = User.findById(1);
console.log(user.name); // undefined

// CORRECT
const user = await User.findById(1);
console.log(user.name); // "John"
```

### ❌ GOTCHA #2: Type Coercion Issues
**Problem**: JavaScript's loose typing causes subtle bugs
```javascript
// WRONG - These aren't equal
if ('123' === 123) { } // false

// Values from database/requests are often strings
const price = req.body.price; // "99.99" (string)
const total = price * 2; // 199.98 - works but returns number

// CORRECT - Always validate/convert explicitly
const price = parseFloat(req.body.price);
```

### ❌ GOTCHA #3: Password Field Leakage
**Problem**: Accidentally returning password in responses
```javascript
// WRONG - User object includes password
res.json({ data: user });

// CORRECT - Explicitly exclude sensitive fields
const { password, ...userData } = user.toJSON();
res.json({ data: userData });

// OR use Prisma select
const user = await User.findById(id, {
  select: { password: false, id: true, name: true }
});
```

### ❌ GOTCHA #4: Empty String vs Null
**Problem**: Your Laravel code specifically converts empty strings to null
```javascript
// Laravel code does this:
$input[$key] = $value === '' ? null : $value;

// You MUST replicate in Express
const cleanInput = (obj) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === '' || obj[key] === []) {
      obj[key] = null;
    }
  });
  return obj;
};
```

### ❌ GOTCHA #5: Unexpected Array JSON Encoding
**Problem**: Your code converts arrays to JSON strings for DB storage
```javascript
// Laravel stores as JSON string: '["tag1","tag2"]'
// When retrieved, it auto-casts to array

// Express doesn't auto-cast unless you configure it
// Option 1: Manually JSON.stringify/parse
article.meta_tags = JSON.stringify(tags);

// Option 2: Use ORM column type hints
// Prisma example:
model Article {
  meta_tags Json  // Automatically handled
}

// Option 3: JSON column in database (MySQL)
CREATE TABLE articles (
  meta_tags JSON
);
```

### ❌ GOTCHA #6: Regex/Slug Generation
**Problem**: Different behavior between PHP and JS
```php
// Laravel
Str::slug('Hello World!'); // 'hello-world'
```

```javascript
// Express - No built-in equivalent
const slug = str
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_]+/g, '-')
  .replace(/^-+|-+$/g, '');

// OR use a library
import slugify from 'slugify';
const slug = slugify(title);
```

### ❌ GOTCHA #7: Date/Time Handling
**Problem**: Timezone confusion and format differences
```javascript
// WRONG - Assumes server timezone
new Date('2026-01-26'); // May parse as UTC or local

// CORRECT - Always be explicit
const date = new Date('2026-01-26T00:00:00Z');

// For ORM:
// Prisma automatically converts to ISO strings
// Make sure database stores as TIMESTAMP

// When comparing:
if (invitation.otp_expires_at < new Date()) { } // Expired
```

### ❌ GOTCHA #8: Null vs Undefined
**Problem**: JavaScript distinguishes between them
```javascript
// Problematic code:
if (!user.role) { } // true for undefined, null, '', 0, false

// CORRECT - Be explicit
if (user.role === null || user.role === undefined) { }
if (user.role == null) { } // Works for both

// When returning JSON - nulls are preserved
res.json({ role: undefined }); // Returns: role: null
```

### ❌ GOTCHA #9: Request Validation Order
**Problem**: Your Laravel code validates differently than typical Express
```javascript
// Laravel validates after converting empty strings to null
// Express typically validates raw input first

// Correct order for Express:
1. Clean input (convert '' to null)
2. Validate
3. Normalize (convert types, stringify arrays)
4. Save to database
```

### ❌ GOTCHA #10: Response Status Codes
**Problem**: Inconsistent status codes between frameworks
```javascript
// Your Laravel consistently uses:
// 200 - Success (GET, PUT, DELETE)
// 201 - Created (POST that creates)
// 400 - Bad request
// 401 - Unauthorized
// 404 - Not found
// 422 - Validation failed
// 500 - Server error

// Express: Use the same convention!
res.status(422).json({ errors, status: 422 });
```

### ❌ GOTCHA #11: Case Sensitivity in Requests
**Problem**: Your frontend uses camelCase, database uses snake_case
```javascript
// Request body (from frontend):
{
  "firstName": "John",
  "targetUrl": "https://example.com"
}

// Database schema:
{
  first_name: "John",
  target_url: "https://example.com"
}

// Solution: Create mapping function
const mapRequestToDB = (data) => ({
  first_name: data.firstName,
  target_url: data.targetUrl,
});

// Response (to frontend):
const mapDBToResponse = (data) => ({
  firstName: data.first_name,
  targetUrl: data.target_url,
});
```

### ❌ GOTCHA #12: Hash Verification
**Problem**: OTP/password verification requires correct method
```javascript
// WRONG - Comparing raw strings
if (otp === invitation.otp_hash) { } // Always false

// CORRECT - Use bcrypt
const bcrypt = require('bcrypt');
const isValid = await bcrypt.compare(otp, invitation.otp_hash);
```

### ❌ GOTCHA #13: Concurrency & Race Conditions
**Problem**: Express is async, easy to cause race conditions
```javascript
// WRONG - Race condition with OTP expiry check
const invitation = await Invitation.findOne({ email });
if (new Date() > invitation.otp_expires_at) {
  // Between finding and this check, invitation could change
}

// BETTER - Use database transaction
const invitation = await db.transaction(async (trx) => {
  const inv = await trx('invitations')
    .where('email', email)
    .first();
  
  if (new Date() > inv.otp_expires_at) {
    await trx('invitations').where('id', inv.id).update({ status: 'expired' });
    throw new Error('Expired');
  }
  return inv;
});
```

### ❌ GOTCHA #14: Email Sending Failure Handling
**Problem**: Your code sends emails but doesn't block on failure
```php
// Laravel
try {
  Mail::to($user->email)->send(new WelcomeEmail($user));
} catch (\Exception $e) {
  Log::error("Failed to send: " . $e->getMessage());
  // Don't fail the user creation
}
```

```javascript
// Express - Same pattern
try {
  await sendEmail({ to: user.email, ... });
} catch (error) {
  logger.error('Email send failed:', error);
  // Continue, don't throw
}

// GOTCHA: Email sending is often async
// Queue emails with Bull/BullMQ for better reliability
```

### ❌ GOTCHA #15: IP Address Extraction
**Problem**: Behind proxies, IP extraction differs
```javascript
// WRONG - Direct approach fails behind reverse proxy
const ip = req.socket.remoteAddress; // May be proxy IP

// CORRECT
const ip = req.headers['x-forwarded-for']?.split(',')[0] 
  || req.socket.remoteAddress;

// Or use middleware like 'proxy-addr'
const proxyAddr = require('proxy-addr');
const ip = proxyAddr(req, '127.0.0.1');
```

## Module Installation for Common Tasks

```bash
# ORM & Database
npm install prisma @prisma/client
npm install typeorm reflect-metadata

# Authentication
npm install jsonwebtoken bcrypt

# Validation
npm install zod joi express-validator

# File Upload
npm install multer

# Email
npm install nodemailer

# Utilities
npm install slugify uuid dotenv

# Type checking
npm install typescript @types/node @types/express -D
```

## Next Steps

1. Set up environment variables correctly
2. Choose your ORM (Prisma recommended)
3. Read the next section on authentication
4. Migrate database schema
5. Implement routes one by one, testing with Postman/Insomnia

---

**Critical**: Don't skip the gotchas section - these are real issues that will cause bugs in production!
