"use client";

import {
  ChevronDown,
  FilterIcon,
  LogoMark,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "@/components/ui/icons";
import { Logo } from "@/components/layout/Sidebar";

export function TopBar({
  search,
  onSearch,
  onToggleFilters,
  user,
  onProfile,
  onHome,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="relative flex min-w-0 items-center gap-2 py-3 sm:gap-3">
      <div className="hidden lg:hidden sm:block">
        <Logo onHome={onHome} />
      </div>
      <button
        type="button"
        onClick={onHome}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm sm:hidden"
        aria-label="Flavour Forge — go to Home"
      >
        <LogoMark width={26} height={26} />
      </button>
      <div className="relative flex min-w-0 flex-1 items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:px-5 sm:py-3">
        <SearchIcon className="text-brand-500" width={22} height={22} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search for recipes, ingredients or cuisines..."
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-stone-400 sm:text-[15px]"
        />
        <button
          onClick={onToggleFilters}
          className="rounded-full p-1 text-stone-600 hover:bg-orange-50"
          aria-label="Filters"
        >
          <FilterIcon width={22} height={22} />
        </button>
      </div>

      <div className="pointer-events-none absolute right-[330px] top-0 hidden select-none text-2xl xl:flex xl:gap-1">
        <span className="rotate-12 text-green-300">🍃</span>
        <span className="-rotate-12 text-orange-300">🍂</span>
        <span className="rotate-45">🍃</span>
      </div>

      <button
        onClick={onToggleTheme}
        aria-label={
          theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
        }
        title={theme === "dark" ? "Light theme" : "Dark theme"}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-white text-stone-600 shadow-sm transition-colors duration-500 hover:text-brand-600 sm:h-12 sm:w-12"
      >
        <span className="relative h-[22px] w-[22px]">
          <SunIcon
            width={22}
            height={22}
            className={`absolute inset-0 transition-[opacity,transform] duration-500 ${theme === "dark" ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
          />
          <MoonIcon
            width={22}
            height={22}
            className={`absolute inset-0 transition-[opacity,transform] duration-500 ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
          />
        </span>
      </button>

      <button
        onClick={onProfile}
        aria-label="Open profile"
        className="flex shrink-0 items-center gap-3 rounded-full border border-orange-100 bg-white p-1 shadow-sm transition-colors duration-500 hover:border-brand-200 sm:py-1.5 sm:pl-1.5 sm:pr-4"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-200 to-brand-400 text-base font-bold text-white">
          {user?.fullName.charAt(0).toUpperCase() ?? "G"}
        </span>
        <span className="hidden max-w-[130px] truncate text-[15px] font-semibold sm:inline">
          {user ? `Hi, ${user.fullName.split(" ")[0]}` : "Guest"}
        </span>
        <ChevronDown
          width={18}
          height={18}
          className="hidden text-stone-500 sm:block"
        />
      </button>
    </header>
  );
}
