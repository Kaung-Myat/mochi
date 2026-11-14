import { DiaryEditorHeader } from "@/components/layout/diary-editor-header";
import { TummyEntryForm } from "@/components/tummy/tummy-entry-form";

export default function NewTummyEntryPage() {
  return (
    <main className="diary-editor-page mx-auto flex h-dvh max-h-dvh max-w-md flex-col overflow-hidden px-4 pt-[max(0.65rem,env(safe-area-inset-top))]">
      <DiaryEditorHeader title="မှတ်စုအသစ်" />
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
        <TummyEntryForm />
      </div>
    </main>
  );
}
