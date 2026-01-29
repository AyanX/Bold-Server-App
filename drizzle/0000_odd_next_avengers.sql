-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `activity_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`action` varchar(255) NOT NULL,
	`user` varchar(255) NOT NULL DEFAULT 'System',
	`ip_address` varchar(255) NOT NULL DEFAULT 'localhost',
	`status` varchar(255) NOT NULL DEFAULT 'Success',
	`level` varchar(255) NOT NULL DEFAULT 'Info',
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255),
	`excerpt` text NOT NULL,
	`image` longtext,
	`category` varchar(255) NOT NULL,
	`author` varchar(255),
	`read_time` varchar(255) NOT NULL DEFAULT '5 min read',
	`is_prime` tinyint(1) NOT NULL DEFAULT 0,
	`is_headline` tinyint(1) NOT NULL DEFAULT 0,
	`status` varchar(255) NOT NULL DEFAULT 'Draft',
	`meta_tags` json,
	`meta_description` text,
	`seo_score` int,
	`views` bigint unsigned NOT NULL DEFAULT 0,
	`clicks` bigint unsigned NOT NULL DEFAULT 0,
	`content` longtext,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`company` varchar(255),
	`type` varchar(255) NOT NULL,
	`status` varchar(255) NOT NULL DEFAULT 'Scheduled',
	`price` decimal(10,2),
	`invoice` varchar(255),
	`image` longtext,
	`target_url` text,
	`start_date` date,
	`end_date` date,
	`impressions` varchar(255) NOT NULL DEFAULT '0',
	`clicks` varchar(255) NOT NULL DEFAULT '0',
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`article_count` int NOT NULL DEFAULT 0,
	`color` varchar(255) NOT NULL DEFAULT '#001733',
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `job_batches` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`total_jobs` int NOT NULL,
	`pending_jobs` int NOT NULL,
	`failed_jobs` int NOT NULL,
	`failed_job_ids` longtext NOT NULL,
	`options` mediumtext,
	`cancelled_at` int,
	`created_at` int NOT NULL,
	`finished_at` int,
	CONSTRAINT `job_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`queue` varchar(255) NOT NULL,
	`payload` longtext NOT NULL,
	`attempts` tinyint unsigned NOT NULL,
	`reserved_at` int unsigned,
	`available_at` int unsigned NOT NULL,
	`created_at` int unsigned NOT NULL,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `migrations` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`migration` varchar(255) NOT NULL,
	`batch` int NOT NULL,
	CONSTRAINT `migrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`session_id` varchar(255) NOT NULL,
	`ip_address` varchar(45),
	`country` varchar(255),
	`country_code` varchar(2),
	`region` varchar(255),
	`city` varchar(255),
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`device_type` varchar(255) NOT NULL DEFAULT 'desktop',
	`browser` varchar(255),
	`os` varchar(255),
	`page_url` varchar(255),
	`page_title` varchar(255),
	`referrer` varchar(255),
	`time_on_page` int NOT NULL DEFAULT 0,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`email` varchar(255) NOT NULL,
	`token` varchar(255),
	`created_at` timestamp,
	`expires_at` timestamp,
	CONSTRAINT `password_reset_tokens_email` PRIMARY KEY(`email`)
);
--> statement-breakpoint
CREATE TABLE `personal_access_tokens` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`tokenable_type` varchar(255) NOT NULL,
	`tokenable_id` bigint unsigned NOT NULL,
	`name` text NOT NULL,
	`token` varchar(64) NOT NULL,
	`abilities` text,
	`last_used_at` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `personal_access_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `personal_access_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text,
	`type` varchar(255) NOT NULL DEFAULT 'string',
	`group` varchar(255) NOT NULL DEFAULT 'general',
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `user_invitations` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL DEFAULT 'Contributor',
	`department` varchar(255),
	`phone` varchar(255),
	`bio` text,
	`image` varchar(255),
	`otp_code` varchar(255),
	`otp_hash` varchar(255),
	`otp_expires_at` timestamp,
	`invited_by` bigint unsigned,
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `user_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_invitations_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified_at` timestamp,
	`password` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL DEFAULT 'Contributor',
	`status` varchar(255) NOT NULL DEFAULT 'Active',
	`department` varchar(255),
	`phone` varchar(255),
	`bio` text,
	`linkedin` varchar(255),
	`image` varchar(255),
	`invited_via` varchar(255),
	`invited_by` bigint unsigned,
	`invitation_accepted_at` timestamp,
	`last_active` timestamp,
	`remember_token` varchar(100),
	`created_at` timestamp,
	`updated_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `jobs_queue_index` ON `jobs` (`queue`);--> statement-breakpoint
CREATE INDEX `page_views_country_code_index` ON `page_views` (`country_code`);--> statement-breakpoint
CREATE INDEX `page_views_country_index` ON `page_views` (`country`);--> statement-breakpoint
CREATE INDEX `page_views_created_at_index` ON `page_views` (`created_at`);--> statement-breakpoint
CREATE INDEX `page_views_device_type_index` ON `page_views` (`device_type`);--> statement-breakpoint
CREATE INDEX `page_views_region_index` ON `page_views` (`region`);--> statement-breakpoint
CREATE INDEX `page_views_session_id_index` ON `page_views` (`session_id`);--> statement-breakpoint
CREATE INDEX `personal_access_tokens_expires_at_index` ON `personal_access_tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` ON `personal_access_tokens` (`tokenable_type`,`tokenable_id`);
*/