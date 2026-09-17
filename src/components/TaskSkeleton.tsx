export function TaskSkeleton() {
  return (
    <div className="space-y-2.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start gap-3">
            <div className="skeleton w-5 h-5 rounded-md flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 rounded w-3/4" />
              <div className="flex gap-2">
                <div className="skeleton h-5 rounded-md w-20" />
                <div className="skeleton h-5 rounded-md w-16" />
                <div className="skeleton h-5 rounded-md w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
