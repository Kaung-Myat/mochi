import { TodayDashboard } from "@/components/routines/today-dashboard";

export default function TodayPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <p className="text-sm font-medium tracking-wide text-stone-600">MOCHI</p>
      <h1 className="mt-3 text-4xl font-semibold">ဒီနေ့</h1>
      <TodayDashboard />
    </main>
  );
}
