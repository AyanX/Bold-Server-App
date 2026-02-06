const {
  mysqlTable,
  primaryKey,
  bigint,
  varchar,
  timestamp,
  unique,
  text,
  longtext,
  int,
  decimal,
  date,
  mediumtext,
  index,
  tinyint,
} = require("drizzle-orm/mysql-core");
const { sql } = require("drizzle-orm");
const { mysqlSet } = require("./sets.js");

const {
  userRoleEnum,
  userStatusEnum,
  articlesStatusEnum,
} = require("./enums.js");

const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    action: varchar({ length: 255 }).notNull(),
    user: varchar({ length: 255 }).default("System").notNull(),
    ipAddress: varchar("ip_address", { length: 255 })
      .default("localhost")
      .notNull(),
    status: varchar({ length: 255 }).default("Success").notNull(),
    level: varchar({ length: 255 }).default("Info").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "activity_logs_id" })],
);

const articles = mysqlTable(
  "articles",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().primaryKey(),
    author_id: bigint({ mode: "number", unsigned: true }).default(0).notNull(),
    title: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }),
    excerpt: text().notNull(),
    image: longtext(),
    category: varchar({ length: 255 }).notNull(),
    categories: text("categories"),
    author: varchar({ length: 255 }),
    read_time: varchar("read_time", { length: 255 })
      .default("5 min read")
      .notNull(),
    is_prime: tinyint("is_prime").default(0).notNull(),
    is_headline: tinyint("is_headline").default(0).notNull(),
    status: varchar({ length: 255 }).default("Draft").notNull(),
    meta_tags: text("meta_tags"),
    meta_description: text("meta_description"),
    seo_score: int("seo_score").default(0).notNull(),
    views: bigint({ mode: "number", unsigned: true }).default(0).notNull(),
    clicks: bigint({ mode: "number", unsigned: true }).default(0).notNull(),
    content: longtext(),
    created_at: timestamp("created_at", { mode: "string" })
      .default(sql`now()`)
      .notNull(),
    updated_at: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
      author_image: varchar("author_image", { length: 255 }),
      blur_image: varchar("blur_image", { length: 255 }),
  },
  (table) => [unique("articles_slug_unique").on(table.slug)],
);

const campaigns = mysqlTable(
  "campaigns",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    company: varchar({ length: 255 }),
    type: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 255 }).default("Scheduled").notNull(),
    price: decimal({ precision: 10, scale: 2 }),
    invoice: varchar({ length: 255 }),
    image: longtext(),
    targetUrl: text("target_url"),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    startDate: date("start_date", { mode: "string" }),
    // you can use { mode: 'date' }, if you want to have Date as type for this column
    endDate: date("end_date", { mode: "string" }),
    impressions: varchar({ length: 255 }).default("0").notNull(),
    clicks: varchar({ length: 255 }).default("0").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [primaryKey({ columns: [table.id], name: "campaigns_id" })],
);

const categories = mysqlTable(
  "categories",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    articleCount: int("article_count").default(0).notNull(),
    views: bigint({ mode: "number", unsigned: true }).default(0).notNull(),
    color: varchar({ length: 255 }).default("#001733").notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .onUpdateNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "categories_id" }),
    unique("categories_slug_unique").on(table.slug),
  ],
);

const jobBatches = mysqlTable(
  "job_batches",
  {
    id: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    totalJobs: int("total_jobs").notNull(),
    pendingJobs: int("pending_jobs").notNull(),
    failedJobs: int("failed_jobs").notNull(),
    failedJobIds: longtext("failed_job_ids").notNull(),
    options: mediumtext(),
    cancelledAt: int("cancelled_at"),
    createdAt: int("created_at").notNull(),
    finishedAt: int("finished_at"),
  },
  (table) => [primaryKey({ columns: [table.id], name: "job_batches_id" })],
);

const jobs = mysqlTable(
  "jobs",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    queue: varchar({ length: 255 }).notNull(),
    payload: longtext().notNull(),
    attempts: tinyint({ unsigned: true }).notNull(),
    reservedAt: int("reserved_at", { unsigned: true }),
    availableAt: int("available_at", { unsigned: true }).notNull(),
    createdAt: int("created_at", { unsigned: true }).notNull(),
  },
  (table) => [
    index("jobs_queue_index").on(table.queue),
    primaryKey({ columns: [table.id], name: "jobs_id" }),
  ],
);

const migrations = mysqlTable(
  "migrations",
  {
    id: int({ unsigned: true }).autoincrement().notNull(),
    migration: varchar({ length: 255 }).notNull(),
    batch: int().notNull(),
  },
  (table) => [primaryKey({ columns: [table.id], name: "migrations_id" })],
);

