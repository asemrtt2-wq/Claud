"use client";

import { useEffect, useState } from "react";

export default function BedtimeReminder({
  reminderTime,
  hasReadToday,
  name,
}: {
  reminderTime: string | null;
  hasReadToday: boolean;
  name: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!reminderTime || hasReadToday) return;
    const [h, m] = reminderTime.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;

    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);

    const diffMinutes = (now.getTime() - target.getTime()) / 60000;
    if (diffMinutes >= 0 && diffMinutes <= 90) setShow(true);
  }, [reminderTime, hasReadToday]);

  if (!show) return null;

  return (
    <div className="lumina-card mb-6 flex items-center gap-3 rounded-2xl border-[#a78bfa]/40 p-4">
      <span className="text-2xl">🌙</span>
      <p className="text-sm font-semibold">
        {`C'est l'heure de l'histoire du soir de ${name} !`}
      </p>
    </div>
  );
}
