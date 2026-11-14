import { Ball } from "@/components/ball";

// Next shows this while the page above waits for TMDB (an automatic <Suspense>)
export default function Loading() {
  return (
    <div className="pt-2">
      <Ball state="loading" />
      <div aria-hidden="true" className="mt-6 animate-pulse space-y-3">
        <div className="mx-auto h-8 w-2/3 rounded-full bg-surface-2" />
        <div className="mx-auto h-4 w-1/3 rounded-full bg-surface-2" />
        <div className="h-4 rounded-full bg-surface-2" />
        <div className="h-4 rounded-full bg-surface-2" />
        <div className="h-4 w-3/4 rounded-full bg-surface-2" />
      </div>
    </div>
  );
}
