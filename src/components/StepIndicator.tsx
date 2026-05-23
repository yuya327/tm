type Step = {
  label: string;
  done?: boolean;
};

export function StepIndicator({
  current,
  total = 5,
  steps,
}: {
  current: number;
  total?: number;
  steps?: Step[];
}) {
  const labels = steps?.map((s) => s.label) ?? [
    "アップロード",
    "解析",
    "選別",
    "スタイル",
    "加工",
  ];

  return (
    <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4 text-xs">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        const isDone = n < current;
        return (
          <div key={n} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                isCurrent
                  ? "border-orange-500 bg-orange-500 text-white"
                  : isDone
                    ? "border-orange-500 bg-white text-orange-600"
                    : "border-stone-300 bg-white text-stone-400"
              }`}
            >
              {isDone ? "✓" : n}
            </div>
            <span
              className={`hidden sm:block ${isCurrent ? "font-medium text-stone-900" : "text-stone-500"}`}
            >
              {labels[i]}
            </span>
            {n < total && (
              <div
                className={`mx-1 h-px flex-1 ${isDone ? "bg-orange-500" : "bg-stone-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
