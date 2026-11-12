"use client";

import { MochiFallback } from "./mochi-fallback";

export function MochiMascot({ className = "" }: { className?: string }) {
  return (
    <div aria-label="Mochi mascot" className={`mochi-mascot aspect-square shrink-0 ${className}`} role="img">
      <MochiFallback />
    </div>
  );
}
