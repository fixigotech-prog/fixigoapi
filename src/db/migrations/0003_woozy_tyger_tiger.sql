ALTER TABLE "frequent_services" ALTER COLUMN "display_order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "frequent_services" ADD COLUMN "image_url" text;