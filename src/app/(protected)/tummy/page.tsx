import { TummyJournal } from "@/components/tummy/tummy-journal";

export default function TummyPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <p className="text-sm font-medium tracking-wide text-stone-600">ကိုယ်ပိုင်မှတ်စု</p>
      <h1 className="mt-3 text-4xl font-semibold">ဗိုက်လေး</h1>
      <TummyJournal />
    </main>
  );
}
