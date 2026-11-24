CREATE TABLE "ai_usage" (
	"ip_hash" text NOT NULL,
	"day" date NOT NULL,
	"count" integer NOT NULL,
	CONSTRAINT "ai_usage_ip_hash_day_pk" PRIMARY KEY("ip_hash","day")
);
