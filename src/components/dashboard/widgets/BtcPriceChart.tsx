type PriceBar = {
  label: string;
  value: number;
  height: number;
};

type BtcPriceChartProps = {
  bars: PriceBar[];
};

export function BtcPriceChart({ bars }: BtcPriceChartProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            BTC Price Overview
          </p>
          <p className="text-sm text-slate-400">Last 30 days (sampled)</p>
        </div>
      </div>

      <div className="mt-4 h-64 rounded-lg bg-slate-50 p-4">
        <div className="flex h-full items-end gap-2">
          {bars.map((bar) => (
            <div
              key={bar.label}
              className="flex h-full flex-1 flex-col items-center"
            >
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-full bg-emerald-500"
                  style={{ height: `${bar.height}%` }}
                  title={`$${bar.value.toFixed(2)}`}
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
  );
}
