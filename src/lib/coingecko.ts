/**
 * CoinGecko data access layer.
 *
 * All API calls are centralized here so that:
 *  - the dashboard pages stay clean
 *  - you can swap API providers in one place later
 */

import type { GlobalData, MarketChart, MarketCoin } from "@/types/coingecko";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

/**
 * Fetch global crypto market data from CoinGecko.
 */
export async function getGlobalData(): Promise<GlobalData> {
  const res = await fetch(`${COINGECKO_API}/global`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch global data");
  }

  const json = (await res.json()) as { data: GlobalData };
  return json.data;
}

/**
 * Fetch top N coins by market cap (USD).
 */
export async function getTopCoins(limit = 10): Promise<MarketCoin[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(limit),
    page: "1",
    sparkline: "false",
    price_change_percentage: "24h",
  });

  const res = await fetch(
    `${COINGECKO_API}/coins/markets?${params.toString()}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch market coins");
  }

  const data = (await res.json()) as MarketCoin[];
  return data;
}

/**
 * Fetch market chart series for a specific coin (e.g. "bitcoin").
 * "days" defines how many days back to fetch.
 */
export async function getMarketChart(
  coinId = "bitcoin",
  days = 30,
): Promise<MarketChart> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    days: String(days),
  });

  const res = await fetch(
    `${COINGECKO_API}/coins/${coinId}/market_chart?${params.toString()}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch market chart");
  }

  const data = (await res.json()) as MarketChart;
  return data;
}
