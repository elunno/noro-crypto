/**
 * Pure data transformation helpers for the dashboard.
 * These functions NEVER call any API, they only shape data for the UI.
 */

import type { MarketCoin } from "@/types/coingecko";

/**
 * Build a simple bar representation from a price series.
 * We downsample to "maxPoints" to avoid too many bars.
 */
export function buildPriceBars(
  prices: [number, number][],
  maxPoints = 12,
): { label: string; value: number; height: number }[] {
  if (!prices.length) return [];

  const step = Math.max(1, Math.floor(prices.length / maxPoints));
  const sampled = prices.filter((_, idx) => idx % step === 0).slice(-maxPoints);

  const values = sampled.map(([, price]) => price);
  const maxValue = Math.max(...values);

  return sampled.map(([ts, price]) => {
    const label = new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const height = maxValue ? Math.round((price / maxValue) * 100) : 0;
    return { label, value: price, height };
  });
}

/**
 * Compute "green days" rate based on price movements.
 * Green = price increased since previous data point.
 */
export function computeGreenRate(prices: [number, number][]): {
  greenRate: number;
  up: number;
  down: number;
} {
  if (prices.length < 2) {
    return { greenRate: 0, up: 0, down: 0 };
  }

  let up = 0;
  let down = 0;

  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1][1];
    const curr = prices[i][1];
    const diff = curr - prev;

    if (diff > 0) up += 1;
    else if (diff < 0) down += 1;
  }

  const total = up + down;
  const greenRate = total ? (up / total) * 100 : 0;

  return { greenRate, up, down };
}

/**
 * Build bar data for 24h volume of top coins.
 */
export function buildVolumeBars(
  coins: MarketCoin[],
): { label: string; value: number; height: number }[] {
  if (!coins.length) return [];

  const volumes = coins.map((coin) => coin.total_volume || 0);
  const maxVolume = Math.max(...volumes);

  return coins.map((coin) => ({
    label: coin.symbol.toUpperCase(),
    value: coin.total_volume,
    height: maxVolume ? Math.round((coin.total_volume / maxVolume) * 100) : 0,
  }));
}
