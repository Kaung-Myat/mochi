"use client";

import dynamic from "next/dynamic";

const MochiRive = dynamic(() => import("./mochi-rive").then((module) => module.MochiRive), {
  ssr: false,
  loading: () => <MochiFallback />,
});

export function MochiMascot({ className = "" }: { className?: string }) {
  const riveEnabled = process.env.NEXT_PUBLIC_RIVE_MOCHI_ENABLED === "true";

  return (
    <div
      aria-label="Mochi mascot"
      className={`mochi-mascot motion-safe:animate-[mochi-float_4s_ease-in-out_infinite] ${className}`}
      role="img"
    >
      {riveEnabled ? <MochiRive /> : <MochiFallback />}
    </div>
  );
}

function MochiFallback() {
  return (
    <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="160" cy="176" rx="110" ry="95" fill="#F4DFD4" />
      <ellipse cx="105" cy="195" rx="19" ry="10" fill="#EAB9AA" />
      <ellipse cx="215" cy="195" rx="19" ry="10" fill="#EAB9AA" />
      <ellipse cx="119" cy="157" rx="7" ry="10" fill="#2C211D" />
      <ellipse cx="201" cy="157" rx="7" ry="10" fill="#2C211D" />
      <ellipse cx="160" cy="190" rx="13" ry="6" fill="#2C211D" />
    </svg>
  );
}
