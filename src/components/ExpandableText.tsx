"use client";

import { useState } from "react";

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 220;
  const shown = expanded || !isLong ? text : `${text.slice(0, 220).trimEnd()}…`;

  return (
    <p className="leading-relaxed text-[color:var(--color-lumina-text-muted)]">
      {shown}
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-2 font-semibold text-[#a78bfa] hover:underline"
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </p>
  );
}
