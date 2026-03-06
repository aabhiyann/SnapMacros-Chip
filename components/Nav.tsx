"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/log", label: "Log" },
  { href: "/meals", label: "Meals" },
  { href: "/roast", label: "Roast" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-elevated bg-card safe-area-pb"
      aria-label="Main navigation"
    >
      <ul className="flex items-center justify-around min-h-[56px] px-2">
        {navItems.map(({ href, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`touch-target flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-w-[48px] min-h-[48px] ${
                  isActive ? "text-primary" : "text-text-secondary hover:text-text"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
