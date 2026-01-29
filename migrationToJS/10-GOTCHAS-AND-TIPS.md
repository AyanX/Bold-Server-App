# Critical Gotchas and Best Practices for Migration

## 🔴 CRITICAL GOTCHAS (Read These!)

### 1. Response Format Must Stay Consistent

Your frontend expects a specific response format. **DO NOT CHANGE IT.**

```javascript
// ✅ CORRECT - Matches Laravel exactly
res.status(200).json({
  data: {},
  message: "Optional message",
  status: 200
});

// ❌ WRONG - Will break frontend
res.json({ 
  success: true,
  result: {}
});
```

**Impact**: Frontend will break completely if response format differs.

---

### 2. CamelCase vs Snake_Case Confusion

**Problem**: Frontend sends camelCase, database expects snake_case, but you must return what the frontend expects.

```javascript
// Request from frontend
{
  "targetUrl": "https://example.com",
  "startDate": "2026-01-01"
}

// Store in database as
{
  target_url: "https://example.com",
  start_date: "2026-01-01"
}

// Response to frontend must convert back!
res.json({
  data: {
    targetUrl: campaign.target_url,
    startDate: campaign.start_date
  }
});
```

**Solution**: Create helper functions for mapping:

```javascript
const toCamelCase = (dbObject) => {
  return {
    targetUrl: dbObject.target_url,
    startDate: dbObject.start_date,
    // ... etc
  };
};

const toSnakeCase = (requestData) => {
  return {
    target_url: requestData.targetUrl,
    start_date: requestData.startDate,
    // ... etc
  };
};
```

---

### 3. Password Hashing Compatibility

**Problem**: Frontend may have cached passwords or comparison logic.

```javascript
// ✅ CORRECT - Use bcrypt (same as Laravel)
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);

// ❌ WRONG - Different algorithm will break password reset
const hashed = crypto.createHash('sha256').update(password).digest('hex');
```

**Important**: PHP bcrypt and Node.js bcrypt ARE compatible. Both use the same algorithm.

---

### 4. Empty String vs Null vs Undefined

**Problem**: JavaScript has three "empty" values, PHP has two.

```javascript
// Your Laravel code specifically does this:
if ($value === '') $input[$key] = null;

// YOU MUST DO THE SAME IN EXPRESS
const cleanInput = (obj) => {
  for (const key in obj) {
    if (obj[key] === '' || obj[key] === []) {
      obj[key] = null;
    }
  }
  return obj;
};

// In database, both null and undefined should be NULL
// In JSON response, undefined becomes null automatically
```

---

### 5. Array/JSON Column Handling

**Problem**: Your Laravel code stores arrays as JSON strings in database.

```php
// Laravel
$article->meta_tags = ['tag1', 'tag2'];
$article->save(); // Stored as: '["tag1","tag2"]'
// Retrieved as array automatically
```

```javascript
// Express MUST do the same
// Method 1: Manual stringify
article.meta_tags = JSON.stringify(['tag1', 'tag2']);

// Method 2: Let ORM handle it (Prisma does this)
// In schema: meta_tags Json?
article.meta_tags = ['tag1', 'tag2']; // Prisma auto-stringifies

// When retrieving:
// If using manual JSON.parse:
article.meta_tags = JSON.parse(article.meta_tags);

// If using Prisma:
// Already parsed as object
```

**Critical for**: articles.meta_tags, articles.categories

---

### 6. Boolean String Conversion

**Problem**: Frontend sends "true"/"false" as strings, not actual booleans.

```javascript
// From request
{ is_prime: "true" }  // This is a STRING

// ❌ WRONG - This will always be truthy
if (data.is_prime) { } // true even for "false"

// ✅ CORRECT
const isPrime = data.is_prime === 'true' || data.is_prime === true;

// Better: Explicit conversion
const cleanBooleans = (obj) => {
  ['is_prime', 'is_headline'].forEach(key => {
    if (key in obj) {
      obj[key] = obj[key] === 'true' || obj[key] === true;
    }
  });
  return obj;
};
```

---

### 7. Default Values Not Being Set

**Problem**: Laravel has defaults, but Express doesn't auto-apply them if you don't specify.

```php
// Laravel - role defaults to Contributor
$user->role = $validated['role'] ?? 'Contributor';
```

