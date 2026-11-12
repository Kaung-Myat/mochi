import { MochiMascot } from "@/components/mascot/mochi-mascot";
import { RoutineSettings } from "@/components/routines/routine-settings";

export default function RoutinePage() {
  return (
    <main className="mission-page mx-auto min-h-dvh max-w-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="relative overflow-hidden rounded-[1.5rem] border-[3px] border-white bg-[#fff7ee] px-3.5 pt-3.5 pb-3 shadow-[0_6px_0_#f0c9a8]">
        <div className="relative z-10 max-w-[72%]">
          <p className="text-[0.62rem] font-bold tracking-[0.14em] text-[#c45a3c]">QUEST BOARD</p>
          <h1 className="mt-0.5 text-xl font-semibold text-[#3a2a24]">နေ့စဉ် Mission</h1>
          <p className="mt-1 text-[0.78rem] text-stone-600">
            ရေ · စား · အိပ် — နှိပ်ပြီး sheet ထဲမှာ ပြင်လို့ရတယ်။
          </p>
        </div>
        <MochiMascot className="pointer-events-none absolute -right-1 -bottom-3 w-[4.8rem]" />
      </header>
      <RoutineSettings />
    </main>
  );
}
