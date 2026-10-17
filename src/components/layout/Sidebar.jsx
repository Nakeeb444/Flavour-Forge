"use client";

import { LogoMark } from "@/components/ui/icons";
import { MOBILE_ITEMS, NAV_GROUPS } from "@/components/layout/navigation";

export function Logo({ onHome }) {
  return (
    <button
      type="button"
      onClick={onHome}
      aria-label="Flavour Forge — go to Home"
      className="flex flex-col items-center text-center focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-brand-500"
    >
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 blur-[2px]" />
        <div className="absolute inset-1 flex items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-white">
          <LogoMark width={30} height={30} />
        </div>
        <span className="absolute -top-1 right-0 text-lg">🔥</span>
      </div>
      <p className="mt-1 text-[22px] font-extrabold leading-tight tracking-tight">
        <span className="text-ink">Flavour</span>{" "}
        <span className="text-brand-500">Forge</span>
      </p>
      <p className="text-[10px] text-stone-500">From Cravings To Creations!</p>
    </button>
  );
}

function CartBadge({ count, small = false }) {
  if (!count) return null;
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-brand-500 font-bold text-white ${
        small ? "h-4 min-w-4 px-1 text-[9px]" : "h-6 min-w-6 px-1.5 text-xs"
      }`}
    >
      {count}
    </span>
  );
}

export function Sidebar({ view, onChange, cartCount }) {
  return (
    <aside
      aria-label="Main sidebar"
      className="relative hidden w-[190px] shrink-0 flex-col py-4 lg:flex"
    >
      <Logo onHome={() => onChange("home")} />
      <nav
        aria-label="Main navigation"
        className="mt-7 flex flex-col gap-5 pr-3"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 px-5 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400">
              {group.label}
            </p>
            {group.items.map(({ key, label, icon: Icon }) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange(key)}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex w-full items-center gap-3 rounded-xl px-5 py-2.5 text-left text-[14px] transition-colors duration-300 ${
                    active
                      ? "bg-brand-50 font-semibold text-brand-600 shadow-sm"
                      : "text-stone-600 hover:bg-white/70 hover:text-ink"
                  }`}
                >
                  {active && (
                    <span className="absolute -left-2 bottom-2 top-2 w-1 rounded-r bg-brand-500" />
                  )}
                  <Icon width={20} height={20} />
                  <span className="flex-1 whitespace-nowrap">{label}</span>
                  {key === "cart" && <CartBadge count={cartCount} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="relative mt-auto pb-6 pt-8">
        <span className="leaf -left-6 top-0 h-24 w-12 rotate-[25deg] bg-orange-200/60" />
        <span className="leaf left-16 top-8 h-14 w-7 -rotate-[30deg] bg-green-200/60" />
        <span className="leaf -left-2 bottom-10 h-20 w-10 rotate-[70deg] bg-brand-300/50" />
        <p className="font-display relative px-5 text-[23px] font-bold leading-tight text-ink">
          Good Food
          <br />
          Forges
          <br />
          Happier Days.
        </p>
        <div className="relative mt-6 flex items-end gap-1 px-5 text-3xl">
          <span>🥣</span>
          <span className="text-2xl">🌿</span>
        </div>
      </div>
    </aside>
  );
}

// Desktop: appears once the user has scrolled past the top navigation.
export function ScrollDock({ view, onChange, cartCount, visible }) {
  return (
    <nav
      aria-label="Quick navigation"
      aria-hidden={!visible}
      className={`fixed bottom-5 left-1/2 z-40 hidden max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-[22px] border border-orange-100 bg-white/95 px-2 py-2 shadow-[0_18px_55px_rgba(50,30,15,0.2)] backdrop-blur-xl transition-[opacity,transform,visibility] duration-500 ease-out lg:flex ${
        visible
          ? "visible translate-y-0 opacity-100"
          : "invisible pointer-events-none translate-y-8 opacity-0"
      }`}
    >
      {NAV_GROUPS.map((group, groupIndex) => (
        <div key={group.label} className="flex shrink-0 items-center gap-1">
          {groupIndex > 0 && (
            <span aria-hidden className="mx-1 h-7 w-px bg-orange-100" />
          )}
          {group.items.map(({ key, compact, label, icon: Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                title={label}
                tabIndex={visible ? 0 : -1}
                aria-current={active ? "page" : undefined}
                onClick={() => onChange(key)}
                className={`relative flex min-w-[70px] flex-col items-center gap-0.5 rounded-[15px] px-2 py-1.5 text-[11px] font-medium transition-colors duration-300 ${
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-stone-600 hover:bg-orange-50 hover:text-brand-600"
                }`}
              >
                <Icon width={19} height={19} />
                <span className="whitespace-nowrap">{compact}</span>
                {key === "cart" && cartCount > 0 && (
                  <span className="absolute right-1 top-0">
                    <CartBadge count={cartCount} small />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function MobileNav({ view, onChange, cartCount }) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-orange-100 bg-white/95 px-2 py-2 backdrop-blur lg:hidden"
    >
      {MOBILE_ITEMS.map(({ key, compact, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-current={view === key ? "page" : undefined}
          className={`relative flex min-w-12 flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] ${view === key ? "text-brand-600" : "text-stone-500"}`}
        >
          <Icon width={20} height={20} />
          {compact}
          {key === "cart" && cartCount > 0 && (
            <span className="absolute -right-0.5 -top-1">
              <CartBadge count={cartCount} small />
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
