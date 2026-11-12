import { RequireAuth } from "@/components/auth/require-auth";
import { ProtectedShell } from "@/components/layout/protected-shell";

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth>
      <ProtectedShell>{children}</ProtectedShell>
    </RequireAuth>
  );
}
