type TopCoin = {
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

type TopCoinsTableProps = {
  coins: TopCoin[];
};

export function TopCoinsTable({ coins }: TopCoinsTableProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">
          Top Coins by Market Cap
        </p>
        <p className="text-xs text-slate-400">Top 10 coins (USD)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b text-[11px] uppercase text-slate-400">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">24h %</th>
              <th className="py-2 pr-4">Market Cap</th>
              <th className="py-2 pr-4">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <tr key={coin.id} className="border-b last:border-0">
                <td className="py-2 pr-4 text-[11px] text-slate-500">
                  {coin.market_cap_rank}
                </td>
                <td className="flex items-center gap-2 py-2 pr-4 text-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="h-5 w-5 rounded-full"
                  />
                  <div>
                    <p className="text-xs font-medium">{coin.name}</p>
                    <p className="text-[10px] uppercase text-slate-400">
                      {coin.symbol}
                    </p>
                  </div>
                </td>
                <td className="py-2 pr-4 text-xs">
                  ${coin.current_price.toLocaleString()}
                </td>
                <td
                  className={`py-2 pr-4 text-xs ${
                    (coin.price_change_percentage_24h ?? 0) >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {coin.price_change_percentage_24h
                    ? coin.price_change_percentage_24h.toFixed(2)
                    : "0.00"}
                  %
                </td>
                <td className="py-2 pr-4 text-xs">
                  ${coin.market_cap.toLocaleString()}
                </td>
                <td className="py-2 pr-4 text-xs">
                  ${coin.total_volume.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
