"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

const items = [
  { href: "/today", label: "ဒီနေ့", icon: TodayIcon },
  { href: "/tummy", label: "ဗိုက်လေး", icon: TummyIcon },
  { href: "/routine", label: "အစီအစဉ်", icon: RoutineIcon },
  { href: "/settings", label: "ဆက်တင်", icon: SettingsIcon },
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
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs ${active ? "font-semibold text-stone-950" : "text-stone-500"}`}
            >
              <Icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TodayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3" />
    </svg>
  );
}

function TummyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20.5s-7-4.2-7-10.2A4.1 4.1 0 0 1 12 7.5a4.1 4.1 0 0 1 7 2.8c0 6-7 10.2-7 10.2Z" />
    </svg>
  );
}

function RoutineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M7 3.5v3M17 3.5v3M4.5 9h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
      <path d="M8 13h3M8 16h6" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="m19.4 15 .1.1-1.8 3.1-.2-.1-2-1a7.4 7.4 0 0 1-3 .8l-.6 2.1h-3.6l-.6-2.1a7.4 7.4 0 0 1-3-.8l-2 1-.2.1-1.8-3.1.1-.1 1.5-1.6a7.5 7.5 0 0 1 0-2.8L.5 9l-.1-.1 1.8-3.1.2.1 2 1a7.4 7.4 0 0 1 3-.8l.6-2.1h3.6l.6 2.1a7.4 7.4 0 0 1 3 .8l2-1 .2-.1 1.8 3.1-.1.1-1.5 1.6a7.5 7.5 0 0 1 0 2.8L19.4 15Z" />
    </svg>
  );
}
