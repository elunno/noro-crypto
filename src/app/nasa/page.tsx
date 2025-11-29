// app/page.tsx

/**
 * NASA Space Dashboard example using free NASA Open APIs.
 *
 * ⚙️ Setup:
 * - Create a NASA API key here: https://api.nasa.gov/
 * - Add it to your Next.js env file as: NASA_API_KEY=YOUR_KEY
 *   (If missing, this code falls back to "DEMO_KEY" with strict limits)
 *
 * 🛰 APIs used:
 * - APOD (Astronomy Picture of the Day)
 *   GET /planetary/apod?start_date&end_date
 * - NEO (Near Earth Objects feed)
 *   GET /neo/rest/v1/feed?start_date&end_date
 * - DONKI Solar Flares
 *   GET /DONKI/FLR?startDate&endDate
 *
 * 📊 Layout (single page dashboard):
 * - Top cards: NEO count, hazardous NEOs, solar flares, avg NEO size
 * - Middle: NEO count per day (bar chart) + Hazard ratio gauge
 * - APOD highlight card
 * - Bottom: NEO table (closest approaches) + small solar flares summary
 */

const NASA_API_BASE = "https://api.nasa.gov";
const NASA_API_KEY = process.env.NASA_API_KEY ?? "DEMO_KEY"; // replace with your own key in production

// ---- Types ----

// Astronomy Picture of the Day
type ApodItem = {
  date: string;
  title: string;
  url: string;
  hdurl?: string;
  explanation: string;
  media_type: "image" | "video";
};

// Near Earth Object (simplified)
type NeoObject = {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    miss_distance: { kilometers: string };
    relative_velocity: { kilometers_per_second: string };
    orbiting_body: string;
  }>;
};

// NEO feed response
type NeoFeedResponse = {
  element_count: number;
  near_earth_objects: Record<string, NeoObject[]>;
};

// Solar flare (DONKI)
type SolarFlare = {
  flrID: string;
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string; // e.g. C, M, X
  sourceLocation?: string;
  link: string;
};

// ---- Helpers ----

/**
 * Build YYYY-MM-DD string from Date.
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns {start, end} for the last `days` days (including today).
 */
function getDateRange(days: number): { start: string; end: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (days - 1));
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}

/**
 * Generic helper for calling NASA API with api_key injected.
 */
