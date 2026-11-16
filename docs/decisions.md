# Decision log

Short records of the technical decisions behind this app: what was chosen, why, and what it costs. Newest at the bottom.

## 1. Squash merge only, enforced by a ruleset

**Decision.** `main` only accepts pull requests merged with squash. A ruleset blocks direct pushes, force pushes and deletion, and requires the `ci`, `pr-title` and `e2e` checks.

**Why.** One commit per pull request keeps `main` readable and makes every commit a working state of the app. The PR title becomes the commit message, so `pr-title` checks that it follows Conventional Commits, which is what the generated release notes are built from.

**Trade-off.** The commits inside a branch are lost after the merge. They stay visible in the closed pull request.

## 2. The locale comes from `next/root-params`

**Decision.** `src/i18n/request.ts` reads the locale with `rootParams.locale()` instead of receiving it through props or reading request headers.

**Why.** Every route lives under `[locale]`, so the locale is a root param: any server component can read it without making the page dynamic. Reading headers or cookies would opt the whole route out of prerendering. Components just call `getLocale()` or `getTranslations()` and nothing has to be passed down.

**Trade-off.** The locale is only in the URL (`/es`, `/en`). There is no detection from the browser language.

## 3. Cache Components, with `<Suspense>` only where the request is read

**Decision.** `cacheComponents` is on. The layout, header and footer are prerendered. A `<Suspense>` boundary goes exactly where something depends on the request:

- Home, outer boundary: around the component that reads `searchParams`. Its fallback is the idle home, which is also what most visitors should see first.
- Home, inner boundary: around the TMDB request, keyed by the genre. The key makes React show the loading state again when the genre changes instead of keeping the previous results on screen.
- Show detail: `loading.tsx`, since the whole page depends on the show id.

**Why.** The static shell is served immediately and only the part that needs data streams in. Putting a boundary higher up would turn more of the page into a loading state than necessary.

**Trade-off.** A streamed page has already sent its `200` when `notFound()` runs, so a missing show renders the not-found page with a `noindex` tag instead of a `404` status.

## 4. The URL is the state of the genre pills

**Decision.** Each pill is a link to `?genre=<slug>`. The page reads the genre from the URL, validates it against the genre table and renders from there. There is no client state for the selection.

**Why.** Results can be shared, bookmarked and reloaded, the back button works, and the pills work before JavaScript loads. The server is the only place that decides what to show, so there is one source of truth.

**Trade-off.** Every change of genre is a navigation. An unknown or repeated `genre` value falls back to the idle home rather than showing an error.

## 5. The TMDB client returns a typed result instead of throwing

**Decision.** `discoverShows` and `getShow` return a union with a `status` field (`ok`, `no_results` or `not_found`, `error`). `toHomeState` maps that result to what the home page shows with an exhaustive `switch`.

**Why.** "No results" and "not found" are expected outcomes, not exceptions. With a union the compiler forces every caller to handle each case, and adding a new status breaks the build until it is handled. Pages never need a `try`/`catch`.

**Trade-off.** The cause of an error is logged on the server and not passed to the page, which only knows that something failed.

## 6. Failed TMDB requests are never cached

**Decision.** The cached function (`fetchTmdb`, with `"use cache"` and a lifetime of hours) throws on any failed response. The `try`/`catch` that turns the failure into `{ status: "error" }` lives outside it, in the public functions.

**Why.** A cached function stores whatever it returns. If it returned an error value, one bad response from TMDB would be served to everyone for hours. Throwing means nothing is stored and the next request tries again. A `404` is the exception: it is returned and cached, because a show that does not exist will not exist a minute later either.

**Trade-off.** While TMDB is down every request reaches it. That is acceptable at this traffic.

## 7. End-to-end tests run against the production build and the real TMDB API

**Decision.** In CI, Playwright runs against `next build` + `next start` on the runner, in a job parallel to `ci`. Locally it uses the dev server. Requests to TMDB are not mocked.

**Why.** Caching, prerendering and streaming behave differently in development, so only the production build tests what users get. Running it on the runner keeps the check independent of the preview deployment and makes it usable as a required check. Not mocking TMDB lets the tests cover the one thing unit tests cannot: the whole path from the browser to the API.

**Trade-off.** The job needs the `TMDB_TOKEN` secret and can fail when TMDB does. One retry in CI absorbs the occasional slow response, and the tests assert on structure (five results, a title, a link) rather than on specific shows.
