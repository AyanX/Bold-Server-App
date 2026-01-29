ALTER TABLE `articles` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT now();--> statement-breakpoint
ALTER TABLE `articles` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT now();