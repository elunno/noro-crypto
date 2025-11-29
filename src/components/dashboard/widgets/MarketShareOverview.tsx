type MarketShareItem = {
  id: string;
  name: string;
  share: number;
};

type MarketShareOverviewProps = {
  items: MarketShareItem[];
};

function getColorForCoin(id: string): string {
  if (id === "bitcoin") return "#f7931a";
  if (id === "ethereum") return "#3c3c3d";
  return "#22c55e";
}

export function MarketShareOverview({ items }: MarketShareOverviewProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">
        Market Share Overview
      </p>
      <p className="text-xs text-slate-400">
        Distribution of market cap among top 5 coins
      </p>

      <div className="mt-4">
        <div className="flex h-6 overflow-hidden rounded-full bg-slate-100">
          {items.map((coin) => (
            <div
              key={coin.id}
              className="h-full"
              style={{
                width: `${coin.share}%`,
                background: getColorForCoin(coin.id),
              }}
              title={`${coin.name}: ${coin.share.toFixed(2)}%`}
            />
          ))}
        </div>

        <div className="mt-4 space-y-2 text-xs">
          {items.map((coin) => (
            <div key={coin.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: getColorForCoin(coin.id) }}
                />
                <span>{coin.name}</span>
              </div>
              <span className="font-medium">{coin.share.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
