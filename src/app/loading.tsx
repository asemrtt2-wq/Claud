export default function HomeLoading() {
  return (
    <div className="lumina-shell px-6 pb-24 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 grid items-center gap-14 md:grid-cols-2">
          <div>
            <div className="skeleton mb-6 h-6 w-40" />
            <div className="skeleton mb-3 h-10 w-full max-w-md" />
            <div className="skeleton mb-8 h-10 w-3/4 max-w-sm" />
            <div className="skeleton h-12 w-44" />
          </div>
          <div className="skeleton h-72 w-full" />
        </div>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-[290px] w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
