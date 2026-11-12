"use client";

import { useId } from "react";

/** Animated SVG Mochi, used when the Rive asset cannot load. */
export function MochiFallback() {
  const rawId = useId().replace(/:/g, "");
  const fur = `${rawId}-fur`;
  const cream = `${rawId}-cream`;
  const dark = `${rawId}-dark`;
  const shine = `${rawId}-shine`;

  return (
    <svg
      aria-hidden="true"
      className="mochi-character block size-full overflow-visible"
      viewBox="0 0 320 320"
      fill="none"
      stroke="#5B3A2E"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <radialGradient id={fur} cx="34%" cy="24%" r="76%">
          <stop offset="0%" stopColor="#FFC48A" />
          <stop offset="45%" stopColor="#F07828" />
          <stop offset="100%" stopColor="#C44A12" />
        </radialGradient>
        <radialGradient id={cream} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFE8D4" />
        </radialGradient>
        <radialGradient id={dark} cx="40%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#6B4032" />
          <stop offset="100%" stopColor="#3A2218" />
        </radialGradient>
        <radialGradient id={shine} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse className="mochi-shadow" cx="160" cy="298" rx="68" ry="14" fill="#6B3F28" opacity="0.22" stroke="none" />

      <g className="mochi-tail">
        <ellipse cx="228" cy="210" rx="22" ry="28" fill={`url(#${fur})`} transform="rotate(28 228 210)" />
        <ellipse cx="248" cy="188" rx="20" ry="24" fill={`url(#${cream})`} stroke="none" transform="rotate(18 248 188)" />
        <ellipse cx="262" cy="162" rx="18" ry="22" fill={`url(#${fur})`} transform="rotate(8 262 162)" />
        <ellipse cx="268" cy="136" rx="16" ry="18" fill={`url(#${cream})`} stroke="none" transform="rotate(-4 268 136)" />
        <ellipse cx="262" cy="114" rx="14" ry="16" fill={`url(#${fur})`} transform="rotate(-14 262 114)" />
        <ellipse cx="248" cy="98" rx="12" ry="12" fill={`url(#${cream})`} stroke="none" />
      </g>

      <g className="mochi-body">
        <ellipse cx="134" cy="256" rx="18" ry="36" fill={`url(#${dark})`} />
        <ellipse cx="186" cy="256" rx="18" ry="36" fill={`url(#${dark})`} />
        <ellipse cx="132" cy="284" rx="20" ry="10" fill={`url(#${cream})`} stroke="none" />
        <ellipse cx="188" cy="284" rx="20" ry="10" fill={`url(#${cream})`} stroke="none" />
        <ellipse cx="160" cy="198" rx="58" ry="62" fill={`url(#${fur})`} />
        <ellipse cx="148" cy="176" rx="18" ry="12" fill={`url(#${shine})`} stroke="none" />
        <ellipse cx="160" cy="208" rx="32" ry="38" fill={`url(#${cream})`} stroke="none" />
      </g>

      <g className="mochi-paw-rest">
        <g transform="rotate(22 108 206)">
          <ellipse cx="108" cy="206" rx="15" ry="24" fill={`url(#${fur})`} />
          <ellipse cx="104" cy="224" rx="14" ry="12" fill={`url(#${dark})`} />
          <ellipse cx="100" cy="226" rx="3.5" ry="3" fill="#E8A090" stroke="none" />
          <ellipse cx="107" cy="228" rx="3.5" ry="3" fill="#E8A090" stroke="none" />
          <ellipse cx="114" cy="226" rx="3.5" ry="3" fill="#E8A090" stroke="none" />
        </g>
      </g>

      <g className="mochi-head">
        <g className="mochi-ear">
          <ellipse cx="108" cy="58" rx="24" ry="30" fill={`url(#${fur})`} transform="rotate(-16 108 58)" />
          <ellipse cx="108" cy="62" rx="12" ry="16" fill="#F4B8A8" stroke="none" transform="rotate(-16 108 62)" />
        </g>
        <g className="mochi-ear mochi-ear-right">
          <ellipse cx="212" cy="58" rx="24" ry="30" fill={`url(#${fur})`} transform="rotate(16 212 58)" />
          <ellipse cx="212" cy="62" rx="12" ry="16" fill="#F4B8A8" stroke="none" transform="rotate(16 212 62)" />
        </g>

        <ellipse cx="160" cy="112" rx="78" ry="70" fill={`url(#${fur})`} />
        <ellipse cx="130" cy="86" rx="28" ry="14" fill={`url(#${shine})`} stroke="none" />

        <ellipse cx="160" cy="128" rx="42" ry="34" fill={`url(#${cream})`} stroke="none" />
        <ellipse cx="124" cy="96" rx="16" ry="10" fill={`url(#${cream})`} stroke="none" transform="rotate(-18 124 96)" />
        <ellipse cx="196" cy="96" rx="16" ry="10" fill={`url(#${cream})`} stroke="none" transform="rotate(18 196 96)" />

        <ellipse cx="126" cy="112" rx="22" ry="24" fill="#FFFDFB" />
        <ellipse cx="194" cy="112" rx="22" ry="24" fill="#FFFDFB" />
        <g className="mochi-pupils" stroke="none">
          <ellipse cx="128" cy="114" rx="12" ry="14" fill="#7CB342" />
          <ellipse cx="196" cy="114" rx="12" ry="14" fill="#7CB342" />
          <ellipse cx="128" cy="116" rx="7" ry="9" fill="#2A1C16" />
          <ellipse cx="196" cy="116" rx="7" ry="9" fill="#2A1C16" />
          <ellipse cx="123" cy="108" rx="4.5" ry="4.5" fill="#fff" />
          <ellipse cx="191" cy="108" rx="4.5" ry="4.5" fill="#fff" />
          <ellipse cx="133" cy="120" rx="2" ry="2" fill="#fff" opacity="0.8" />
          <ellipse cx="201" cy="120" rx="2" ry="2" fill="#fff" opacity="0.8" />
        </g>
        <ellipse className="mochi-lid" cx="126" cy="112" rx="23" ry="25" fill="#F07828" />
        <ellipse className="mochi-lid" cx="194" cy="112" rx="23" ry="25" fill="#F07828" />

        <ellipse cx="160" cy="134" rx="8" ry="6" fill="#2A1C16" stroke="none" />
        <ellipse cx="158" cy="132" rx="2.5" ry="1.8" fill="#fff" stroke="none" opacity="0.7" />
        <path d="M150 148c6 6 14 6 20 0" fill="none" strokeWidth="3" />

        <ellipse cx="102" cy="128" rx="12" ry="8" fill="#F7B2A8" stroke="none" opacity="0.9" />
        <ellipse cx="218" cy="128" rx="12" ry="8" fill="#F7B2A8" stroke="none" opacity="0.9" />
      </g>

      <g className="mochi-paw-wave">
        <g transform="rotate(-38 230 150)">
          <ellipse cx="230" cy="150" rx="15" ry="28" fill={`url(#${fur})`} />
          <ellipse cx="236" cy="126" rx="15" ry="14" fill={`url(#${dark})`} />
          <ellipse cx="230" cy="122" rx="3.5" ry="3" fill="#E8A090" stroke="none" />
          <ellipse cx="237" cy="120" rx="3.5" ry="3" fill="#E8A090" stroke="none" />
          <ellipse cx="244" cy="122" rx="3.5" ry="3" fill="#E8A090" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
