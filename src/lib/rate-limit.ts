import "server-only";
import { createHmac } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { aiUsage } from "@/lib/db/schema";
import { env } from "@/lib/env";

export const IP_DAILY_LIMIT = 5;
const DEFAULT_DAILY_LIMIT = 60;

// What's left for one person today. `global`: the day's ceiling for everyone was reached
export type Quota = { left: number; global: boolean };

export function toQuota(
  ipCount: number,
  total: number,
  ceiling: number,
): Quota {
  return {
    left: Math.max(0, Math.min(IP_DAILY_LIMIT - ipCount, ceiling - total)),
    global: total >= ceiling,
  };
}

// AI_DAILY_LIMIT comes as text from the environment: anything but a positive whole number is ignored
export function dailyLimit(value: string | undefined): number {
  const limit = Number(value);
  return Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_DAILY_LIMIT;
}

// On Vercel the first value is the visitor's IP; the rest are proxies.
// Running locally there is no header
export function ipFromHeaders(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

// With a secret salt, nobody can hash every possible IP to find which one gives this hash
export function hashIp(ip: string, salt: string): string {
  return createHmac("sha256", salt).update(ip).digest("hex");
}

// Adds 1 to this IP's row for today in a single SQL statement, so two searches
// at the same time can't both read 4 and write 5. Stops at IP_DAILY_LIMIT.
// Returns the new count, or null if the row was already at the limit
export async function addSearch(ipHash: string): Promise<number | null> {
  const rows = await db()
    .insert(aiUsage)
    .values({ ipHash, day: sql`current_date`, count: 1 })
    .onConflictDoUpdate({
      target: [aiUsage.ipHash, aiUsage.day],
      set: { count: sql`${aiUsage.count} + 1` },
      setWhere: sql`${aiUsage.count} < ${IP_DAILY_LIMIT}`,
    })
    .returning({ count: aiUsage.count });

  return rows[0]?.count ?? null;
}

export async function dayTotal(): Promise<number> {
  const [row] = await db()
    .select({ total: sql<number>`coalesce(sum(${aiUsage.count}), 0)::int` })
    .from(aiUsage)
    .where(eq(aiUsage.day, sql`current_date`));
  return row?.total ?? 0;
}

export type TakeSearchResult =
  | { status: "ok"; quota: Quota }
  | { status: "quota"; quota: Quota }
  | { status: "error" };

// Counts one AI search for whoever sent this request. Never throws: if the
// database fails there is no search, or anyone could spend Groq's whole quota
export async function takeSearch(): Promise<TakeSearchResult> {
  try {
    const ipHash = hashIp(ipFromHeaders(await headers()), env("IP_HASH_SALT"));
    const count = await addSearch(ipHash);
    if (count === null) {
      return { status: "quota", quota: { left: 0, global: false } };
    }
    const ceiling = dailyLimit(process.env.AI_DAILY_LIMIT);
    const total = await dayTotal();
    const quota = toQuota(count, total, ceiling);
    // `total` already includes this search
    return total > ceiling
      ? { status: "quota", quota }
      : { status: "ok", quota };
  } catch (error) {
    console.error(error);
    return { status: "error" };
  }
}
