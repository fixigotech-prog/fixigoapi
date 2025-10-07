CREATE TABLE "frequent_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "frequent_services" ADD CONSTRAINT "frequent_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;