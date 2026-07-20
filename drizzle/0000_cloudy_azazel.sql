CREATE TABLE `reservation_fields` (
	`id` text PRIMARY KEY NOT NULL,
	`reservation_id` text NOT NULL,
	`field_name` text NOT NULL,
	`value_json` text NOT NULL,
	`source_document_id` text NOT NULL,
	`source_page` integer,
	`source_excerpt` text,
	`confidence` real NOT NULL,
	`requires_review` integer DEFAULT false NOT NULL,
	`confirmed_by_email` text,
	`confirmed_at` integer,
	FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_document_id`) REFERENCES `source_documents`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `reservation_fields_reservation_idx` ON `reservation_fields` (`reservation_id`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`owner_email` text NOT NULL,
	`source_document_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`confirmation_number` text,
	`start_local` text NOT NULL,
	`start_time_zone` text NOT NULL,
	`start_utc` text NOT NULL,
	`end_local` text,
	`end_time_zone` text,
	`end_utc` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_document_id`) REFERENCES `source_documents`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `reservations_trip_idx` ON `reservations` (`trip_id`);--> statement-breakpoint
CREATE INDEX `reservations_owner_idx` ON `reservations` (`owner_email`);--> statement-breakpoint
CREATE INDEX `reservations_start_utc_idx` ON `reservations` (`start_utc`);--> statement-breakpoint
CREATE TABLE `source_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`owner_email` text NOT NULL,
	`filename` text NOT NULL,
	`content_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `source_documents_trip_idx` ON `source_documents` (`trip_id`);--> statement-breakpoint
CREATE INDEX `source_documents_owner_idx` ON `source_documents` (`owner_email`);--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`name` text NOT NULL,
	`destination` text NOT NULL,
	`starts_on` text NOT NULL,
	`ends_on` text NOT NULL,
	`preferences_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `trips_owner_idx` ON `trips` (`owner_email`);