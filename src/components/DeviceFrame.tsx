export function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative aspect-[9/19] w-56 shrink-0 rounded-[2.4rem] bg-gradient-to-br from-[#38355c] via-[#1c1a33] to-[#100e20] p-[5px] shadow-[0_30px_70px_rgba(0,0,0,0.55)] ${className ?? ""}`}
    >
      {/* side buttons */}
      <span className="absolute -left-[2px] top-[22%] h-7 w-[3px] rounded-l-full bg-[#100e20]" />
      <span className="absolute -left-[2px] top-[30%] h-11 w-[3px] rounded-l-full bg-[#100e20]" />
      <span className="absolute -right-[2px] top-[26%] h-14 w-[3px] rounded-r-full bg-[#100e20]" />

      <div className="relative h-full w-full overflow-hidden rounded-[2.05rem] bg-[#0a0918] ring-1 ring-inset ring-white/[0.08]">
        <div className="absolute left-1/2 top-2 z-20 h-[1.35rem] w-[5.5rem] -translate-x-1/2 rounded-full bg-black" />
        {children}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
      </div>
    </div>
  );
}

export function TabletFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative aspect-[3/4] w-72 shrink-0 rounded-[1.6rem] border-[8px] border-[#1c1a33] bg-[#0a0918] shadow-[0_30px_70px_rgba(0,0,0,0.55)] ${className ?? ""}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[0.9rem]">{children}</div>
    </div>
  );
}

export function LaptopFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`shrink-0 ${className ?? ""}`}>
      <div className="aspect-[16/10] w-[26rem] rounded-t-xl border-[10px] border-b-0 border-[#1c1a33] bg-[#0a0918] shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
        <div className="h-full w-full overflow-hidden rounded-t-sm">{children}</div>
      </div>
      <div className="mx-auto h-3 w-[28rem] rounded-b-xl bg-gradient-to-b from-[#2a2748] to-[#1c1a33]" />
    </div>
  );
}
