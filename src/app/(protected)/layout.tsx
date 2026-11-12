import { RequireAuth } from "@/components/auth/require-auth";
import { BottomNavigation } from "@/components/navigation/bottom-navigation";

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireAuth>
      <div className="pb-20">{children}</div>
      <BottomNavigation />
    </RequireAuth>
  );
}
