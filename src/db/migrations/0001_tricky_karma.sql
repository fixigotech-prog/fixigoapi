CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"lat" text,
	"lng" text,
	"country" text,
	"iso2" text,
	"state" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "city_id" integer;--> statement-breakpoint
ALTER TABLE "services_pricing" ADD COLUMN "city_id" integer;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services_pricing" ADD CONSTRAINT "services_pricing_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;