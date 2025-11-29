import type { GlobalData } from "@/types/coingecko";

type Props = { data: GlobalData };

export function KpiCards({ data }: Props) {
  return (
    <section className="mb-4 grid gap-4 md:grid-cols-4 bg-red-900">
      {/* Total Market Cap */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Total Market Cap</p>
        <p className="mt-2 text-2xl font-bold">
          ${Math.round(data.total_market_cap.usd).toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-emerald-600">
          {data.market_cap_change_percentage_24h_usd.toFixed(2)}% in last 24h
        </p>
      </div>

      {/* 24h Volume */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500">24h Volume</p>
        <p className="mt-2 text-2xl font-bold">
          ${Math.round(data.total_volume.usd).toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Total traded volume in USD
        </p>
      </div>

      {/* Active Cryptocurrencies */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500">
          Active Cryptocurrencies
        </p>
        <p className="mt-2 text-2xl font-bold">
          {data.active_cryptocurrencies.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Currently listed and active
        </p>
      </div>

      {/* BTC Dominance */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-slate-500">BTC Dominance</p>
        <p className="mt-2 text-2xl font-bold">
          {data.market_cap_percentage.btc.toFixed(1)}%
        </p>
        <p className="mt-1 text-xs text-slate-500">
          ETH: {data.market_cap_percentage.eth.toFixed(1)}%
        </p>
      </div>
    </section>
  );
}
