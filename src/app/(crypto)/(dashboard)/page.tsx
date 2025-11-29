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

import { BtcPriceChart } from "@/components/dashboard/widgets/BtcPriceChart";
// UI Components
import { ExtraMetrics } from "@/components/dashboard/widgets/ExtraMetrics";
import { GreenDaysGauge } from "@/components/dashboard/widgets/GreenDaysGauge";
import { KpiPrimaryMetrics } from "@/components/dashboard/widgets/KpiPrimaryMetrics";
import { MarketShareOverview } from "@/components/dashboard/widgets/MarketShareOverview";
import { TopCoinsTable } from "@/components/dashboard/widgets/TopCoinsTable";
import { VolumeOverview } from "@/components/dashboard/widgets/VolumeOverview";
import { getGlobalData, getMarketChart, getTopCoins } from "@/lib/coingecko";
import {
  buildPriceBars,
  buildVolumeBars,
  computeGreenRate,
} from "@/lib/metrics";
import type { MarketCoin } from "@/types/coingecko";

// ─────────────────────────────────────────────────────────────
// Type for computed market share section
// ─────────────────────────────────────────────────────────────

type MarketShareItem = {
  id: string;
  name: string;
  share: number; // market cap distribution (%)
};

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

  // ─────────────────────────────────────────────
  // Derived BTC price chart bars (12 sample points)
  // ─────────────────────────────────────────────
  const priceBars = buildPriceBars(btcChart.prices, 12);

  // Calculate Green Days % (how many days BTC closed higher)
  const { greenRate, up, down } = computeGreenRate(btcChart.prices);

  // Volume bar chart (24h trading volume)
  const volumeBars = buildVolumeBars(topCoins);

  // ─────────────────────────────────────────────
  // Market Share (Top 5 only)
  // ─────────────────────────────────────────────
  const top5 = topCoins.slice(0, 5);
  const totalTop5Cap = top5.reduce(
    (sum, coin) => sum + (coin.market_cap || 0),
    0,
  );

  const marketShare: MarketShareItem[] = top5.map((coin: MarketCoin) => ({
    id: coin.id,
    name: coin.name,
    share: totalTop5Cap ? (coin.market_cap / totalTop5Cap) * 100 : 0,
  }));

  // ─────────────────────────────────────────────
  // Extract Extra Stats: Top Gainer / Top Loser / Avg Change
  // ─────────────────────────────────────────────
  const coinsWithChange = topCoins.filter(
    (c) => typeof c.price_change_percentage_24h === "number",
  );

  // Top gainer in 24h
  const topGainer =
    coinsWithChange
      .slice()
      .sort(
        (a, b) =>
          (b.price_change_percentage_24h ?? 0) -
          (a.price_change_percentage_24h ?? 0),
      )[0] ?? null;

  // Biggest drop in 24h
  const topLoser =
    coinsWithChange
      .slice()
      .sort(
        (a, b) =>
          (a.price_change_percentage_24h ?? 0) -
          (b.price_change_percentage_24h ?? 0),
      )[0] ?? null;

  // Average change of top 10 coins
  const avgChange24h =
    coinsWithChange.length > 0
      ? coinsWithChange.reduce(
          (sum, c) => sum + (c.price_change_percentage_24h ?? 0),
          0,
        ) / coinsWithChange.length
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-900">
      {/* ─── KPI: Primary Market Indicators ─── */}
      <section className="mb-4 grid gap-4 md:grid-cols-4">
        <KpiPrimaryMetrics data={globalData} />
      </section>

      {/* ─── Extra Exchange / Gainer / Loser ─── */}
      <ExtraMetrics
        markets={globalData.markets}
        topGainer={topGainer}
        topLoser={topLoser}
        avgChange24h={avgChange24h}
      />

      {/* ─── BTC Chart + Green Days Gauge ─── */}
      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        <BtcPriceChart bars={priceBars} />
        <GreenDaysGauge greenRate={greenRate} up={up} down={down} />
      </section>

      {/* ─── Top Coins + Market Share Bar ─── */}
      <section className="grid gap-4 lg:grid-cols-3">
        <TopCoinsTable coins={topCoins} />
        <MarketShareOverview items={marketShare} />
      </section>

      {/* ─── Top 24h Volume Chart ─── */}
      <VolumeOverview bars={volumeBars} />
    </main>
  );
}
