export default function LogoMark({ className }: { className: string }) {
  return (
    <span className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[55%] w-[55%]" aria-hidden="true">
        <path d="M12 2c.6 3.4 1.4 5.6 2.4 6.6S17.6 11.4 21 12c-3.4.6-5.6 1.4-6.6 2.4S12.6 17.6 12 21c-.6-3.4-1.4-5.6-2.4-6.6S6.4 12.6 3 12c3.4-.6 5.6-1.4 6.6-2.4S11.4 5.4 12 2Z" />
      </svg>
    </span>
  );
}
