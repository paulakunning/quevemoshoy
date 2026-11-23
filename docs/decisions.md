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

## 8. The text search goes through a Server Action, not the URL

**Decision.** The search form sends the text with a Server Action, `searchAction(text, locale)`. The result lives in client state (`SearchProvider`) and covers the page until a link is clicked. The pills stay URLs.

**Why.** Every text search costs an AI call. In the URL, each reload, shared link or crawler visit would repeat it. The locale is passed as an argument because root params are not available inside Server Actions. A Server Action is a public endpoint, so both arguments are validated as untrusted input.

**Trade-off.** A text result cannot be shared or bookmarked, and the back button does not return to it. Before JavaScript loads, the form does not send.

## 9. The AI can only answer with a schema

**Decision.** The model's output is constrained by `filtersSchema` (Zod): up to 3 genres from a fixed list in `include` and in `exclude`, and `maxRuntime` from 5 to 180 minutes or `null`. Groq checks the answer against it and the AI SDK validates it again. `toDiscoverQuery` turns valid filters into TMDB parameters; a genre both included and excluded is only excluded.

**Why.** The person's text goes straight to the model, so the model's answer is treated as untrusted. With a closed list, a prompt injection can at most pick genres, and an answer outside the schema becomes an error instead of a TMDB request. The same schema gives the TypeScript type.

**Trade-off.** Anything the schema cannot express is dropped, such as "this genre or that one", a year or a country. When the model breaks the schema, the person sees an error message instead of a partial result.

## 10. Horror and romance are TMDB keywords, not genres

**Decision.** TMDB's TV genres have no horror or romance, so both go as keywords (`315058` and `9840`) in `with_keywords` and `without_keywords`. The "For date night" mood uses the romance keyword plus genres.

**Why.** Checked against the API: the TV genre list does not include them, and these keywords are the closest tag.

**Trade-off.** Keywords are added by the community and are less consistent than genres. The romance keyword also tags crime and fantasy shows, which is why the date night mood leaves those genres out.

## 11. Number of seasons is checked in each show's detail

**Decision.** Discover cannot filter by number of seasons. For "To binge" (4 seasons or more), the details of the 20 discover results are requested in parallel and the first 5 that qualify are kept. Each detail is cached like any other TMDB request.

**Why.** `number_of_seasons` only exists in the detail endpoint.

**Trade-off.** 21 requests instead of 1 when the cache is cold, and fewer than 5 results if the first page has too few long shows.

## 12. AI evals run by hand, not in CI

**Decision.** `npm run eval` sends 30 requests, in Spanish and English, to the real model and passes with 24 or more. It is not part of `npm test` or CI.

**Why.** The model is not deterministic, so it is measured as a score over many cases instead of with pass/fail tests. A run spends about 16,000 tokens of the free quota and depends on Groq being up. In CI it would spend that on every push, and a Groq outage would block merges. It runs when the prompt, the model or the schema change.

**Trade-off.** A change in the model's behavior is only caught when someone runs the evals.
