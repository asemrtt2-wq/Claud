"use client";

import { useState } from "react";

export default function ExpandableText({
  text,
  light = false,
}: {
  text: string;
  light?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 220;
  const shown = expanded || !isLong ? text : `${text.slice(0, 220).trimEnd()}…`;

  return (
    <p className={`leading-relaxed ${light ? "text-[#3a3a3c]" : "text-[color:var(--color-lumina-text-muted)]"}`}>
      {shown}
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`ml-2 font-semibold hover:underline ${light ? "text-[#5b3df0]" : "text-[#a78bfa]"}`}
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </p>
  );
}
