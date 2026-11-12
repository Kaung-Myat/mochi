import { RoutineSettings } from "@/components/routines/routine-settings";

export default function RoutinePage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <p className="text-sm font-medium tracking-wide text-stone-600">မင်းရဲ့ နေ့စဉ်စည်းချက်</p>
      <h1 className="mt-3 text-4xl font-semibold">နေ့စဉ်အစီအစဉ်</h1>
      <p className="mt-3 leading-7 text-stone-600">
        နေ့ရက်တွေပြောင်းသလို အချိန်မရွေး လိုက်ပြောင်းနိုင်တဲ့ နူးညံ့တဲ့ အစီအစဉ်လေးတွေပါ။
      </p>
      <RoutineSettings />
    </main>
  );
}
