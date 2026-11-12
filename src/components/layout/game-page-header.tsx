import { MochiMascot } from "@/components/mascot/mochi-mascot";

export function GamePageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="game-page-header relative overflow-hidden rounded-[2rem] border-4 border-[#7ec8f8] bg-white p-5 shadow-[0_8px_0_#7ec8f8]">
      <div className="relative z-10 max-w-[70%]">
        <p className="text-[0.68rem] font-bold tracking-[0.16em] text-[#1d6f9a]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold text-stone-900">{title}</h1>
        {description && <p className="mt-2 text-sm text-stone-600">{description}</p>}
      </div>
      <MochiMascot className="absolute -right-2 -bottom-5 w-28" />
    </header>
  );
}
