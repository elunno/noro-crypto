type GreenDaysGaugeProps = {
  greenRate: number;
  up: number;
  down: number;
};

export function GreenDaysGauge({ greenRate, up, down }: GreenDaysGaugeProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">Green Days Rate</p>
      <p className="text-sm text-slate-400">Based on BTC price moves</p>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute h-full w-full rounded-full bg-slate-100" />
          <div
            className="absolute h-full w-full rounded-full"
            style={{
              background: `conic-gradient(#22c55e ${greenRate}%, #e5e7eb ${greenRate}% 100%)`,
            }}
          />
          <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-xs text-slate-500">Green Days</span>
            <span className="text-xl font-bold">{greenRate.toFixed(1)}%</span>
          </div>
        </div>

        <div className="mt-3 flex w-full justify-between text-xs text-slate-500">
          <span>Up moves: {up}</span>
          <span>Down moves: {down}</span>
        </div>
      </div>
    </div>
  );
}
