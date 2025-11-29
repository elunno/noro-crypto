/**
 * Core CoinGecko types shared across the app.
 * Keeping them in a separate file makes them reusable and testable.
 */

// Type for /global endpoint (wrapped in { data: GlobalData })
export type GlobalData = {
  active_cryptocurrencies: number;
  markets: number;
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
};

// Type for /coins/markets items
export type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  market_cap_rank: number;
};

// Type for /coins/{id}/market_chart
export type MarketChart = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};
