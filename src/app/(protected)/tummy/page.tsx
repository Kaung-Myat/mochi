import { TummyJournal } from "@/components/tummy/tummy-journal";

export default function TummyPage() {
  return (
    <main className="diary-page mx-auto min-h-dvh max-w-md px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <TummyJournal />
    </main>
  );
}
