import {
  BoxIcon,
  CartIcon,
  HeartIcon,
  HomeIcon,
  RecipesIcon,
  UserIcon,
} from "@/components/ui/icons";

// Shared links for the desktop sidebar, scroll dock and mobile bottom bar.
export const NAV_GROUPS = [
  {
    label: "Explore",
    items: [
      { key: "home", label: "Home", compact: "Home", icon: HomeIcon },
      {
        key: "recipes",
        label: "Recipes",
        compact: "Recipes",
        icon: RecipesIcon,
      },
      {
        key: "shop",
        label: "Shop Ingredients",
        compact: "Shop",
        icon: CartIcon,
      },
    ],
  },
  {
    label: "Your space",
    items: [
      { key: "cart", label: "My Cart", compact: "Cart", icon: CartIcon },
      { key: "orders", label: "My Orders", compact: "Orders", icon: BoxIcon },
      {
        key: "favorites",
        label: "Saved recipes",
        compact: "Saved recipes",
        icon: HeartIcon,
      },
      { key: "profile", label: "Profile", compact: "Profile", icon: UserIcon },
    ],
  },
];

export const MOBILE_ITEMS = NAV_GROUPS.flatMap((group) => group.items).filter(
  ({ key }) => ["home", "recipes", "shop", "cart", "favorites"].includes(key),
);
