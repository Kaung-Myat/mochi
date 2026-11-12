"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";

function isDiaryEditor(pathname: string) {
  return pathname === "/tummy/new" || /^\/tummy\/[^/]+\/edit$/.test(pathname);
}

export function ProtectedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fullBleed = pathname === "/today";
  const diaryEditor = isDiaryEditor(pathname);

  return (
    <>
      <div
        className={
          fullBleed || diaryEditor
            ? ""
            : "pb-[calc(5.75rem+env(safe-area-inset-bottom))]"
        }
      >
        {children}
      </div>
      {!diaryEditor && <BottomNavigation />}
    </>
  );
}
