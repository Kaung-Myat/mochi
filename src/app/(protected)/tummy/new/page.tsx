import { TummyEntryForm } from "@/components/tummy/tummy-entry-form";

export default function NewTummyEntryPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <p className="text-sm font-medium text-stone-600">ကိုယ်ပိုင်မှတ်စု</p>
      <h1 className="mt-2 text-3xl font-semibold">ဗိုက်အခြေအနေ မှတ်မယ်</h1>
      <TummyEntryForm />
    </main>
  );
}
