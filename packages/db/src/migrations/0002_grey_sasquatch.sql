CREATE TABLE "health_check_log" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"error" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
