/**
 * Crypto Dashboard — Open Source Example
 *
 * This page renders a complete analytics dashboard using:
 *  - Next.js 14 App Router (Server Components)
 *  - TypeScript + Tailwind CSS
 *  - CoinGecko Public API (no authentication required)
 *
 * The goal of this file is to remain clean + easy to maintain.
 * All UI sections are extracted into reusable components (see /components/dashboard).
 *
 * Data Fetching Responsibility:
 *  ▪ Global Metrics
 *  ▪ Top 10 Coins (Market Cap, 24h Change, Volume…)
 *  ▪ BTC Price History (chart visualization)
 *
 * The final UI displays:
 *  ✔ KPI Cards
 *  ✔ Extra Market Stats (Top Gainer / Loser + Avg 24h Change)
 *  ✔ BTC Price Overview Chart
 *  ✔ Market Green Day Gauge
 *  ✔ Top Coins Table
 *  ✔ Market Share Distribution Bar
 *  ✔ 24h Volume Bar Chart
 *
 * This dashboard is designed to demonstrate production-level structure and modularity.
 */

import { getGlobalData, getTopCoins, getMarketChart } from "@/lib/coingecko";
import { buildPriceBars, computeGreenRate, buildVolumeBars } from "@/lib/metrics";
import type { MarketCoin } from "@/types/coingecko";

// UI Components
import { KpiPrimaryMetrics } from '@/components/dashboard/widgets/KpiPrimaryMetrics';

// ─────────────────────────────────────────────────────────────
// Type for computed market share section
// ─────────────────────────────────────────────────────────────

export default async function Page() {
    /**
     * Fetch all required data in parallel (faster page load)
     * These run server-side — no client keys needed.
     */
    const [globalData, topCoins, btcChart] = await Promise.all([
        getGlobalData(),
        getTopCoins(10),
        getMarketChart("bitcoin", 30),
    ]);

    return (
        <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
            <KpiPrimaryMetrics data={globalData} />
        </main>
    );
}
