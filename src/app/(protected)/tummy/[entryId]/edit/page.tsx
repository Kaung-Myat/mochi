import { TummyEntryForm } from "@/components/tummy/tummy-entry-form";

export default async function EditTummyEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <p className="text-sm font-medium text-stone-600">ကိုယ်ပိုင်မှတ်စု</p>
      <h1 className="mt-2 text-3xl font-semibold">မှတ်စုကို ပြန်ပြင်မယ်</h1>
      <TummyEntryForm entryId={entryId} />
    </main>
  );
}
