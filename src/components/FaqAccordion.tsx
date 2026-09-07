"use client";

import { useState } from "react";
import type { FaqEntry } from "@/lib/faq";

/**
 * Accordion for the public FAQ.
 *
 * Answers stay in the DOM whether open or shut (height is animated, not conditionally
 * rendered) so search engines and Ctrl+F both find the text — a collapsed answer that isn't
 * rendered is invisible to them, which would undo the point of publishing an FAQ.
 */
export default function FaqAccordion({ items }: { items: FaqEntry[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <li key={item.id} className="lumia-card overflow-hidden rounded-[18px]">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.04] sm:px-6 sm:py-5"
            >
              <span className="text-[0.95rem] font-bold text-white sm:text-base">
                {item.question}
              </span>
              <span
                className={`shrink-0 text-lg text-[#a78bfa] transition-transform duration-300 ${
                  open ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-wrap px-5 pb-5 text-sm leading-relaxed text-[color:var(--color-lumia-text-muted)] sm:px-6 sm:pb-6">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
