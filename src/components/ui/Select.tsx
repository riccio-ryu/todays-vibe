"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: number | string;
  label: string;
}

interface Props {
  value: number | string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
}

export default function Select({ value, onChange, options, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [open]);

  // 열릴 때 선택된 항목으로 스크롤
  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector("[data-selected=true]") as HTMLElement | null;
    active?.scrollIntoView({ block: "nearest" });
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 hover:border-white/30 transition-colors"
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          className={`w-3 h-3 text-white/40 shrink-0 ml-1 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 top-full mt-1 w-full max-h-44 overflow-y-auto rounded-lg bg-[#1a1530] border border-white/15 shadow-2xl"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                data-selected={isSelected}
                onClick={() => {
                  onChange(String(opt.value));
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-purple-500/20 hover:text-white ${
                  isSelected
                    ? "text-purple-300 bg-purple-500/10 font-medium"
                    : "text-white/60"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
