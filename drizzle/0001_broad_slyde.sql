ALTER TABLE `articles` MODIFY COLUMN `is_prime` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `is_headline` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `meta_tags` SET('News','Updates');--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `seo_score` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `seo_score` int NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `articles` ADD `categories` SET('Latest News','Headline News','Technology','Sports');--> statement-breakpoint
ALTER TABLE `users` ADD `two_factor_secret` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `two_factor_recovery_codes` SET('code1','code2','code3','code4','code5');--> statement-breakpoint
ALTER TABLE `users` ADD `user_role` enum('Admin','Editor','Contributor','Viewer') DEFAULT 'Contributor' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `user_status` enum('Active','Inactive','Suspended') DEFAULT 'Active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_ip` varchar(45);--> statement-breakpoint
ALTER TABLE `users` ADD `login_count` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `role`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `status`;