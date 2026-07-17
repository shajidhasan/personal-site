CREATE TABLE `project` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`url` text NOT NULL,
	`icon_url` text,
	`is_wip` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_slug_idx` ON `project` (`slug`);--> statement-breakpoint
CREATE TABLE `research_paper` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`authors` text DEFAULT '[]' NOT NULL,
	`venue` text,
	`year` integer NOT NULL,
	`abstract` text,
	`doi` text,
	`url` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
