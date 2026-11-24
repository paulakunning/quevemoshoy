import { date, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

// One row per hashed IP per day. The day's total is the sum of `count`
export const aiUsage = pgTable(
  "ai_usage",
  {
    ipHash: text("ip_hash").notNull(),
    day: date("day").notNull(),
    count: integer("count").notNull(),
  },
  (table) => [primaryKey({ columns: [table.ipHash, table.day] })],
);