const pageViews = mysqlTable(
  "page_views",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    sessionId: varchar("session_id", { length: 255 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    country: varchar({ length: 255 }),
    countryCode: varchar("country_code", { length: 2 }),
    region: varchar({ length: 255 }),
    city: varchar({ length: 255 }),
    latitude: decimal({ precision: 10, scale: 7 }),
    longitude: decimal({ precision: 10, scale: 7 }),
    deviceType: varchar("device_type", { length: 255 })
      .default("desktop")
      .notNull(),
    browser: varchar({ length: 255 }),
    os: varchar({ length: 255 }),
    pageUrl: varchar("page_url", { length: 255 }),
    pageTitle: varchar("page_title", { length: 255 }),
    referrer: varchar({ length: 255 }),
    timeOnPage: int("time_on_page").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    index("page_views_country_code_index").on(table.countryCode),
    index("page_views_country_index").on(table.country),
    index("page_views_created_at_index").on(table.createdAt),
    index("page_views_device_type_index").on(table.deviceType),
    index("page_views_region_index").on(table.region),
    index("page_views_session_id_index").on(table.sessionId),
    primaryKey({ columns: [table.id], name: "page_views_id" }),
  ],
);

const passwordResetTokens = mysqlTable(
  "password_reset_tokens",
  {
    email: varchar({ length: 255 }).notNull(),
    token: varchar({ length: 255 }),
    createdAt: timestamp("created_at", { mode: "string" }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.email], name: "password_reset_tokens_email" }),
  ],
);

const personalAccessTokens = mysqlTable(
  "personal_access_tokens",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    tokenableType: varchar("tokenable_type", { length: 255 }).notNull(),
    tokenableId: bigint("tokenable_id", {
      mode: "number",
      unsigned: true,
    }).notNull(),
    name: text().notNull(),
    token: varchar({ length: 64 }).notNull(),
    abilities: text(),
    lastUsedAt: timestamp("last_used_at", { mode: "string" }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    index("personal_access_tokens_expires_at_index").on(table.expiresAt),
    index("personal_access_tokens_tokenable_type_tokenable_id_index").on(
      table.tokenableType,
      table.tokenableId,
    ),
    primaryKey({ columns: [table.id], name: "personal_access_tokens_id" }),
    unique("personal_access_tokens_token_unique").on(table.token),
  ],
);

const settings = mysqlTable(
  "settings",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    key: varchar({ length: 255 }).notNull(),
    value: text(),
    type: varchar({ length: 255 }).default("string").notNull(),
    group: varchar({ length: 255 }).default("general").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "settings_id" }),
    unique("settings_key_unique").on(table.key),
  ],
);

const userInvitations = mysqlTable(
  "user_invitations",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    role: varchar({ length: 255 }).default("Contributor").notNull(),
    department: varchar({ length: 255 }),
    phone: varchar({ length: 255 }),
    bio: text(),
    image: varchar({ length: 255 }),
    otpCode: varchar("otp_code", { length: 255 }),
    otpHash: varchar("otp_hash", { length: 255 }),
    otpExpiresAt: timestamp("otp_expires_at", { mode: "string" }),
    invitedBy: varchar("invited_by", { length: 255 }),
    status: varchar({ length: 255 }).default("pending").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "user_invitations_id" }),
    unique("user_invitations_email_unique").on(table.email),
  ],
);

const users = mysqlTable(
  "users",
  {
    id: bigint({ mode: "number", unsigned: true }).autoincrement().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),

    email_verified_at: timestamp("email_verified_at", { mode: "string" }),

    password: varchar({ length: 255 }),
    two_factor_secret: varchar("two_factor_secret", { length: 255 }),
    two_factor_recovery_codes: text("two_factor_recovery_codes"),
    role: userRoleEnum.default("Contributor").notNull(),
    status: userStatusEnum.default("Pending").notNull(),

    department: varchar({ length: 255 }),
    phone: varchar({ length: 255 }),
    bio: text(),
    linkedin: varchar({ length: 255 }),
    image: varchar({ length: 255 }),

    invited_via: varchar("invited_via", { length: 255 }),
    invited_by: varchar("invited_by", { length: 255 }),
    invitation_accepted_at: timestamp("invitation_accepted_at", {
      mode: "string",
    }),
    last_active: timestamp("last_active", { mode: "string" }),
    remember_token: varchar("remember_token", { length: 100 }),
    created_at: timestamp("created_at", { mode: "string" }),
    updated_at: timestamp("updated_at", { mode: "string" }),
    total_articles: int("total_articles").default(0).notNull(),
    total_views: bigint({ mode: "number", unsigned: true }).default(0).notNull(),
    total_clicks: bigint({ mode: "number", unsigned: true }).default(0).notNull(),
    articles_published: int("articles_published").default(0).notNull(),
    articles_drafted: int("articles_drafted").default(0).notNull(),
    articles_pending: int("articles_pending").default(0).notNull(),
    last_login_at: timestamp("last_login_at", { mode: "string" }),
    last_login_ip: varchar("last_login_ip", { length: 45 }),

    login_count: int("login_count").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.id], name: "users_id" }),
    unique("users_email_unique").on(table.email),
  ],
);

module.exports = {
  activityLogs,
  articles,
  campaigns,
  categories,
  jobBatches,
  jobs,
  migrations,
  pageViews,
  passwordResetTokens,
  personalAccessTokens,
  settings,
  userInvitations,
  users,
};
