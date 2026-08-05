export function PhoneFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative aspect-[9/19] w-56 shrink-0 rounded-[2.2rem] border-[6px] border-[#1c1a33] bg-[#0a0918] shadow-[0_30px_70px_rgba(0,0,0,0.55)] ${className ?? ""}`}
    >
      <div className="absolute left-1/2 top-2 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/60" />
      <div className="relative h-full w-full overflow-hidden rounded-[1.7rem]">{children}</div>
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