```javascript
// Express - MUST explicitly set default
const user = await User.create({
  name: data.name,
  email: data.email,
  role: data.role || 'Contributor',  // ← Must do this
  status: data.status || 'Active'     // ← Must do this
});

// OR in ORM schema level (better)
model User {
  role String @default("Contributor")
  status String @default("Active")
}
```

---

### 8. Unique Constraint Violations

**Problem**: Duplicate email causes different errors in Laravel vs Express.

```php
// Laravel
'email' => 'unique:users,email'
// Returns 422 with message

// Express - ORM behavior varies
// Prisma: throws PrismaClientKnownRequestError
// Sequelize: throws UniqueConstraintError
// Raw SQL: returns error code 1062

// YOU MUST CATCH AND RETURN 422
try {
  const user = await User.create({ email });
} catch (error) {
  if (error.code === 'P2002' || error.code === 1062) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: { email: ['The email has already been taken.'] },
      status: 422
    });
  }
  throw error;
}
```

---

### 9. Date/Time Timezone Issues

**Problem**: Database stores dates in UTC, but comparison might fail.

```javascript
// WRONG
if (invitation.otp_expires_at < now()) { }
// Might fail if timezones differ

// CORRECT - Always work in UTC
const now = new Date();  // Always UTC
invitation.otp_expires_at = new Date().toISOString();
// Store as ISO string: 2026-01-26T10:30:00Z

// Comparison
if (new Date(invitation.otp_expires_at) < new Date()) {
  // Expired
}
```

**Best Practice**: Never use local time, always use UTC with ISO strings.

---

### 10. File Upload Path Issues

**Problem**: Different path conventions between Laravel and Node.

```php
// Laravel
$path = $file->storeAs('users', $filename, 'public');
// Returns: users/filename.jpg
// Full URL: /storage/users/filename.jpg
```

```javascript
// Express - Depends on your setup
// If using public folder
const path = `users/${filename}`;
fs.writeFileSync(`./public/storage/${path}`, buffer);
// Full URL: /public/storage/users/filename.jpg

// If using CDN
const path = `https://cdn.example.com/users/${filename}`;

// CRITICAL: Frontend expects consistent URLs
// Make sure your setup matches what frontend expects
```

---

### 11. Session/Token Expiry

**Problem**: JWT expiry vs session expiry behave differently.

```javascript
// JWT - Expires in token, client doesn't know until request fails
const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });

// On expired request
jwt.verify(token, SECRET); // throws TokenExpiredError

// YOU MUST CATCH AND RETURN 401
catch (error) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expired. Please login again.',
      status: 401 
    });
  }
}

// Session - Server controls expiry
app.use(session({
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));
```

---

### 12. Email Sending Failures

**Problem**: Email fails but request should still succeed.

```javascript
// ✅ CORRECT - Don't block on email failure
try {
  await sendEmail({ to: user.email, ... });
} catch (error) {
  logger.error('Email failed:', error);
  // Continue! Don't throw
}

// Return success anyway
res.json({
  data: user,
  message: 'User created. Email may have failed but account is active.',
  status: 201
});

// ❌ WRONG - This blocks user creation
if (!await sendEmail(...)) {
  return res.status(500).json({ message: 'Email failed' });
}
```

---

### 13. Case Sensitivity in Status/Role Fields

**Problem**: Database might be case-sensitive depending on collation.

```javascript
// Your code uses specific casing
const roles = ['Admin', 'Editor', 'Contributor', 'Viewer'];
const statuses = ['Active', 'Inactive', 'Suspended'];

// MUST validate against exact case
if (!roles.includes(data.role)) {
  return res.status(422).json({
    errors: { role: ['Invalid role'] }
  });
}

// When comparing:
if (user.role === 'Admin') { } // Exact match
if (user.role.toLowerCase() === 'admin') { } // ✅ Safer
```

---

### 14. Race Conditions with Counters

**Problem**: Multiple requests incrementing same counter causes lost updates.

```javascript
// ❌ WRONG - Race condition
const article = await Article.findById(id);
article.views = article.views + 1;
await article.save();

// ❌ STILL WRONG - Better but still racy
await Article.update({ id }, { 
  views: sequelize.fn('views') + 1 
});

// ✅ CORRECT - Atomic increment
await Article.increment('views', { where: { id } });

// Or in Prisma
await prisma.article.update({
  where: { id },
  data: { views: { increment: 1 } }
});
```

---

### 15. Slug Generation Edge Cases

**Problem**: Different slugs for similar titles.

```javascript
// Your frontend might generate slugs differently
// Make sure backend logic matches

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // Remove special chars
    .replace(/[\s_]+/g, '-')        // Replace spaces/underscores with dash
    .replace(/^-+|-+$/g, '')        // Remove leading/trailing dashes
    .replace(/-{2,}/g, '-');        // Replace multiple dashes with single
};

