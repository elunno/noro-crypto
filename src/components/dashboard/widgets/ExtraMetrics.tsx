type SimpleCoin = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number | null;
};

type ExtraMetricsProps = {
  markets: number;
  topGainer: SimpleCoin | null;
  topLoser: SimpleCoin | null;
  avgChange24h: number;
};

export function ExtraMetrics({
  markets,
  topGainer,
  topLoser,
  avgChange24h,
}: ExtraMetricsProps) {
  return (
    <section className="mb-6 grid gap-4 md:grid-cols-3">
      {/* Total Markets / Exchanges */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Total Markets</p>
        <p className="mt-2 text-2xl font-bold">{markets.toLocaleString()}</p>
        <p className="mt-1 text-xs text-slate-500">
          Trading markets/exchanges tracked by CoinGecko
        </p>
      </div>

      {/* Top Gainer in last 24h */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Top Gainer (24h)</p>
        {topGainer ? (
          <>
            <p className="mt-2 text-sm font-semibold">
              {topGainer.name} ({topGainer.symbol.toUpperCase()})
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {topGainer.price_change_percentage_24h?.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Price: ${topGainer.current_price.toLocaleString()}
            </p>
          </>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No data available</p>
        )}
      </div>

      {/* Top Loser in last 24h + Avg change */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Top Loser (24h)</p>
        {topLoser ? (
          <>
            <p className="mt-2 text-sm font-semibold">
              {topLoser.name} ({topLoser.symbol.toUpperCase()})
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-600">
              {topLoser.price_change_percentage_24h?.toFixed(2)}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Price: ${topLoser.current_price.toLocaleString()}
            </p>
          </>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No data available</p>
        )}
        <p className="mt-3 text-[11px] text-slate-400">
          Avg 24h change (top 10): {avgChange24h.toFixed(2)}%
        </p>
      </div>
    </section>
  );
}
