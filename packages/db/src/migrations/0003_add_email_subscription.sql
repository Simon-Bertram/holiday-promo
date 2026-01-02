CREATE TABLE "email_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "email_subscription_email_unique" UNIQUE("email")
);

