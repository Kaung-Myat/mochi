"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/today", label: "ဒီနေ့", icon: "☀" },
  { href: "/tummy", label: "ဗိုက်လေး", icon: "♡" },
  { href: "/routine", label: "အစီအစဉ်", icon: "↻" },
  { href: "/settings", label: "ဆက်တင်", icon: "⚙" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="အဓိက စာမျက်နှာများ"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-[#fffaf3]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${active ? "font-semibold text-stone-950" : "text-stone-500"}`}
            >
              <span className="text-lg" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
