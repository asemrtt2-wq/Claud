export default function ProfileDashboardLoading() {
  return (
    <div className="lumina-shell px-6 pb-24 pt-6 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="skeleton h-8 w-32" />
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
        <div className="skeleton mb-2 h-7 w-56" />
        <div className="skeleton mb-8 h-4 w-40" />
        <div className="skeleton mb-12 h-[300px] w-full sm:h-[360px]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-10">
            <div className="skeleton mb-4 h-5 w-40" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="skeleton h-40 w-32 shrink-0 sm:w-36" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
