CREATE TABLE `announcements` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`scope` enum('all','personal') NOT NULL DEFAULT 'all',
	`target_user_id` bigint unsigned,
	`created_by` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `change_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`subject_name` varchar(100) NOT NULL,
	`current_target` int NOT NULL DEFAULT 0,
	`requested_target` int NOT NULL,
	`reason` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	CONSTRAINT `change_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subject_sections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`subject_id` bigint unsigned NOT NULL,
	`group` varchar(100) NOT NULL DEFAULT '',
	`label` varchar(100) NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`full_score` int NOT NULL DEFAULT 100,
	`detail` varchar(255),
	`full_detail` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subject_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(50) NOT NULL DEFAULT 'book',
	`target` int NOT NULL,
	`full_score` int NOT NULL DEFAULT 100,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_reminders` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','done') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `task_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`exam_date` varchar(20) NOT NULL DEFAULT '2026-12-21',
	`total_target` int NOT NULL DEFAULT 360,
	`school_name` varchar(255) NOT NULL DEFAULT '北京邮电大学',
	`major_code` varchar(50) NOT NULL DEFAULT '11408',
	`description` varchar(500) NOT NULL DEFAULT '计算机考研',
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`password` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`theme` enum('dark','light','ocean','sakura','cyber') NOT NULL DEFAULT 'dark',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `weekly_plans` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`week_number` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`scope` enum('all','personal') NOT NULL DEFAULT 'all',
	`target_user_id` bigint unsigned,
	`created_by` bigint unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_plans_id` PRIMARY KEY(`id`)
);
