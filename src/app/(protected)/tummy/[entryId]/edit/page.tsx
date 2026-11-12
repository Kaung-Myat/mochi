import { DiaryEditorHeader } from "@/components/layout/diary-editor-header";
import { TummyEntryForm } from "@/components/tummy/tummy-entry-form";

export default async function EditTummyEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = await params;
  return (
    <main className="diary-editor-page mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(0.65rem,env(safe-area-inset-top))]">
      <DiaryEditorHeader title="မှတ်စုပြင်မယ်" />
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <TummyEntryForm entryId={entryId} />
      </div>
    </main>
  );
}
