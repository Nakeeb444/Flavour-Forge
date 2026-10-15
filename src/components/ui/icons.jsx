export const LogoMark = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 20h10v-5.3a5 5 0 1 0-1.2-9.2A5 5 0 0 0 7.5 5.4 4.5 4.5 0 1 0 7 14.6V20Z" />
  </svg>
);

const base = (p) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...p,
});

export const HomeIcon = (p) => (
  <svg {...base(p)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </svg>
);
export const RecipesIcon = (p) => (
  <svg {...base(p)}>
    <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10" />
    <path d="M17 3c-2 0-3 3-3 6s1 3 3 3v9" />
  </svg>
);
export const CartIcon = (p) => (
  <svg {...base(p)}>
    <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.7L20 8H6" />
    <circle cx="9.5" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </svg>
);
export const BoxIcon = (p) => (
  <svg {...base(p)}>
    <path d="M3 8 12 3l9 5-9 5-9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);
export const HeartIcon = (p) => {
  const { filled, ...rest } = p;
  return (
    <svg {...base(rest)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3.5A5 5 0 0 1 21 11c-2 4.6-9 9-9 9Z" />
    </svg>
  );
};
export const UserIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const SearchIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const FilterIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="9" cy="6" r="2" fill="white" />
    <circle cx="15" cy="12" r="2" fill="white" />
    <circle cx="10" cy="18" r="2" fill="white" />
  </svg>
);
export const ChevronDown = (p) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const ChevronRight = (p) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const ArrowRight = (p) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ClockIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const UsersIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4.5-6.2" />
  </svg>
);
export const BarsIcon = (p) => (
  <svg {...base(p)}>
    <path d="M5 20v-5M12 20V9M19 20V4" strokeWidth={2.6} />
  </svg>
);
export const PlusIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = (p) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);
export const TrashIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
export const CloseIcon = (p) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const PotIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6Z" />
    <path d="M2 10h20M9 10V7h6v3" />
  </svg>
);
export const CheckIcon = (p) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);
export const ChefHatIcon = (p) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M7 20h10v-5.3a5 5 0 1 0-1.2-9.2A5 5 0 0 0 7.5 5.4 4.5 4.5 0 1 0 7 14.6V20Z" />
  </svg>
);
export const SunIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const MoonIcon = (p) => (
  <svg {...base(p)}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
);
export const HeadsetIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M4 13h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5ZM20 13h-2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5Z" />
    <path d="M18 19a3 3 0 0 1-3 2h-2" />
  </svg>
);
export const DocumentIcon = (p) => (
  <svg {...base(p)}>
    <path d="M7 3h7l5 5v13H7V3Z" />
    <path d="M14 3v5h5M10 13h6M10 17h6" />
  </svg>
);
export const MailIcon = (p) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const PhoneIcon = (p) => (
  <svg {...base(p)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