// Test cases should match frontend
generateSlug('Hello World!') === 'hello-world' ✓
generateSlug('Test__Article') === 'test-article' ✓
generateSlug('---Title---') === 'title' ✓
```

---

## 📋 Migration Checklist

- [ ] Database connection configured and tested
- [ ] All tables created or migrated
- [ ] ORM models defined and tested
- [ ] Authentication middleware working
- [ ] Response format exactly matches Laravel
- [ ] Error handling returns correct status codes
- [ ] Validation errors return 422 with proper format
- [ ] Password hashing using bcrypt
- [ ] Empty string to null conversion implemented
- [ ] Boolean string conversion working
- [ ] Case mapping (camelCase <-> snake_case) implemented
- [ ] File uploads working with correct paths
- [ ] Email sending not blocking requests
- [ ] Timezone handling consistent (UTC)
- [ ] Unique constraint errors handled as 422
- [ ] Array/JSON columns properly encoded/decoded
- [ ] Default values applied to all fields
- [ ] Race conditions prevented for counters
- [ ] Token/session expiry properly handled
- [ ] All routes tested against frontend

---

## 🧪 Testing Strategy

### 1. Unit Tests
```javascript
// Test validation
test('should validate email format', () => {
  const result = validateEmail('invalid');
  expect(result).toBe(false);
});

// Test data transformation
test('should convert camelCase to snake_case', () => {
  const result = toSnakeCase({ targetUrl: 'https://...' });
  expect(result.target_url).toBe('https://...');
});
```

### 2. Integration Tests
```javascript
// Test full endpoint
test('POST /api/users should create user', async () => {
  const res = await request(app)
    .post('/api/users')
    .send({
      name: 'John',
      email: 'john@example.com',
      password: 'Password123'
    });
  
  expect(res.status).toBe(201);
  expect(res.body.data.name).toBe('John');
  expect(res.body.data.password).toBeUndefined();
});
```

### 3. Frontend Integration Tests
```javascript
// Test against actual frontend
// Point frontend to new Express backend
// Run full user workflows
// Check network responses match expectations
```

---

## 🚀 Deployment Considerations

1. **Environment Variables**: Copy from .env to .env.local or .env.production
2. **Database Backup**: Before running migrations
3. **SSL/HTTPS**: Ensure CORS headers include frontend URL
4. **Rate Limiting**: Add to prevent abuse (not in Laravel version)
5. **Logging**: Centralize logs (Winston, ELK stack)
6. **Monitoring**: Set up error tracking (Sentry, DataDog)

---

## 📚 Helpful Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeORM Documentation](https://typeorm.io/)
- [Sequelize Documentation](https://sequelize.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Node.js Security](https://owasp.org/www-project-nodejs-security/)

---

## ⚠️ Common Mistakes Summary

| Mistake | Impact | Solution |
|---------|--------|----------|
| Changing response format | Frontend breaks | Keep JSON structure exact |
| Forgetting async/await | Returns Promise | Always await DB calls |
| Returning password | Security leak | Exclude password fields |
| Case mismatch (camelCase) | Frontend confusion | Map both directions |
| Empty string handling | Data corruption | Convert '' to null |
| Boolean string conversion | Logic errors | Check === 'true' |
| Missing defaults | Null values | Set role, status defaults |
| Unique constraint errors | Wrong status code | Catch and return 422 |
| Race conditions | Lost updates | Use atomic increments |
| Timezone issues | Time comparison failures | Always use UTC |

---

**Completed**: You now have all the information needed to migrate your Laravel backend to Express.js!

Start with authentication, then migrate routes one by one, testing each against the frontend.

Good luck! 🚀
