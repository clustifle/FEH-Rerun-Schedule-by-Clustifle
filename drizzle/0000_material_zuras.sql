CREATE TABLE `heroes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`color` text NOT NULL,
	`month` text,
	`status` text NOT NULL,
	`notes` text NOT NULL,
	`portrait` text,
	`updated` text NOT NULL
);
