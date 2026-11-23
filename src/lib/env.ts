// Read on each use, not on import, so `next build` works without secrets
export function env(name: "TMDB_TOKEN" | "GROQ_API_KEY"): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}
