# Database Schema & Migration Guide

## Overview

The Laravel backend uses SQLite for development and MySQL for production. When migrating to Express.js, you need to:

1. Keep the same database (SQLite/MySQL)
2. Set up an ORM (Prisma, TypeORM, or Sequelize)
3. Ensure data compatibility

## Database Connection

### SQLite (Development)
```
DATABASE_URL="file:./database.sqlite"
```

### MySQL (Production)
```
DATABASE_URL="mysql://user:password@host:3306/database_name"
```

### PostgreSQL (Alternative)
```
DATABASE_URL="postgresql://user:password@host:5432/database_name"
```

## Table Schemas

### users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  status VARCHAR(50),
  department VARCHAR(100),
  phone VARCHAR(20),
  bio TEXT,
  image LONGTEXT,
  linkedin VARCHAR(255),
  last_active TIMESTAMP NULL,
  login_count INT DEFAULT 0,
  last_login_at TIMESTAMP NULL,
  last_login_ip VARCHAR(45),
  invited_via VARCHAR(50),
  invited_by INT,
  invitation_accepted_at TIMESTAMP NULL,
  remember_token VARCHAR(255),
  email_verified_at TIMESTAMP NULL,
  two_factor_secret VARCHAR(255),
  two_factor_recovery_codes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (email),
  INDEX (role),
  INDEX (status),
  FOREIGN KEY (invited_by) REFERENCES users(id)
);
```

### user_invitations
```sql
CREATE TABLE user_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100),
  department VARCHAR(100),
  phone VARCHAR(20),
  bio TEXT,
  image LONGTEXT,
  otp_code VARCHAR(10),
  otp_hash VARCHAR(255),
  otp_expires_at TIMESTAMP,
  invited_by INT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (email),
  INDEX (status),
  INDEX (otp_expires_at),
  FOREIGN KEY (invited_by) REFERENCES users(id)
);
```

### articles
```sql
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT,
  image LONGTEXT,
  category VARCHAR(255) NOT NULL,
  categories JSON,
  author VARCHAR(255),
  read_time VARCHAR(50),
  is_prime BOOLEAN DEFAULT false,
  is_headline BOOLEAN DEFAULT false,
  status VARCHAR(50),
  meta_tags JSON,
  meta_description TEXT,
  seo_score INT,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (slug),
  INDEX (category),
  INDEX (author),
  INDEX (status),
  INDEX (created_at)
);
```

### categories
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  article_count INT DEFAULT 0,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (slug)
);
```

### campaigns
```sql
CREATE TABLE campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  type VARCHAR(100),
  status VARCHAR(50),
  price DECIMAL(10, 2),
  invoice VARCHAR(255),
  image LONGTEXT,
  target_url TEXT,
  start_date TIMESTAMP NULL,
  end_date TIMESTAMP NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (status),
  INDEX (start_date),
  INDEX (end_date)
);
```

### page_views
```sql
CREATE TABLE page_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  country VARCHAR(100),
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  page_url VARCHAR(2048),
  page_title VARCHAR(500),
  referrer VARCHAR(2048),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (session_id),
  INDEX (created_at),
  INDEX (country_code)
);
```

### activity_logs
```sql
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  user_name VARCHAR(255),
  action VARCHAR(100),
  resource VARCHAR(100),
  resource_id INT,
  description TEXT,
  changes JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (created_at),
  INDEX (action)
);
```

### settings
```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  value LONGTEXT,
  type VARCHAR(50),
  group VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (group)
);
```

### password_reset_tokens (Optional - for reset flow)
```sql
CREATE TABLE password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255),
  otp_code VARCHAR(10),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (email)
);
```

## Migration Path

### Option 1: Use Prisma (Recommended)

```bash
npm install @prisma/client prisma
npx prisma init
```

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"  // or "sqlite" for dev
  url      = env("DATABASE_URL")
}

model User {
  id                      Int      @id @default(autoincrement())
  name                    String
  email                   String   @unique
  password                String
  role                    String?
  status                  String?
  department              String?
  phone                   String?
  bio                     String?
  image                   String?   @db.LongText
  linkedin                String?
  lastActive              DateTime?
  loginCount              Int      @default(0)
  lastLoginAt             DateTime?
  lastLoginIp             String?
  invitedVia              String?
  invitedBy               Int?
  invitationAcceptedAt    DateTime?
  rememberToken           String?
  emailVerifiedAt         DateTime?
  twoFactorSecret         String?
  twoFactorRecoveryCodes  Json?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  inviter                 User?    @relation("InvitedByUser", fields: [invitedBy], references: [id])
  invitedUsers            User[]   @relation("InvitedByUser")

  @@index([email])
  @@index([role])
  @@index([status])
}

model Article {
  id                  Int     @id @default(autoincrement())
  title               String  @db.VarChar(500)
  slug                String  @unique
  excerpt             String  @db.Text
  content             String? @db.LongText
  image               String? @db.LongText
  category            String
  categories          Json?
  author              String?
  readTime            String?
  isPrime             Boolean @default(false)
  isHeadline          Boolean @default(false)
  status              String?
  metaTags            Json?
  metaDescription     String? @db.Text
  seoScore            Int?
  views               Int     @default(0)
  clicks              Int     @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([slug])
  @@index([category])
  @@index([author])
  @@index([status])
}

// ... other models
```

### Option 2: TypeORM Setup

```bash
npm install typeorm reflect-metadata
```

Create `src/models/User.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  role: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  // ... other columns
}
```

### Option 3: Sequelize Setup

```bash
npm install sequelize mysql2
```

Create `src/models/index.js`:

```javascript
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL);

const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: Sequelize.STRING,
  // ... other fields
});

module.exports = { sequelize, User };
```

## Data Type Mappings

| Laravel/DB | Prisma | TypeORM | JavaScript |
|-----------|--------|---------|------------|
| INT | Int | Number | number |
| VARCHAR(255) | String | String | string |
| TEXT | String | Text | string |
| LONGTEXT | String | LongText | string |
| BOOLEAN | Boolean | Boolean | boolean |
| JSON | Json | Json | object |
| TIMESTAMP | DateTime | timestamp | Date |
| DECIMAL(10,2) | Decimal | decimal | number |

## Key Differences

### Laravel Eloquent
```php
$user = User::find(1);
$articles = Article::where('author', $user->name)->get();
$user->articles = $articles;
```

### Prisma
```javascript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    articles: {
      where: { author: user.name }
    }
  }
});
```

### TypeORM
```typescript
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: ['articles']
});
```

## Migration Steps

1. **Backup existing database**
2. **Set up new Express project with ORM**
3. **Generate models/schemas from existing tables** OR manually create them
4. **Test connections with existing data**
5. **Implement one route at a time**
6. **Test data integrity**
7. **Migrate data if schema changes needed**

## Useful Commands

```bash
# Prisma
npx prisma migrate dev --name init
npx prisma db push
npx prisma studio

# TypeORM
npm run typeorm migration:run
npm run typeorm migration:generate -n MigrationName

# Sequelize
npx sequelize-cli db:migrate
```

---

**Next**: Review common gotchas and tips in 09-GOTCHAS-AND-TIPS.md
