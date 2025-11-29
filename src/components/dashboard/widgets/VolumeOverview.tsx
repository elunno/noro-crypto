type VolumeBar = {
  label: string;
  value: number;
  height: number;
};

type VolumeOverviewProps = {
  bars: VolumeBar[];
};

export function VolumeOverview({ bars }: VolumeOverviewProps) {
  return (
    <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">
        Top 10 Coins by 24h Volume
      </p>
      <p className="text-xs text-slate-400">
        Relative trading volume in the last 24 hours (USD)
      </p>

      <div className="mt-4 h-64 rounded-lg bg-slate-50 p-4">
        <div className="flex h-full items-end gap-2">
          {bars.map((bar) => (
            <div
              key={bar.label}
              className="flex h-full flex-1 flex-col items-center"
            >
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-full bg-sky-500"
                  style={{ height: `${bar.height}%` }}
                  title={`$${bar.value.toLocaleString()}`}
                />
              </div>
              <span className="mt-2 block text-[10px] text-slate-500">
                {bar.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