async function fetchNASA<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const search = new URLSearchParams({
    api_key: NASA_API_KEY,
    ...params,
  });

  const res = await fetch(`${NASA_API_BASE}${path}?${search.toString()}`, {
    next: { revalidate: 600 }, // revalidate every 10 minutes
  });

  if (!res.ok) {
    throw new Error(`NASA API error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

// ---- API wrappers ----

/**
 * Fetch APOD entries for a given date range.
 */
async function getApodRange(days: number): Promise<ApodItem[]> {
  const { start, end } = getDateRange(days);
  // APOD supports start_date & end_date and returns an array
  const data = await fetchNASA<ApodItem[]>("/planetary/apod", {
    start_date: start,
    end_date: end,
    thumbs: "true",
  });
  // Ensure sorted by date ascending
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetch NEO feed for a date range (max 7-day window recommended).
 */
async function getNeoFeed(days: number): Promise<NeoFeedResponse> {
  const { start, end } = getDateRange(days);
  return fetchNASA<NeoFeedResponse>("/neo/rest/v1/feed", {
    start_date: start,
    end_date: end,
  });
}

/**
 * Fetch solar flares from DONKI for date range.
 */
async function getSolarFlares(days: number): Promise<SolarFlare[]> {
  const { start, end } = getDateRange(days);
  const data = await fetchNASA<SolarFlare[]>("/DONKI/FLR", {
    startDate: start,
    endDate: end,
  });
  // Sort by begin time
  return data.sort((a, b) => a.beginTime.localeCompare(b.beginTime));
}

// ---- Derived-data helpers ----

/**
 * Flatten the NEO feed into a simple array with explicit date field.
 */
function flattenNeos(feed: NeoFeedResponse): (NeoObject & { date: string })[] {
  const entries: (NeoObject & { date: string })[] = [];
  for (const [date, list] of Object.entries(feed.near_earth_objects)) {
    list.forEach((obj) => entries.push({ ...obj, date }));
  }
  return entries;
}

/**
 * Build bar chart data: NEO count per day for the feed.
 */
function buildNeoBars(
  feed: NeoFeedResponse,
): { label: string; count: number; height: number }[] {
  const days = Object.keys(feed.near_earth_objects).sort();
  if (!days.length) return [];

  const counts = days.map((d) => feed.near_earth_objects[d].length);
  const maxCount = Math.max(...counts);

  return days.map((date, idx) => {
    const count = counts[idx];
    const label = new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const height = maxCount ? Math.round((count / maxCount) * 100) : 0;
    return { label, count, height };
  });
}

/**
 * Compute hazard metrics for NEOs.
 */
function computeNeoHazards(neos: (NeoObject & { date: string })[]): {
  total: number;
  hazardous: number;
  hazardRate: number;
  avgDiameterKm: number;
} {
  const total = neos.length;
  const hazardous = neos.filter(
    (n) => n.is_potentially_hazardous_asteroid,
  ).length;

  const diameters = neos.map((n) => {
    const { estimated_diameter_min, estimated_diameter_max } =
      n.estimated_diameter.kilometers;
    return (estimated_diameter_min + estimated_diameter_max) / 2;
  });

  const avgDiameterKm =
    diameters.length > 0
      ? diameters.reduce((sum, d) => sum + d, 0) / diameters.length
      : 0;

  const hazardRate = total ? (hazardous / total) * 100 : 0;

  return { total, hazardous, hazardRate, avgDiameterKm };
}

/**
 * Pick closest NEO approaches (sorted by miss distance).
 */
function pickClosestNeos(
  neos: (NeoObject & { date: string })[],
  limit: number,
): (NeoObject & {
  date: string;
  missKm: number;
  velocityKmPerSec: number;
})[] {
  const enriched = neos
    .map((n) => {
      const firstApproach = n.close_approach_data[0];
      if (!firstApproach) return null;
      const missKm = Number(firstApproach.miss_distance.kilometers);
      const velocityKmPerSec = Number(
        firstApproach.relative_velocity.kilometers_per_second,
      );
      return {
        ...n,
        date: firstApproach.close_approach_date,
        missKm,
        velocityKmPerSec,
      };
    })
    .filter(Boolean) as (NeoObject & {
    date: string;
    missKm: number;
    velocityKmPerSec: number;
  })[];

  return enriched.sort((a, b) => a.missKm - b.missKm).slice(0, limit);
}

/**
 * Group solar flares by day to build small stats.
 */
function groupFlaresByDay(
  flares: SolarFlare[],
): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const f of flares) {
    const day = f.beginTime.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---- Page component ----

export default async function Page() {
  // Fetch all NASA data in parallel
  const [apods, neoFeed, flares] = await Promise.all([
    getApodRange(7), // last 7 days
    getNeoFeed(7),
    getSolarFlares(7),
  ]);

  const neoList = flattenNeos(neoFeed);
  const neoBars = buildNeoBars(neoFeed);
  const hazards = computeNeoHazards(neoList);
  const closestNeos = pickClosestNeos(neoList, 8);
  const flareByDay = groupFlaresByDay(flares);

  // Latest APOD to highlight (last item in sorted array)
  const featuredApod = apods[apods.length - 1];

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">NASA Space Dashboard</h1>
          <p className="text-sm text-slate-500">
            Near-Earth objects, solar flares and astronomy pictures — last 7
            days.
          </p>
        </div>
      </header>

      {/* KPI cards row */}
      <section className="mb-6 grid gap-4 md:grid-cols-4">
        {/* Total NEOs */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Near-Earth Objects (7 days)
          </p>
          <p className="mt-2 text-2xl font-bold">
            {hazards.total.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Total objects detected near Earth
          </p>
        </div>

        {/* Hazardous NEOs */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Potentially Hazardous
          </p>
          <p className="mt-2 text-2xl font-bold text-rose-600">
            {hazards.hazardous.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {hazards.hazardRate.toFixed(1)}% of NEOs
          </p>
        </div>

        {/* Solar flares count */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Solar Flares (DONKI)
          </p>
          <p className="mt-2 text-2xl font-bold">{flares.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            Events recorded in last 7 days
          </p>
        </div>

        {/* Average diameter */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Avg NEO Diameter (km)
          </p>
          <p className="mt-2 text-2xl font-bold">
            {hazards.avgDiameterKm.toFixed(3)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on estimated sizes (min/max)
          </p>
        </div>
      </section>

      {/* Middle row: NEO chart + hazard gauge + APOD */}
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* NEO count per day (bar chart) */}
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Near-Earth Objects per Day
              </p>
              <p className="text-sm text-slate-400">Last 7 days</p>
            </div>
          </div>

          <div className="mt-4 h-64 rounded-lg bg-slate-50 p-4">
            <div className="flex h-full items-end gap-2">
              {neoBars.map((bar) => (
                <div
                  key={bar.label}
                  className="flex h-full flex-1 flex-col items-center"
                >
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-full bg-indigo-500"
                      style={{ height: `${bar.height}%` }}
                      title={`${bar.count} NEOs`}
                    />
                  </div>
                  <span className="mt-2 block text-[10px] text-slate-500">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hazard rate gauge */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Hazard Ratio (NEOs)
          </p>
          <p className="text-sm text-slate-400">
            Potentially hazardous vs total
          </p>

          <div className="mt-4 flex flex-col items-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              {/* Background circle */}
              <div className="absolute h-full w-full rounded-full bg-slate-100" />
              {/* Filled arc based on hazardRate */}
              <div
                className="absolute h-full w-full rounded-full"
                style={{
                  background: `conic-gradient(#f97316 ${hazards.hazardRate}%, #e5e7eb ${hazards.hazardRate}% 100%)`,
                }}
              />
              {/* Inner circle */}
              <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-xs text-slate-500">Hazardous</span>
                <span className="text-xl font-bold">
                  {hazards.hazardRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="mt-3 flex w-full justify-between text-xs text-slate-500">
              <span>Hazardous: {hazards.hazardous}</span>
              <span>Total: {hazards.total}</span>
            </div>
          </div>
        </div>
      </section>

      {/* APOD highlight card */}
      {featuredApod && (
        <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Astronomy Picture of the Day
              </p>
              <p className="text-sm text-slate-400">{featuredApod.date}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Thumbnail */}
            <div className="md:col-span-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {featuredApod.media_type === "image" ? (
                <img
                  src={featuredApod.url}
                  alt={featuredApod.title}
                  className="h-48 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
                  Video: {featuredApod.url}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="md:col-span-2">
              <h2 className="text-sm font-semibold">{featuredApod.title}</h2>
              <p className="mt-2 text-xs text-slate-600 line-clamp-5">
                {featuredApod.explanation}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bottom row: NEO table + solar flares summary */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Closest NEOs table */}
        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Closest Near-Earth Objects
            </p>
            <p className="text-xs text-slate-400">
              Based on miss distance (km)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b text-[11px] uppercase text-slate-400">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Miss Dist. (km)</th>
                  <th className="py-2 pr-4">Velocity (km/s)</th>
                  <th className="py-2 pr-4">Hazardous</th>
                </tr>
              </thead>
              <tbody>
                {closestNeos.map((neo) => (
                  <tr key={neo.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-xs">{neo.name}</td>
                    <td className="py-2 pr-4 text-xs">
                      {new Date(neo.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {neo.missKm.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      {neo.velocityKmPerSec.toFixed(2)}
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          neo.is_potentially_hazardous_asteroid
                            ? "bg-rose-50 text-rose-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {neo.is_potentially_hazardous_asteroid ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Solar flares mini summary */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Solar Flares Overview
          </p>
          <p className="text-xs text-slate-400">DONKI FLR events by day</p>

          {/* Tiny bar list */}
          <div className="mt-4 space-y-2">
            {flareByDay.length === 0 && (
              <p className="text-xs text-slate-400">
                No flares in last 7 days.
              </p>
            )}

            {flareByDay.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.min(item.count * 25, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold">{item.count}</span>
              </div>
            ))}
          </div>

          {/* Last flare detail (if exists) */}
          {flares[0] && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="mb-1 text-[11px] font-semibold text-slate-600">
                Latest flare
              </p>
              <p className="text-xs text-slate-700">
                Class {flares[flares.length - 1].classType} at{" "}
                {new Date(flares[flares.length - 1].peakTime).toLocaleString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
              <p className="mt-1 text-[10px] text-slate-500 truncate">
                Source: {flares[flares.length - 1].sourceLocation ?? "Unknown"}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
