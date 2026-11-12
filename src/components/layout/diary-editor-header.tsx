import Link from "next/link";
import { MochiMascot } from "@/components/mascot/mochi-mascot";

export function DiaryEditorHeader({
  title,
  eyebrow = "SECRET DIARY",
}: {
  title: string;
  eyebrow?: string;
}) {
  return (
    <header className="relative shrink-0 overflow-hidden rounded-[1.5rem] border-[3px] border-white bg-[#fff7ee] px-3 pt-3 pb-2.5 shadow-[0_6px_0_#f0c9a8]">
      <div className="relative z-10 flex items-start gap-2.5">
        <Link
          href="/tummy"
          aria-label="Back to diary"
          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-white bg-[#7ec8f8] text-[#1d6f9a] shadow-[0_3px_0_#5fb4e8] active:translate-y-0.5 active:shadow-none"
        >
          <BackIcon />
        </Link>
        <div className="min-w-0 flex-1 pr-14">
          <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">{eyebrow}</p>
          <h1 className="mt-0.5 text-xl font-semibold text-[#3a2a24]">{title}</h1>
        </div>
      </div>
      <MochiMascot className="pointer-events-none absolute -right-1 -bottom-3 w-[4.6rem]" />
    </header>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
